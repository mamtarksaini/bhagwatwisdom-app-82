
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Search, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface DocSection {
  id: string;
  title: string;
  content: string;
}

interface DocCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  sections: DocSection[];
}

const DocumentationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Example documentation categories and sections
  const docCategories: DocCategory[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Book className="h-5 w-5" />,
      sections: [
        {
          id: "introduction",
          title: "Introduction to Bhagwat Wisdom",
          content: `
            <h3>Welcome to Bhagwat Wisdom</h3>
            <p>Bhagwat Wisdom is a platform designed to bring the ancient teachings of the Bhagavad Gita into modern life contexts. Our app provides spiritual guidance for everyday challenges, dream interpretation based on Vedic wisdom, and mood-enhancing mantras.</p>
            
            <h4>Key Features</h4>
            <ul>
              <li><strong>Problem Solver:</strong> Get spiritual guidance for your personal challenges</li>
              <li><strong>Dream Interpreter:</strong> Understand the spiritual significance of your dreams</li>
              <li><strong>Mood Mantras:</strong> Receive mood-specific mantras to elevate your consciousness</li>
              <li><strong>Daily Verses:</strong> Start your day with wisdom from the Bhagavad Gita</li>
            </ul>
            
            <p>This documentation will help you navigate through our features and make the most of your spiritual journey with Bhagwat Wisdom.</p>
          `
        },
        {
          id: "account-setup",
          title: "Creating an Account",
          content: `
            <h3>Setting Up Your Account</h3>
            <p>To get started with Bhagwat Wisdom, you'll need to create an account:</p>
            
            <ol>
              <li>Click on "Sign Up" in the top right corner of the homepage</li>
              <li>Enter your email address and create a password</li>
              <li>Fill in basic profile information (name, birth date)</li>
              <li>Select your preferred language for spiritual guidance</li>
              <li>Complete your registration</li>
            </ol>
            
            <h4>Verification</h4>
            <p>After registration, check your email for a verification link. Clicking this link will activate your account and provide full access to basic features.</p>
            
            <h4>Profile Customization</h4>
            <p>Once your account is set up, you can customize your profile by adding a profile picture and setting your spiritual preferences to receive more tailored guidance.</p>
          `
        },
        {
          id: "navigation",
          title: "Navigating the Platform",
          content: `
            <h3>Platform Navigation Guide</h3>
            <p>Understanding the layout of Bhagwat Wisdom will help you access its features efficiently:</p>
            
            <h4>Home Page</h4>
            <p>The home page features all primary tools in a tabbed interface:</p>
            <ul>
              <li>Daily Verse tab - Your spiritual thought for the day</li>
              <li>Problem Solver tab - Submit your challenges for guidance</li>
              <li>Dream Interpreter tab - Record and analyze your dreams</li>
              <li>Mood Mantra tab - Get mantras based on your current mood</li>
            </ul>
            
            <h4>Main Navigation</h4>
            <p>The top navigation bar provides quick access to:</p>
            <ul>
              <li>Home - Return to the main page</li>
              <li>Profile - Access your personal settings and saved wisdom</li>
              <li>Premium - Upgrade to premium features</li>
              <li>Language selection - Change your content language</li>
              <li>Theme toggle - Switch between light and dark modes</li>
            </ul>
            
            <p>You can access additional resources through the footer links, including this documentation, support pages, and community forums.</p>
          `
        }
      ]
    },
    {
      id: "features",
      title: "Using Features",
      icon: <Book className="h-5 w-5" />,
      sections: [
        {
          id: "problem-solver",
          title: "Problem Solver Guide",
          content: `
            <h3>Using the Problem Solver</h3>
            <p>The Problem Solver is designed to provide spiritual guidance for your personal challenges:</p>
            
            <h4>How to Submit a Problem</h4>
            <ol>
              <li>Navigate to the Problem Solver tab on the home page</li>
              <li>Type your problem or question in the input field</li>
              <li>Be specific about your situation for more relevant guidance</li>
              <li>Click "Submit" to receive wisdom</li>
            </ol>
            
            <h4>Understanding Your Results</h4>
            <p>Each response contains:</p>
            <ul>
              <li><strong>Gita Verse:</strong> A relevant verse from the Bhagavad Gita</li>
              <li><strong>Interpretation:</strong> How this teaching applies to your situation</li>
              <li><strong>Practical Steps:</strong> Suggested actions based on the wisdom</li>
              <li><strong>Reflection Questions:</strong> Prompts to deepen your understanding</li>
            </ul>
            
            <h4>Saving and Sharing Wisdom</h4>
            <p>You can save responses to your profile by clicking the bookmark icon, or share them via email or social media using the share button.</p>
            
            <p><strong>Note:</strong> Premium members receive more detailed responses and unlimited problem submissions.</p>
          `
        },
        {
          id: "dream-interpreter",
          title: "Dream Interpreter Guide",
          content: `
            <h3>Using the Dream Interpreter</h3>
            <p>Our Dream Interpreter provides spiritual interpretations based on Vedic wisdom:</p>
            
            <h4>Recording Your Dream</h4>
            <ol>
              <li>Navigate to the Dream Interpreter tab</li>
              <li>Describe your dream in as much detail as you remember</li>
              <li>Include key elements, emotions, and symbols</li>
              <li>Click "Interpret Dream" to receive insights</li>
            </ol>
            
            <h4>Interpretation Components</h4>
            <p>Your dream interpretation includes:</p>
            <ul>
              <li><strong>Symbolic Analysis:</strong> Meanings of key symbols in your dream</li>
              <li><strong>Spiritual Significance:</strong> How the dream relates to your spiritual journey</li>
              <li><strong>Traditional Vedic Perspective:</strong> Traditional interpretations from Vedic texts</li>
              <li><strong>Guidance:</strong> Suggested reflections or actions based on the dream</li>
            </ul>
            
            <h4>Dream Journal</h4>
            <p>Premium users can access their Dream Journal, which stores past dreams and interpretations, allowing you to identify patterns in your subconscious over time.</p>
          `
        },
        {
          id: "mood-mantras",
          title: "Mood Mantras Guide",
          content: `
            <h3>Using Mood Mantras</h3>
            <p>Mood Mantras provide personalized spiritual sound vibrations to elevate your consciousness based on your current emotional state:</p>
            
            <h4>Receiving a Mantra</h4>
            <ol>
              <li>Go to the Mood Mantra tab on the home page</li>
              <li>Select your current mood from the available options</li>
              <li>Alternatively, describe your mood in the text field</li>
              <li>Click "Get Mantra" to receive your personalized mantra</li>
            </ol>
            
            <h4>Mantra Components</h4>
            <p>Each mantra response includes:</p>
            <ul>
              <li><strong>Sanskrit Mantra:</strong> The original Sanskrit text</li>
              <li><strong>Pronunciation Guide:</strong> How to properly recite the mantra</li>
              <li><strong>Translation:</strong> The meaning in your preferred language</li>
              <li><strong>Benefits:</strong> How this mantra can help with your current mood</li>
              <li><strong>Practice Guide:</strong> Suggested times and methods for recitation</li>
            </ul>
            
            <h4>Audio Recitation</h4>
            <p>Click the play button to hear the proper pronunciation of the mantra. Premium users can download audio recitations for offline use.</p>
          `
        }
      ]
    },
    {
      id: "account",
      title: "Account Management",
      icon: <Book className="h-5 w-5" />,
      sections: [
        {
          id: "premium",
          title: "Premium Subscription",
          content: `
            <h3>Premium Subscription Benefits</h3>
            <p>Upgrading to Premium unlocks the full potential of Bhagwat Wisdom:</p>
            
            <h4>Premium Features</h4>
            <ul>
              <li><strong>Unlimited Problem Solving:</strong> No daily limits on problem submissions</li>
              <li><strong>Detailed Guidance:</strong> Expanded wisdom responses with deeper insights</li>
              <li><strong>Dream Journal:</strong> Store and track your dreams and interpretations over time</li>
              <li><strong>Mantra Library:</strong> Access to the complete collection of 500+ mantras</li>
              <li><strong>Audio Recitations:</strong> Download high-quality audio of all mantras</li>
              <li><strong>Ad-Free Experience:</strong> No advertisements throughout the platform</li>
              <li><strong>Priority Support:</strong> Faster response times from our support team</li>
            </ul>
            
            <h4>Subscription Options</h4>
            <p>Choose from monthly (₹499/month) or annual (₹4,999/year) subscription plans. Annual subscribers save approximately 20% compared to the monthly plan.</p>
            
            <h4>How to Upgrade</h4>
            <ol>
              <li>Click on "Premium" in the navigation bar</li>
              <li>Select your preferred subscription plan</li>
              <li>Complete the payment process</li>
              <li>Enjoy immediate access to all premium features</li>
            </ol>
            
            <p>See our <a href="/refund">Cancellation & Refund Policy</a> for information about subscription management.</p>
          `
        },
        {
          id: "settings",
          title: "Account Settings",
          content: `
            <h3>Managing Your Account Settings</h3>
            <p>Customize your Bhagwat Wisdom experience through account settings:</p>
            
            <h4>Profile Settings</h4>
            <p>To access profile settings, click on your profile icon in the top navigation bar and select "Settings." From here you can:</p>
            <ul>
              <li>Update personal information (name, email, birth date)</li>
              <li>Change your profile picture</li>
              <li>Modify your password</li>
              <li>Set your default language preference</li>
            </ul>
            
            <h4>Notification Preferences</h4>
            <p>Manage which notifications you receive:</p>
            <ul>
              <li>Daily verse notifications</li>
              <li>Response notifications</li>
              <li>Email newsletters</li>
              <li>Special offers and updates</li>
            </ul>
            
            <h4>Privacy Controls</h4>
            <p>Adjust your privacy settings:</p>
            <ul>
              <li>Control data sharing preferences</li>
              <li>Manage saved wisdom visibility</li>
              <li>Download your personal data</li>
              <li>Delete your account</li>
            </ul>
            
            <p>All settings changes are saved automatically.</p>
          `
        },
        {
          id: "data",
          title: "Data and Privacy",
          content: `
            <h3>Your Data and Privacy</h3>
            <p>At Bhagwat Wisdom, we take your privacy seriously. Here's how we handle your information:</p>
            
            <h4>Data Collection</h4>
            <p>We collect and process:</p>
            <ul>
              <li>Account information (email, name, birthdate)</li>
              <li>Content you create (problems submitted, dreams recorded)</li>
              <li>Usage information (features used, time spent)</li>
              <li>Device information (type, operating system)</li>
            </ul>
            
            <h4>How We Use Your Data</h4>
            <p>Your data helps us:</p>
            <ul>
              <li>Provide personalized spiritual guidance</li>
              <li>Improve our services and features</li>
              <li>Send relevant notifications</li>
              <li>Maintain and secure your account</li>
            </ul>
            
            <h4>Your Data Controls</h4>
            <p>You can:</p>
            <ul>
              <li>Download all your data from Account Settings</li>
              <li>Delete specific entries from your history</li>
              <li>Request complete account deletion</li>
              <li>Opt out of analytics and tracking</li>
            </ul>
            
            <p>For complete details, please refer to our <a href="/privacy">Privacy Policy</a>.</p>
          `
        }
      ]
    }
  ];

  // Find all sections across all categories
  const allSections = docCategories.flatMap(category => category.sections);
  
  // Filter sections based on search query
  const filteredSections = searchQuery
    ? allSections.filter(
        section =>
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Set initial active section
  useEffect(() => {
    if (docCategories.length > 0 && docCategories[0].sections.length > 0) {
      setActiveSection(docCategories[0].sections[0].id);
    }
  }, []);

  // Handle section selection
  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  // Find the active section object
  const activeSectionObj = allSections.find(section => section.id === activeSection);

  return (
    <PageLayout
      title="Documentation"
      description="Learn how to use Bhagwat Wisdom and get the most out of its features."
    >
      {/* Search Bar */}
      <div className="relative max-w-lg mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2"
            onClick={() => setSearchQuery("")}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Search Results</h2>
          {filteredSections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSections.map((section) => (
                <Card
                  key={section.id}
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => {
                    handleSectionClick(section.id);
                    setSearchQuery("");
                  }}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{section.title}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No results found. Try different keywords.</p>
          )}
        </div>
      )}

      {/* Main Documentation */}
      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <Tabs defaultValue={docCategories[0]?.id} className="w-full">
              <TabsList className="w-full grid grid-cols-3 md:flex md:flex-col">
                {docCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="md:justify-start md:h-auto md:py-2"
                  >
                    {category.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {docCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0 border-0">
                  <ScrollArea className="h-[calc(100vh-350px)]">
                    <div className="space-y-1 p-1">
                      {category.sections.map((section) => (
                        <Button
                          key={section.id}
                          variant={activeSection === section.id ? "secondary" : "ghost"}
                          className="w-full justify-start text-left p-2 h-auto"
                          onClick={() => handleSectionClick(section.id)}
                        >
                          {section.title}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-6">
                {activeSectionObj ? (
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: activeSectionObj.content }} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Select a topic from the sidebar to view documentation.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Need More Help Section */}
      <div className="mt-12 text-center">
        <h2 className="text-xl font-heading font-bold mb-3">Need More Help?</h2>
        <p className="text-muted-foreground mb-6">
          If you couldn't find what you're looking for, our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/faq">Frequently Asked Questions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/support">Contact Support</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default DocumentationPage;
