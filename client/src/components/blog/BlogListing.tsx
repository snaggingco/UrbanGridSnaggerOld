import React from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Blog posts metadata for listing page
const BLOG_POSTS = [
  {
    title: 'Property Snagging Prices in Dubai: A Comprehensive Guide',
    description: 'Learn about the typical costs for property snagging services in Dubai, ranging from AED 1,500 to AED 3,000 for standard properties.',
    slug: 'snagging-price-guide-dubai',
    publishDate: 'April 18, 2025',
    category: 'Pricing',
    minutesToRead: 8,
    featured: true
  },
  {
    title: 'Navigating Property Inspection Services in Dubai: A Buyer\'s Guide',
    description: 'Compare property inspection and snagging companies in Dubai to find the best service for your real estate investment.',
    slug: 'property-inspection-companies-dubai',
    publishDate: 'April 18, 2025',
    category: 'Guides',
    minutesToRead: 10,
    featured: true
  },
  {
    title: 'What is Property Snagging in Dubai? A Complete Guide',
    description: 'Understand property snagging services in Dubai, why they\'re essential for new property buyers, and how they can save you money on repairs.',
    slug: 'what-is-property-snagging-dubai',
    publishDate: 'April 18, 2025',
    category: 'Guides',
    minutesToRead: 12,
    featured: false
  },
  {
    title: 'How to Choose the Right Snagging Company in Dubai: 10 Critical Factors',
    description: 'Learn how to select the best property snagging service in Dubai with these 10 essential criteria for evaluating snagging companies.',
    slug: 'how-to-choose-snagging-company-dubai',
    publishDate: 'April 18, 2025',
    category: 'Guides',
    minutesToRead: 9,
    featured: false
  },
  {
    title: 'Complete Property Handover Inspection Checklist for Dubai Properties',
    description: 'A comprehensive checklist for Dubai property handovers covering all critical inspection points for apartments, villas, and townhouses.',
    slug: 'property-handover-inspection-checklist-dubai',
    publishDate: 'April 18, 2025',
    category: 'Checklists',
    minutesToRead: 14,
    featured: false
  },
  {
    title: '15 Most Common Defects Found in New Properties in Dubai',
    description: 'Discover the most frequent issues found during snagging inspections of new Dubai properties and how to ensure they\'re fixed under warranty.',
    slug: 'common-defects-new-properties-dubai',
    publishDate: 'April 18, 2025',
    category: 'Property Issues',
    minutesToRead: 11,
    featured: false
  },
  {
    title: 'Dubai Property Warranty Period Explained: Your Complete Guide',
    description: 'Everything Dubai property owners need to know about warranty periods, defect liability, and ensuring developers fulfill their obligations.',
    slug: 'dubai-property-warranty-period-explained',
    publishDate: 'April 18, 2025',
    category: 'Legal',
    minutesToRead: 10,
    featured: false
  }
];

const BlogListing: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Property Snagging Blog | Expert Advice from Urban Grid</title>
        <meta name="description" content="Expert advice on property snagging, inspection services, and real estate quality control in Dubai and the UAE." />
        <meta name="keywords" content="property snagging blog, dubai real estate advice, property inspection tips, property handover guide" />
        <link rel="canonical" href="https://snagging.me/blog" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Property Snagging Blog | Expert Advice from Urban Grid" />
        <meta property="og:description" content="Expert advice on property snagging, inspection services, and real estate quality control in Dubai and the UAE." />
        <meta property="og:url" content="https://snagging.me/blog" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Property Snagging Blog | Urban Grid" />
        <meta name="twitter:description" content="Expert advice on property snagging and inspection in Dubai" />
        
        {/* Blog Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "headline": "Property Snagging Blog | Expert Advice from Urban Grid",
            "description": "Expert advice on property snagging, inspection services, and real estate quality control in Dubai and the UAE.",
            "publisher": {
              "@type": "Organization",
              "name": "Urban Grid",
              "logo": {
                "@type": "ImageObject",
                "url": "https://snagging.me/logo.png"
              }
            },
            "url": "https://snagging.me/blog",
            "blogPost": BLOG_POSTS.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.description,
              "datePublished": post.publishDate,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://snagging.me/blog/${post.slug}`
              },
              "publisher": {
                "@type": "Organization",
                "name": "Urban Grid",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://snagging.me/logo.png"
                }
              }
            }))
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Property Snagging Insights</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert advice, guides, and resources to help you navigate property inspection and snagging in Dubai.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {BLOG_POSTS.filter(post => post.featured).map((post) => (
                <Card key={post.slug} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="bg-gray-100">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">{post.publishDate}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mb-4">{post.description}</p>
                    <div className="text-sm text-muted-foreground">{post.minutesToRead} min read</div>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/blog/${post.slug}`}>
                        Read Full Article
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">All Articles</h2>
            <div className="space-y-6">
              {BLOG_POSTS.map((post) => (
                <Card key={post.slug} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-gray-100">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">{post.publishDate}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mb-3">{post.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{post.minutesToRead} min read</span>
                      <Button asChild variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                        <Link href={`/blog/${post.slug}`} className="flex items-center text-primary">
                          Read Article
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogListing;