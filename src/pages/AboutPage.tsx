
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

const AboutPage = () => {
  // Team members data
  const team = [
    {
      name: "Rahul Sharma",
      role: "Founder & Spiritual Guide",
      bio: "A lifelong student of Bhagavad Gita with over 20 years of experience teaching spiritual wisdom."
    },
    {
      name: "Priya Patel",
      role: "Content Director",
      bio: "Sanskrit scholar and translator with expertise in making ancient texts accessible to modern audiences."
    },
    {
      name: "Amit Verma",
      role: "Technology Lead",
      bio: "Combines technical expertise with spiritual knowledge to create meaningful digital experiences."
    }
  ];

  return (
    <PageLayout
      title="About Us"
      description="Learn about our mission to bring ancient wisdom to modern life."
    >
      <div className="space-y-12">
        {/* Mission Section */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Our Mission</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              At Bhagwat Wisdom, we bridge the timeless teachings of the Bhagavad Gita with the challenges of contemporary life. Our mission is to make ancient wisdom accessible, practical, and relevant for people from all walks of life, regardless of their spiritual background.
            </p>
            <p>
              We believe that the principles found in these sacred texts offer profound guidance for navigating modern complexities—from managing stress and anxiety to finding purpose and building meaningful relationships.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Our Story</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Bhagwat Wisdom began in 2018 as a small community of spiritual seekers gathering to discuss the Bhagavad Gita's teachings. What started as weekend study sessions in a small room in Mumbai soon expanded as more people found value in applying these ancient principles to their daily challenges.
            </p>
            <p>
              Recognizing the need to make this wisdom more widely accessible, we developed digital tools to help people find spiritual solutions to everyday problems. Our platform has since grown to serve thousands of seekers worldwide, offering personalized guidance through our Problem Solver, Dream Interpreter, and other specialized features.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-6">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold text-xl">{member.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-heading font-bold text-xl mb-1">{member.name}</h3>
                    <p className="text-primary text-sm mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-6">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-heading font-semibold text-lg mb-2">Authenticity</h3>
                <p className="text-muted-foreground">
                  We maintain the integrity of ancient teachings while making them relevant to modern contexts.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-heading font-semibold text-lg mb-2">Accessibility</h3>
                <p className="text-muted-foreground">
                  We present profound wisdom in simple, practical ways that anyone can understand and apply.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-heading font-semibold text-lg mb-2">Inclusivity</h3>
                <p className="text-muted-foreground">
                  We welcome seekers from all backgrounds, traditions, and levels of spiritual understanding.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-heading font-semibold text-lg mb-2">Transformation</h3>
                <p className="text-muted-foreground">
                  We focus on practical application that leads to positive change in everyday life.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Community Impact */}
        <section className="text-center bg-secondary/50 p-8 rounded-lg">
          <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold mb-3">Our Impact</h2>
          <p className="text-lg max-w-2xl mx-auto">
            Since our founding, we've helped over 50,000 individuals apply ancient wisdom to modern challenges, conducted 200+ workshops, and built a community of spiritual seekers across 30+ countries.
          </p>
        </section>
      </div>
    </PageLayout>
  );
};

export default AboutPage;
