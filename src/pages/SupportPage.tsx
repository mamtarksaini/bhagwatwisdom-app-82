
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const SupportPage = () => {
  const [issueType, setIssueType] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    description: "",
    priority: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handlePriorityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, priority: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Support ticket submitted",
        description: "We'll get back to you as soon as possible.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        description: "",
        priority: "medium"
      });
      setIssueType("");
    } catch (error) {
      toast({
        title: "Failed to submit ticket",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Common issues for quick help
  const commonIssues = [
    {
      id: "account",
      title: "Account Issues",
      items: [
        {
          question: "I forgot my password. How do I reset it?",
          answer: "You can reset your password by clicking the 'Forgot Password' link on the login page. You will receive an email with instructions to create a new password."
        },
        {
          question: "How do I update my profile information?",
          answer: "Go to Profile > Edit Profile to update your personal information, including name, email, and profile picture."
        },
        {
          question: "I'm having trouble logging in.",
          answer: "Make sure you're using the correct email and password. If you continue to experience issues, try clearing your browser cache or use the password reset option."
        }
      ]
    },
    {
      id: "subscription",
      title: "Subscription & Billing",
      items: [
        {
          question: "How do I cancel my premium subscription?",
          answer: "Go to Profile > Subscription > Manage > Cancel Subscription. Your subscription will remain active until the end of your current billing period."
        },
        {
          question: "I was charged twice for my subscription.",
          answer: "Please contact our support team with your account details and transaction information. We'll investigate and process a refund if there was an error."
        },
        {
          question: "How do I update my payment method?",
          answer: "Go to Profile > Subscription > Payment Methods to add, update, or remove payment methods."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Issues",
      items: [
        {
          question: "The app is crashing or freezing.",
          answer: "Try restarting the app or your device. If the problem persists, make sure you have the latest version installed and sufficient storage space on your device."
        },
        {
          question: "I can't access premium features after subscribing.",
          answer: "Try logging out and back in. If the issue continues, check your subscription status in Profile > Subscription to ensure your payment was processed successfully."
        },
        {
          question: "Content isn't loading properly.",
          answer: "Check your internet connection. If you're using a VPN, try disabling it temporarily. Clearing your browser cache or app data may also help resolve loading issues."
        }
      ]
    }
  ];

  return (
    <PageLayout
      title="Support Center"
      description="Get help with any questions or issues you might have."
    >
      <Tabs defaultValue="help" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>Quick Help</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Contact Support</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Service Status</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Quick Help Tab */}
        <TabsContent value="help">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {commonIssues.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>Commonly asked questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, index) => (
                        <AccordionItem key={index} value={`${category.id}-${index}`}>
                          <AccordionTrigger className="text-left text-sm">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground">{item.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center pt-4">
              <p className="mb-4 text-muted-foreground">
                Need more detailed information? Check our comprehensive FAQ section.
              </p>
              <Button asChild>
                <Link to="/faq">Visit FAQ Page</Link>
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Contact Support Tab */}
        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Ticket</CardTitle>
                  <CardDescription>
                    Our support team will respond within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="issueType">Issue Type</Label>
                        <Select
                          value={issueType}
                          onValueChange={(value) => setIssueType(value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select the type of issue" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="account">Account Issue</SelectItem>
                            <SelectItem value="billing">Billing/Subscription</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="content">Content Issue</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Describe the Issue</Label>
                        <Textarea
                          id="description"
                          name="description"
                          rows={5}
                          value={formData.description}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <RadioGroup
                          value={formData.priority}
                          onValueChange={handlePriorityChange}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="low" id="low" />
                            <Label htmlFor="low" className="cursor-pointer">Low</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high" className="cursor-pointer">High</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto button-gradient" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Standard Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday<br />
                        9:00 AM - 6:00 PM IST
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Premium Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Monday - Sunday<br />
                        24/7 Priority Response
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li>
                      <Link to="/documentation" className="text-primary hover:underline block">
                        Documentation
                      </Link>
                    </li>
                    <li>
                      <Link to="/faq" className="text-primary hover:underline block">
                        Frequently Asked Questions
                      </Link>
                    </li>
                    <li>
                      <Link to="/blog" className="text-primary hover:underline block">
                        Blog & Tutorials
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Service Status Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current status of all Bhagwat Wisdom services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Web Application</h3>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Operational</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Last updated: Today, 10:00 AM</p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Mobile App</h3>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Operational</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Last updated: Today, 10:00 AM</p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">API Services</h3>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Operational</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Last updated: Today, 10:00 AM</p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Authentication</h3>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Operational</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Last updated: Today, 10:00 AM</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-4">Recent Incidents</h3>
                  <div className="text-center p-6 bg-secondary/30 rounded-md">
                    <p className="text-muted-foreground">No incidents reported in the last 7 days.</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    If you're experiencing issues that are not reflected in our status page, please submit a support ticket.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default SupportPage;
