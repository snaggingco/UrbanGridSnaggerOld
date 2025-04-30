import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface ResourceHint {
  rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch';
  href: string;
  as?: string; 
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

/**
 * Resource hints component to optimize critical resource loading
 * This component adds resource hints to improve loading performance
 */
export default function ResourceHints() {
  // Critical resources that should be preloaded
  const criticalResources: ResourceHint[] = [
    // Preload critical fonts
    { 
      rel: 'preload', 
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      as: 'style'
    },
    
    // Preconnect to important domains
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    
    // DNS prefetch for external resources
    { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
  ];
  
  // LCP images to preload
  const criticalImages: ResourceHint[] = [
    // Hero background - already optimized as SVG
    { 
      rel: 'preload', 
      href: '/images/property-hero.svg', 
      as: 'image', 
      type: 'image/svg+xml'
    },
    
    // Logo - critical for branding
    { 
      rel: 'preload', 
      href: '/company/assets/snagging-urbangrid-logo.svg', 
      as: 'image', 
      type: 'image/svg+xml'
    },
  ];
  
  // Add preloading for critical CSS
  useEffect(() => {
    // Dynamically identify and preload critical CSS files
    const criticalCssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    criticalCssLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.includes('index') || href.includes('style'))) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = href;
        preloadLink.as = 'style';
        document.head.appendChild(preloadLink);
      }
    });
    
    // Clean up function
    return () => {
      document.querySelectorAll('link[rel="preload"][as="style"]').forEach(link => {
        document.head.removeChild(link);
      });
    };
  }, []);
  
  return (
    <Helmet>
      {/* Add resource hints */}
      {[...criticalResources, ...criticalImages].map((hint, index) => (
        <link 
          key={`resource-hint-${index}`}
          rel={hint.rel}
          href={hint.href}
          as={hint.as}
          type={hint.type}
          crossOrigin={hint.crossOrigin}
        />
      ))}
      
      {/* Add priority hints for LCP elements */}
      <meta name="priority-hints" content="on" />
    </Helmet>
  );
}