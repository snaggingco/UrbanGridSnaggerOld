/**
 * GoogleAnalytics Component
 * 
 * This component loads Google Analytics (GA4) script and initializes tracking.
 * It's designed to be included in the main layout to track all pages.
 * 
 * Features:
 * - Optimized script loading strategy
 * - Route change tracking
 * - Type-safe interface
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import ScriptLoader from './ScriptLoader';

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-1VE9J0MSEG';

export default function GoogleAnalytics() {
  const [location] = useLocation();

  // Track page views when location changes
  useEffect(() => {
    // Only execute after gtag is available
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location,
        transport_type: 'beacon' // Use sendBeacon API for better performance
      });
    }
  }, [location]);

  // Script initialization function - runs after the main GA script loads
  const handleGAScriptLoad = () => {
    // Check if we already initialized GA
    if (window.dataLayer && window.gtag) {
      // If we're remounting and GA is already loaded, update config
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: true,
        page_path: location
      });
    }
  };

  return (
    <>
      {/* Load GA base script with afterInteractive strategy for better performance */}
      <ScriptLoader
        id="google-analytics-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        async
        onLoad={handleGAScriptLoad}
      />
      
      {/* Initialize GA */}
      <ScriptLoader
        id="google-analytics-init"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_location: window.location.href,
            page_path: '${location}',
            page_title: document.title
          });
        `}
      </ScriptLoader>
    </>
  );
}

// Declare the gtag function for TypeScript
declare global {
  interface Window {
    gtag: {
      (command: 'js', date: Date): void;
      (command: 'config', targetId: string, config?: Record<string, any>): void;
      (command: string, targetId: string, config?: Record<string, any>): void;
    };
    dataLayer: any[];
  }
}