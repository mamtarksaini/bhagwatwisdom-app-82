
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemSolver } from "@/components/features/ProblemSolver";
import { DreamInterpreter } from "@/components/features/DreamInterpreter";
import { MoodMantra } from "@/components/features/MoodMantra";
import { DailyVerse } from "@/components/features/DailyVerse";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { BookOpen, Moon, Sun, Heart, Globe } from "lucide-react";
import { Language } from "@/types";

const Index = () => {
  const [language, setLanguage] = useState<Language>("english");

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gradient">
                Bhagwat Wisdom
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Ancient wisdom from Bhagavad Gita for modern life problems. Discover spiritual guidance, dream interpretations, and daily mantras.
              </p>
            </div>
            <div className="space-x-4">
              <Button className="button-gradient">Get Started</Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Language Selector */}
      <section className="w-full pb-8">
        <div className="container px-4 md:px-6 flex justify-center">
          <div className="w-full max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Select Language</span>
            </div>
            <LanguagePicker value={language} onValueChange={setLanguage} />
          </div>
        </div>
      </section>

      {/* Features Tabs */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-10">
            <h2 className="text-3xl font-heading font-bold tracking-tighter sm:text-4xl">
              Spiritual Guidance
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              Explore various features that provide spiritual insights based on Bhagavad Gita teachings.
            </p>
          </div>
          
          <Tabs defaultValue="daily-verse" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="daily-verse" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Daily Verse</span>
              </TabsTrigger>
              <TabsTrigger value="problem-solver" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Problem Solver</span>
              </TabsTrigger>
              <TabsTrigger value="dream" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Dream Interpretation</span>
              </TabsTrigger>
              <TabsTrigger value="mantra" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Mood Mantra</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6 rounded-md border">
              <TabsContent value="daily-verse" className="mt-0">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Daily Verse</CardTitle>
                    <CardDescription>Wisdom from Bhagavad Gita for your daily inspiration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DailyVerse language={language} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="problem-solver" className="mt-0">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Problem Solver</CardTitle>
                    <CardDescription>Find solutions to your problems based on Bhagavad Gita teachings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProblemSolver language={language} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="dream" className="mt-0">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Dream Interpreter</CardTitle>
                    <CardDescription>Understand the spiritual meaning behind your dreams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DreamInterpreter language={language} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="mantra" className="mt-0">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Mood Mantra</CardTitle>
                    <CardDescription>Receive a personalized mantra based on your current mood</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MoodMantra language={language} />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-10">
            <h2 className="text-3xl font-heading font-bold tracking-tighter sm:text-4xl">
              Spiritual Journeys
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              Read how Bhagwat Wisdom has transformed lives through ancient teachings.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">{String.fromCharCode(64 + i)}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Devotee {i}</CardTitle>
                      <CardDescription>Spiritual Seeker</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "The Bhagwat Wisdom app has been a guiding light in my spiritual journey. The daily verses and problem-solving features have helped me navigate life's challenges with peace and clarity."
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
