import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { getCanonicalUrl } from "@/lib/canonical-urls";

interface LocationSpecificSEO {
  locationName: string;
  locationType: "neighborhood" | "district" | "city";
  locationDescription?: string;
  specificKeywords?: string[];
}

interface ArticleSEO {
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  category?: string;
  tags?: string[];
}

type SchemaType = 
  | "WebPage" 
  | "Article" 
  | "BlogPosting" 
  | "Service" 
  | "FAQPage" 
  | "HowTo" 
  | "LocalBusiness" 
  | "Review" 
  | "Product";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: Record<string, any>[] | Record<string, any>;
  noIndex?: boolean;
  alternateLanguages?: { lang: string; url: string }[];
  locationData?: LocationSpecificSEO;
  articleData?: ArticleSEO;
  schemaType?: SchemaType | SchemaType[];
  pageId?: string; // For analytics tracking
  videoUrl?: string; // For video content
  audioUrl?: string; // For podcast or audio content
  reviewData?: {
    rating: number;
    reviewCount: number;
  };
}

/**
 * Enhanced SEO component that handles meta tags, structured data, and SEO best practices
 * - Properly handles canonical URLs
 * - Supports noIndex for admin/internal pages
 * - Includes alternate language tags for multilingual sites
 * - Comprehensive structured data support
 * - Location-specific SEO enhancements
 * - Article/Blog structured data
 * - Advanced schema markup for various content types
 */
