import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

// Note: For a production site, we would use a proper CMS or API to fetch blog posts
const BLOG_POSTS = {
  'snagging-price-guide-dubai': {
    title: 'Property Snagging Prices in Dubai: A Comprehensive Guide',
    description: 'Learn about the typical costs for property snagging services in Dubai, ranging from AED 1,500 to AED 3,000 for standard properties.',
    slug: 'snagging-price-guide-dubai',
    publishDate: 'April 18, 2025',
    keywords: 'property snagging dubai, snagging prices uae, dubai property inspection cost, property handover inspection price dubai',
    canonicalUrl: 'https://snagging.me/blog/snagging-price-guide-dubai'
  },
  'property-inspection-companies-dubai': {
    title: 'Navigating Property Inspection Services in Dubai: A Buyer\'s Guide',
    description: 'Compare property inspection and snagging companies in Dubai to find the best service for your real estate investment.',
    slug: 'property-inspection-companies-dubai',
    publishDate: 'April 18, 2025',
    keywords: 'snagging companies dubai, property inspection dubai, dubai property inspectors, handover inspection service dubai',
    canonicalUrl: 'https://snagging.me/blog/property-inspection-companies-dubai'
  },
  'what-is-property-snagging-dubai': {
    title: 'What is Property Snagging in Dubai? A Complete Guide',
    description: 'Understand property snagging services in Dubai, why they\'re essential for new property buyers, and how they can save you money on repairs.',
    slug: 'what-is-property-snagging-dubai',
    publishDate: 'April 18, 2025',
    keywords: 'what is property snagging, property snagging dubai, snagging inspection dubai, property handover inspection',
    canonicalUrl: 'https://snagging.me/blog/what-is-property-snagging-dubai'
  },
  'how-to-choose-snagging-company-dubai': {
    title: 'How to Choose the Right Snagging Company in Dubai: 10 Critical Factors',
    description: 'Learn how to select the best property snagging service in Dubai with these 10 essential criteria for evaluating snagging companies.',
    slug: 'how-to-choose-snagging-company-dubai',
    publishDate: 'April 18, 2025',
    keywords: 'best snagging company dubai, how to choose snagging inspector, property inspection company dubai, snagging service selection',
    canonicalUrl: 'https://snagging.me/blog/how-to-choose-snagging-company-dubai'
  },
  'property-handover-inspection-checklist-dubai': {
    title: 'Complete Property Handover Inspection Checklist for Dubai Properties',
    description: 'A comprehensive checklist for Dubai property handovers covering all critical inspection points for apartments, villas, and townhouses.',
    slug: 'property-handover-inspection-checklist-dubai',
    publishDate: 'April 18, 2025',
    keywords: 'property handover checklist dubai, snagging inspection list, new property inspection dubai, handover process uae',
    canonicalUrl: 'https://snagging.me/blog/property-handover-inspection-checklist-dubai'
  },
  'common-defects-new-properties-dubai': {
    title: '15 Most Common Defects Found in New Properties in Dubai',
    description: 'Discover the most frequent issues found during snagging inspections of new Dubai properties and how to ensure they\'re fixed under warranty.',
    slug: 'common-defects-new-properties-dubai',
    publishDate: 'April 18, 2025',
    keywords: 'common property defects dubai, new apartment issues dubai, villa snagging problems, construction defects uae',
    canonicalUrl: 'https://snagging.me/blog/common-defects-new-properties-dubai'
  },
  'dubai-property-warranty-period-explained': {
    title: 'Dubai Property Warranty Period Explained: Your Complete Guide',
    description: 'Everything Dubai property owners need to know about warranty periods, defect liability, and ensuring developers fulfill their obligations.',
    slug: 'dubai-property-warranty-period-explained',
    publishDate: 'April 18, 2025',
    keywords: 'dubai property warranty, defect liability period uae, property developer guarantee, warranty claims dubai real estate',
    canonicalUrl: 'https://snagging.me/blog/dubai-property-warranty-period-explained'
  }
};

type BlogPostMetadata = {
  title: string;
  description: string;
  slug: string;
  publishDate: string;
  keywords: string;
  canonicalUrl: string;
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const metadata = BLOG_POSTS[slug as keyof typeof BLOG_POSTS];

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) {
        setError('Blog post not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/src/content/blog/${slug}.md`);
        if (!response.ok) {
          throw new Error('Failed to load blog post');
        }
        
        const text = await response.text();
        setContent(text);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  if (!metadata) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6">Blog Post Not Found</h1>
        <p>Sorry, the blog post you're looking for doesn't exist.</p>
        <Button asChild className="mt-6">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{metadata.title} | Urban Grid</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <link rel="canonical" href={metadata.canonicalUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:url" content={metadata.canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Urban Grid - Property Snagging Dubai" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        
        {/* Article Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": metadata.title,
            "description": metadata.description,
            "datePublished": metadata.publishDate,
            "dateModified": metadata.publishDate,
            "publisher": {
              "@type": "Organization",
              "name": "Urban Grid",
              "logo": {
                "@type": "ImageObject",
                "url": "https://snagging.me/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": metadata.canonicalUrl
            },
            "author": {
              "@type": "Organization",
              "name": "Urban Grid"
            }
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <Card className="overflow-hidden shadow-md">
          <CardContent className="p-8">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-6 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-red-600 mb-4">{error}</h2>
                <p className="text-gray-600">Please try again later or contact support if the issue persists.</p>
              </div>
            ) : (
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    // Customize how links are rendered to use our SafeExternalLink for external URLs
                    a: ({ node, href, children, ...props }) => {
                      const isExternal = href?.startsWith('http');
                      
                      if (isExternal && href) {
                        // Import dynamically to avoid circular dependencies
                        const SafeExternalLink = require('./SafeExternalLink').default;
                        return (
                          <SafeExternalLink href={href} className={props.className}>
                            {children}
                          </SafeExternalLink>
                        );
                      }
                      
                      return (
                        <a href={href} {...props}>
                          {children}
                        </a>
                      );
                    }
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>
            )}
          </CardContent>
        </Card>

        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
          <Separator className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h4 className="text-lg font-medium mb-2">Free Property Inspection Checklist</h4>
                <p className="text-gray-600 mb-4">Download our comprehensive checklist to help you identify common property issues.</p>
                <Button asChild>
                  <Link href="/resources/inspection-checklist">Download Now</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h4 className="text-lg font-medium mb-2">Book a Professional Inspection</h4>
                <p className="text-gray-600 mb-4">Protect your investment with our expert property snagging service.</p>
                <Button asChild>
                  <Link href="/book-service">Schedule Today</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;