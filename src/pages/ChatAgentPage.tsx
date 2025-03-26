
import React, { useState, useRef } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Language } from "@/types";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { SendIcon, RefreshCw, Globe } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { callGeminiDirectly } from "@/lib/wisdom/geminiApi";
import { useToast } from "@/hooks/use-toast";

export function ChatAgentPage() {
  const [language, setLanguage] = useState<Language>("english");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    {
      role: 'assistant',
      content: 'Namaste 🙏 I am your Bhagavad Wisdom chat guide. How may I assist you on your spiritual journey today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Create a prompt that instructs Gemini to respond in the style of Bhagavad Gita wisdom
      const prompt = `You are a spiritual guide who offers wisdom based on the Bhagavad Gita. 
      Your responses should incorporate teachings from the Gita while being compassionate and insightful.
      Respond to the following message in ${language}: "${userMessage}"
      Keep your response concise and under 150 words.`;
      
      // Get response from Gemini API
      const response = await callGeminiDirectly(prompt);
      
      if (response) {
        // Add AI response to chat
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      } else {
        throw new Error("Failed to get response from wisdom service");
      }
    } catch (error) {
      console.error("Error getting chat response:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Scroll to the bottom after message is added
      setTimeout(scrollToBottom, 100);
    }
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <PageLayout
      title="Chat Agent"
      description="Have a conversation with an AI guide inspired by the Bhagavad Gita"
    >
      <div className="space-y-6">
        <Alert variant="default" className="bg-amber-500/10 border border-amber-500/30 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            Ask any question about life, spirituality, purpose, or seek guidance based on Bhagavad Gita's teachings.
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Select Language</span>
        </div>
        
        <div className="w-full max-w-xs mb-8">
          <LanguagePicker value={language} onValueChange={setLanguage} />
        </div>
        
        <div className="flex flex-col h-[400px] md:h-[500px] border rounded-lg overflow-hidden bg-background">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
