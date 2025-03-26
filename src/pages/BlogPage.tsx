
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, User } from "lucide-react";

const BlogPage = () => {
  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "Understanding Karma Yoga in Modern Life",
      excerpt: "How the principle of selfless action can transform your daily work experience.",
      date: "June 15, 2023",
      author: "Acharya Prashant",
      category: "Philosophy",
      readTime: "8 min read",
      image: "/lovable-uploads/c3d9b365-6fc8-4cba-bd7b-ea9317db1356.png"
    },
    {
      id: 2,
      title: "The Science of Meditation According to Bhagavad Gita",
      excerpt: "Ancient wisdom meets modern neuroscience in understanding the benefits of meditation.",
      date: "May 22, 2023",
      author: "Dr. Rita Sharma",
      category: "Meditation",
      readTime: "12 min read",
      image: "/lovable-uploads/c3d9b365-6fc8-4cba-bd7b-ea9317db1356.png"
    },
    {
      id: 3,
      title: "Finding Your Dharma: Purpose in the Modern World",
      excerpt: "Navigating career choices and life paths through the lens of Bhagavad Gita.",
      date: "April 10, 2023",
      author: "Swami Vivekananda",
      category: "Life Purpose",
      readTime: "10 min read",
      image: "/lovable-uploads/c3d9b365-6fc8-4cba-bd7b-ea9317db1356.png"
    },
    {
      id: 4,
      title: "Managing Emotions: Lessons from Arjuna's Dilemma",
      excerpt: "How to handle difficult emotions and moral conflicts using timeless wisdom.",
      date: "March 5, 2023",
      author: "Maya Patel",
      category: "Emotional Wellbeing",
      readTime: "7 min read",
      image: "/lovable-uploads/68d9ec0c-8fbe-494e-ae18-59650aec00e8.png"
    },
  ];

  return (
    <PageLayout
      title="Blog"
      description="Insights and reflections on applying Bhagavad Gita wisdom to modern life."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <Badge variant="secondary">{post.category}</Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              <CardTitle className="hover:text-primary transition-colors">
                <Link to={`/blog/${post.id}`}>{post.title}</Link>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <CalendarDays className="h-3 w-3" />
                {post.date} 
                <span className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {post.author}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{post.excerpt}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link to={`/blog/${post.id}`}>Read Article</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <Button>Load More Articles</Button>
      </div>
    </PageLayout>
  );
};

export default BlogPage;
