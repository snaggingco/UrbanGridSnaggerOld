import { Helmet } from "react-helmet";
import { PRIMARY_DOMAIN } from "@/lib/canonical-urls";

/**
 * Component for preloading critical resources to improve performance metrics
 * - Preloads essential fonts, images, and stylesheets
 * - Uses resource hints (preconnect, dns-prefetch) for external domains
 * - Improves FCP, LCP, and overall loading performance
 */
export default function CriticalPreload() {
  return (
    <Helmet>
      {/* Preconnect to important domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Preload critical fonts */}
      <link 
        rel="preload" 
        href="/fonts/inter-var.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
      
      {/* Preload critical images */}
      <link 
        rel="preload" 
        href="/images/internachi.webp" 
        as="image" 
        type="image/webp" 
      />
      <link 
        rel="preload" 
        href="/images/internachi2.webp" 
        as="image" 
        type="image/webp" 
      />
      
      {/* Preload hero background */}
      <link 
        rel="preload" 
        href="/images/hero-bg.webp" 
        as="image" 
        type="image/webp" 
      />
      
      {/* Preload critical CSS */}
      <link 
        rel="preload" 
        href="/assets/index.css" 
        as="style" 
      />
      
      {/* DNS prefetch for analytics and external services */}
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* Add explicit image dimensions to reduce layout shifts */}
      <style>
        {`
          /* Set explicit dimensions for images to reduce CLS */
          img {
            aspect-ratio: attr(width) / attr(height);
          }
          
          /* Improve image rendering */
          img {
            image-rendering: auto;
            transform: translateZ(0); /* Hardware acceleration */
          }
          
          /* Reserve space for critical elements to reduce CLS */
          .hero-title-placeholder {
            height: 72px;
            margin-bottom: 16px;
          }
          
          /* Add content-visibility for offscreen content */
          .offscreen-content {
            content-visibility: auto;
            contain-intrinsic-size: 0 500px;
          }
          
          /* Pre-define spaces for footer to reduce layout shifts */
          footer {
            min-height: 600px;
          }
          
          /* Improve font rendering */
          html {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }
        `}
      </style>
    </Helmet>
  );
}