export default function SEO({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage = "/images/urbangrid-property-inspection-dubai.jpg",
  ogType = "website",
  twitterCard = "summary_large_image",
  jsonLd,
  noIndex = false,
  alternateLanguages = [],
  locationData,
  articleData,
  schemaType,
  pageId,
  videoUrl,
  audioUrl,
  reviewData,
}: SEOProps) {
  const [location] = useLocation();
  
  // Default site name
  const siteName = "Snagging By UrbanGrid - Property Inspection Dubai";
  
  // Combine title with site name, ensuring proper formatting for location pages
  let fullTitle = `${title} | ${siteName}`;
  
  // For location pages, optimize title format
  if (locationData) {
    const { locationName, locationType } = locationData;
    fullTitle = `${title} in ${locationName} | Professional Property Inspection | ${siteName}`;
  }
  
  // Enhanced keywords with location-specific terms if applicable
  const baseKeywords = [
    "snagging dubai",
    "property inspection",
    "property inspection dubai",
    "property inspection company dubai",
    "property inspection abu dhabi",
    "snagging companies in dubai",
    "property snagging",
    "snagging service in dubai",
    "property handover inspection dubai",
    "warranty inspection dubai",
    "building inspection uae",
    "villa inspection dubai",
    "apartment snagging dubai",
  ];
  
  // Add location-specific keywords if applicable
  if (locationData) {
    const { locationName, specificKeywords = [] } = locationData;
    baseKeywords.push(
      `snagging ${locationName}`,
      `property inspection ${locationName}`,
      `property handover ${locationName}`,
      ...specificKeywords
    );
  }
  
  // Add article-specific keywords if applicable
  if (articleData && articleData.tags) {
    baseKeywords.push(...articleData.tags);
  }
  
  // Combine all keywords
  const allKeywords = [...baseKeywords, ...keywords];
  
  // Format keywords
  const keywordsString = allKeywords.join(", ");

  // Generate canonical URL using helper function if not provided
  const finalCanonicalUrl = canonicalUrl || getCanonicalUrl(location);
  
  // Determine if the page is an admin or internal page that should be noindexed
  const isAdminPage = location.startsWith("/admin") || 
                     location.startsWith("/inspection") || 
                     location.includes("/login");
  
  // Admin pages should always be noindexed
  const shouldNoIndex = noIndex || isAdminPage;

  // Get the primary domain for image URLs from canonical URL helper
  const primaryDomain = getCanonicalUrl('');
  
  // Ensure absolute URL for ogImage using the primary domain
  const absoluteOgImage = ogImage.startsWith('http') 
    ? ogImage 
    : `${primaryDomain}${ogImage.startsWith('/') ? ogImage.substring(1) : ogImage}`;
    
  // Generate automatic schema markup if requested
  const generatedSchema = generateSchemaMarkup({
    type: schemaType,
    title,
    description,
    canonicalUrl: finalCanonicalUrl,
    imageUrl: absoluteOgImage,
    locationData,
    articleData,
    reviewData,
  });
  
  // Combine any manually provided schema with generated schema
  const finalJsonLd = jsonLd || generatedSchema;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      
      {/* Page-specific identifier for analytics */}
      {pageId && <meta name="pageId" content={pageId} />}
      
      {/* NoIndex for admin pages or when explicitly specified */}
      {shouldNoIndex && (
        <meta name="robots" content="noindex, nofollow" />
      )}
      
      {/* For indexed pages, explicitly state indexing preferences */}
      {!shouldNoIndex && (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical URL - essential for preventing duplicate content issues */}
      <link rel="canonical" href={finalCanonicalUrl} />
      
      {/* Alternate language links for multilingual support */}
      {alternateLanguages.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Open Graph tags with enhanced attributes */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Article-specific OpenGraph tags */}
      {ogType === 'article' && articleData && (
        <>
          <meta property="article:published_time" content={articleData.publishedTime} />
          {articleData.modifiedTime && (
            <meta property="article:modified_time" content={articleData.modifiedTime} />
          )}
          <meta property="article:author" content={articleData.author} />
          {articleData.category && (
            <meta property="article:section" content={articleData.category} />
          )}
          {articleData.tags && articleData.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Video and audio content tags */}
      {videoUrl && (
        <>
          <meta property="og:video" content={videoUrl} />
          <link rel="video_src" href={videoUrl} />
        </>
      )}
      
      {audioUrl && (
        <meta property="og:audio" content={audioUrl} />
      )}
      
      {/* Twitter Card tags with enhanced content */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
      <meta name="twitter:site" content="@snagging_me" />
      
      {/* Rich media Twitter tags */}
      {videoUrl && twitterCard === "summary_large_image" && (
        <meta name="twitter:player" content={videoUrl} />
      )}
      
      {/* JSON-LD structured data - support for multiple schema objects */}
      {Array.isArray(finalJsonLd) ? (
        finalJsonLd.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))
      ) : finalJsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(finalJsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}

/**
 * Generate schema markup based on page type and content
 */
function generateSchemaMarkup({ 
  type, 
  title, 
  description, 
  canonicalUrl, 
  imageUrl, 
  locationData,
  articleData,
  reviewData,
}: {
  type?: SchemaType | SchemaType[];
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  locationData?: LocationSpecificSEO;
  articleData?: ArticleSEO;
  reviewData?: { rating: number; reviewCount: number };
}): Record<string, any>[] {
  if (!type) return [];
  
  // Default schema that applies to all pages
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonicalUrl,
    "name": title,
    "description": description,
    "inLanguage": "en-US",
    "isPartOf": {
      "@type": "WebSite",
      "url": "https://www.snagging.me/",
      "name": "Snagging By UrbanGrid",
      "description": "Professional property snagging and inspection services in Dubai"
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": imageUrl
    }
  };
  
  // Prepare array for multiple schema types
  const schemas: Record<string, any>[] = [];
  const typeArray = Array.isArray(type) ? type : [type];
  
  // Handle different schema types
  typeArray.forEach(schemaType => {
    switch(schemaType) {
      case "WebPage":
        schemas.push(baseSchema);
        break;
        
      case "Article":
      case "BlogPosting":
        if (!articleData) break;
        
        schemas.push({
          "@context": "https://schema.org",
          "@type": schemaType,
          "headline": title,
          "description": description,
          "image": imageUrl,
          "datePublished": articleData.publishedTime,
          "dateModified": articleData.modifiedTime || articleData.publishedTime,
          "author": {
            "@type": "Person",
            "name": articleData.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Snagging By UrbanGrid",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.snagging.me/company/assets/snagging-logo.png"
            }
          },
          "mainEntityOfPage": canonicalUrl,
          ...(articleData.category && { "articleSection": articleData.category }),
          ...(articleData.tags && { "keywords": articleData.tags.join(", ") })
        });
        break;
        
      case "Service":
        schemas.push({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": title,
          "description": description,
          "url": canonicalUrl,
          "provider": {
            "@type": "LocalBusiness",
            "name": "Snagging By UrbanGrid",
            "url": "https://www.snagging.me/",
            "logo": "https://www.snagging.me/company/assets/snagging-logo.png",
            "image": imageUrl,
            ...(locationData ? {
              "areaServed": {
                "@type": locationData.locationType === "city" ? "City" : "Place",
                "name": locationData.locationName
              }
            } : {
              "areaServed": {
                "@type": "City", 
                "name": "Dubai"
              }
            })
          },
          ...(reviewData && {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": reviewData.rating,
              "reviewCount": reviewData.reviewCount
            }
          })
        });
        break;
        
      case "LocalBusiness":
        schemas.push({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Snagging By UrbanGrid",
          "alternateName": "UrbanGrid",
          "image": imageUrl,
          "logo": "https://www.snagging.me/company/assets/snagging-logo.png",
          "url": "https://www.snagging.me",
          "telephone": "+971-58-5686852",
          "email": "info@snagging.me",
          "description": description,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Naema Ali Buamim Building - 306 - Al Bada'a",
            "addressLocality": "Dubai",
            "addressRegion": "Dubai",
            "addressCountry": "AE"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 25.2291785,
            "longitude": 55.273391
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
              ],
              "opens": "09:00",
              "closes": "18:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Saturday"],
              "opens": "10:00",
              "closes": "16:00"
            }
          ],
          "sameAs": [
            "https://www.snagging.me",
            "https://www.facebook.com/snagginginspection/",
            "https://www.instagram.com/snagginginspection/"
          ],
          "priceRange": "$$",
          ...(reviewData && {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": reviewData.rating,
              "reviewCount": reviewData.reviewCount
            }
          })
        });
        break;
        
      case "Review":
        if (!reviewData) break;
        
        schemas.push({
          "@context": "https://schema.org",
          "@type": "Review",
          "itemReviewed": {
            "@type": "LocalBusiness",
            "name": "Snagging By UrbanGrid",
            "image": imageUrl,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Naema Ali Buamim Building - 306 - Al Bada'a",
              "addressLocality": "Dubai",
              "addressRegion": "Dubai",
              "addressCountry": "AE"
            }
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": reviewData.rating
          },
          "author": {
            "@type": "Organization",
            "name": "Snagging By UrbanGrid Customers"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Snagging By UrbanGrid"
          }
        });
        break;
        
      case "HowTo":
        // This would need more specific data to be implemented properly
        // But here's a basic structure for future implementation
        schemas.push({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": title,
          "description": description,
          "image": imageUrl,
          "step": [
            // Steps would be dynamically generated based on content
            {
              "@type": "HowToStep",
              "name": "Example Step 1",
              "text": "This is an example step"
            }
          ]
        });
        break;
    }
  });
  
  return schemas;
}