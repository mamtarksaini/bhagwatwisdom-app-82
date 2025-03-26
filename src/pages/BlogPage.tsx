
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  slug: string;
}

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample blog posts data
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Finding Inner Peace: Lessons from Chapter 2 of Bhagavad Gita",
      excerpt: "Explore how the teachings of Sthitaprajna (the person of steady wisdom) can help you maintain calm in today's chaotic world.",
      date: "June 15, 2023",
      category: "spiritual-growth",
      readTime: "7 min read",
      slug: "finding-inner-peace"
    },
    {
      id: 2,
      title: "Karma Yoga: The Path of Selfless Action in Modern Life",
      excerpt: "Discover how to apply the principle of detachment from results while maintaining excellence in your work and daily activities.",
      date: "May 22, 2023",
      category: "practical-wisdom",
      readTime: "5 min read",
      slug: "karma-yoga-modern-life"
    },
    {
      id: 3,
      title: "Understanding the Symbolism in Your Dreams: A Spiritual Perspective",
      excerpt: "Learn how traditional Vedic dream interpretation can provide insights into your subconscious mind and spiritual journey.",
      date: "April 10, 2023",
      category: "dream-analysis",
      readTime: "6 min read",
      slug: "dream-symbolism"
    },
    {
      id: 4,
      title: "The Power of Mantras: Science Meets Spirituality",
      excerpt: "Explore the neurological and psychological effects of mantra recitation, and how modern science validates ancient practices.",
      date: "March 28, 2023",
      category: "mantras",
      readTime: "8 min read",
      slug: "power-of-mantras"
    },
    {
      id: 5,
      title: "Overcoming Anxiety with Bhagavad Gita's Wisdom",
      excerpt: "Practical techniques from the Gita to manage anxiety, worry, and stress in your daily life.",
      date: "February 15, 2023",
      category: "mental-wellbeing",
      readTime: "6 min read",
      slug: "overcoming-anxiety"
    },
    {
      id: 6,
      title: "The Four Yogas: Finding Your Spiritual Path",
      excerpt: "Understanding Karma, Bhakti, Jnana, and Raja Yoga to discover which spiritual approach resonates most with your personality.",
      date: "January 30, 2023",
      category: "spiritual-growth",
      readTime: "9 min read",
      slug: "four-yogas"
    }
  ];

  const filteredPosts = blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categories for the tabs
  const categories = [
    { id: "all", name: "All Posts" },
    { id: "spiritual-growth", name: "Spiritual Growth" },
    { id: "practical-wisdom", name: "Practical Wisdom" },
    { id: "mental-wellbeing", name: "Mental Wellbeing" },
    { id: "mantras", name: "Mantras" },
    { id: "dream-analysis", name: "Dream Analysis" }
  ];

  return (
    <PageLayout
      title="Wisdom Blog"
      description="Insights and practical guidance from the teachings of Bhagavad Gita."
    >
      <div className="space-y-8">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search articles..."
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

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-3 md:grid-cols-6">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Posts Tab Content */}
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found matching your search.</p>
              </div>
            )}
          </TabsContent>

          {/* Category Tab Contents */}
          {categories.slice(1).map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts
                  .filter((post) => post.category === category.id)
                  .map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
              </div>
              
              {filteredPosts.filter((post) => post.category === category.id).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No articles found matching your search in this category." 
                      : "No articles found in this category."}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Newsletter Signup */}
        <div className="bg-secondary/50 p-8 rounded-lg text-center mt-12">
          <h2 className="text-xl font-heading font-bold mb-3">Receive Weekly Wisdom</h2>
          <p className="mb-6 max-w-lg mx-auto">
            Subscribe to our newsletter for weekly insights, practical wisdom, and spiritual guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input placeholder="Your email address" type="email" />
            <Button className="button-gradient whitespace-nowrap">Subscribe</Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

const BlogPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <Card className="glass-card overflow-hidden flex flex-col h-full">
      <CardContent className="pt-6 flex-grow">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>
        <h3 className="font-heading font-bold text-xl mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-4">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="pt-0 pb-6">
        <div className="flex justify-between items-center w-full">
          <span className="text-xs bg-secondary px-3 py-1 rounded-full capitalize">
            {post.category.replace(/-/g, ' ')}
          </span>
          <Button variant="link" asChild className="text-primary p-0">
            <Link to={`/blog/${post.slug}`}>Read more</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogPage;
