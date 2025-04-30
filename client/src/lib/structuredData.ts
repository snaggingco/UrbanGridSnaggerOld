/**
 * Structured Data helper functions for SEO
 */

// Generates Organization Schema JSON-LD
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Snagging.me",
    "url": "https://www.snagging.me/",
    "logo": "https://www.snagging.me/internachi.webp",
    "image": "https://www.snagging.me/og-image.svg",
    "description": "Professional property snagging and inspection services in Dubai for new properties, warranty inspections, and resale property inspections.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AE",
      "addressLocality": "Dubai"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 25.2048,
      "longitude": 55.2708
    },
    "telephone": "+971-50-7363874",
    "email": "info@snagging.me",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
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
    "priceRange": "$$",
    "sameAs": [
      "https://www.facebook.com/snagginginspection/",
      "https://www.instagram.com/snagginginspection/"
    ]
  };
}

// Generates FAQ Schema JSON-LD
export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is property snagging?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Property snagging is a thorough inspection of a newly built or renovated property to identify any defects, issues, or incomplete work that needs to be rectified by the developer or contractor before you accept the handover."
        }
      },
      {
        "@type": "Question",
        "name": "When should I schedule a snagging inspection?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ideally, you should schedule a snagging inspection before you take possession of a new property or after major renovations, usually a few days before the official handover. For warranty inspections, schedule before your warranty period expires."
        }
      },
      {
        "@type": "Question",
        "name": "How long does a property inspection take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The duration of a property inspection depends on the size and type of property. On average, a thorough inspection of a 2-bedroom apartment takes 2-3 hours, while larger villas may require 4-6 hours."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to be present during the inspection?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While it's not mandatory, we recommend that you be present during at least part of the inspection. This allows our inspector to show you any critical issues directly and explain technical aspects of the findings."
        }
      },
      {
        "@type": "Question",
        "name": "What does your inspection report include?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our detailed inspection report includes photographic evidence of all issues found, clear descriptions of each defect, references to applicable standards or regulations, recommendations for rectification, and a summary of critical issues requiring immediate attention."
        }
      }
    ]
  };
}

// Generates Service Schema JSON-LD for the services list on the homepage
export function generateServicesListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Service",
          "name": "Handover Inspection",
          "url": "https://www.snagging.me/property-handover",
          "description": "Comprehensive inspection of newly built properties before the handover from the developer, identifying construction defects, finishing issues, and ensuring all features work as promised.",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Snagging.me",
            "url": "https://www.snagging.me/"
          },
          "areaServed": {
            "@type": "City",
            "name": "Dubai"
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Service",
          "name": "Warranty Inspection",
          "url": "https://www.snagging.me/snagging-services",
          "description": "Detailed inspection before your property warranty period expires to identify any defects that should be fixed by the developer under warranty terms.",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Snagging.me",
            "url": "https://www.snagging.me/"
          },
          "areaServed": {
            "@type": "City",
            "name": "Dubai"
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Service",
          "name": "Resale Property Inspection",
          "url": "https://www.snagging.me/property-inspection",
          "description": "Thorough inspection of resale properties to identify any existing issues before purchase, helping buyers make informed decisions and negotiate better prices.",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Snagging.me",
            "url": "https://www.snagging.me/"
          },
          "areaServed": {
            "@type": "City",
            "name": "Dubai"
          }
        }
      }
    ]
  };
}

// Interface for service offers
export interface ServiceOffer {
  name: string;
  description: string;
  price?: string;
}

// Generates a single Service Schema JSON-LD for individual service pages
export interface ServiceSchemaData {
  name: string;
  description: string;
  provider: string;
  serviceType: string;
  areaServed: string;
  offers?: ServiceOffer[];
}

export function generateSingleServiceSchema(serviceData: ServiceSchemaData) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceData.name,
    "description": serviceData.description,
    "provider": {
      "@type": "LocalBusiness",
      "name": serviceData.provider,
      "url": "https://www.snagging.me/"
    },
    "serviceType": serviceData.serviceType,
    "areaServed": {
      "@type": "City",
      "name": serviceData.areaServed
    }
  };

  // Add offers if provided
  if (serviceData.offers && serviceData.offers.length > 0) {
    schema.offers = serviceData.offers.map(offer => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": offer.name,
        "description": offer.description
      },
      ...(offer.price ? { "price": offer.price } : {})
    }));
  }

  return schema;
}

// We don't need a React component for structured data as it's added directly to index.html