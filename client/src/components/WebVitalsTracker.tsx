import { useEffect } from 'react';
import * as webVitals from 'web-vitals';

interface WebVitalsTrackerProps {
  reportEndpoint?: string;
  onReport?: (metric: webVitals.Metric) => void;
}

/**
 * Component for tracking Core Web Vitals metrics
 * - Tracks FCP, LCP, CLS, FID, and TTFB
 * - Logs metrics to console in development
 * - Can optionally send metrics to a reporting endpoint
 * 
 * Documentation: https://web.dev/vitals/
 */
export default function WebVitalsTracker({ reportEndpoint, onReport }: WebVitalsTrackerProps) {
  useEffect(() => {
    // Handler for web vitals
    const handleWebVitals = (metric: webVitals.Metric) => {
      const { name, delta, id, value } = metric;
      
      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Web Vital: ${name}`, {
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          delta: Math.round(name === 'CLS' ? delta * 1000 : delta),
          id
        });
      }
      
      // Call onReport callback if provided
      if (onReport) {
        onReport(metric);
      }
      
      // Send to analytics endpoint if provided
      if (reportEndpoint) {
        const body = JSON.stringify({ name, delta, id, value });
        
        // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
        if (navigator.sendBeacon) {
          navigator.sendBeacon(reportEndpoint, body);
        } else {
          fetch(reportEndpoint, {
            body,
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    };
    
    // Register listeners for all core web vitals
    webVitals.onCLS(handleWebVitals);
    webVitals.onFID(handleWebVitals);
    webVitals.onLCP(handleWebVitals);
    webVitals.onFCP(handleWebVitals);
    webVitals.onTTFB(handleWebVitals);
    
    // No need to cleanup since these are one-time reports
  }, [reportEndpoint, onReport]);
  
  // This component doesn't render anything
  return null;
}