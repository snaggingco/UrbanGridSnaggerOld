import { useEffect, useRef } from 'react';

interface LighthouseMetricsReporterProps {
  onReport?: (metrics: {
    score: number;
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
    fcp: number;
    lcp: number;
    cls: number;
    tbt: number;
    ttfb: number;
  }) => void;
}

/**
 * LighthouseMetricsReporter - Tracks and reports Lighthouse-style metrics
 * 
 * This component monitors performance metrics that Lighthouse checks for:
 * - First Contentful Paint (FCP)
 * - Largest Contentful Paint (LCP)
 * - Cumulative Layout Shift (CLS)
 * - Total Blocking Time (TBT)
 * - Time to First Byte (TTFB)
 * 
 * It uses the Web Vitals API and Performance API to capture these metrics
 * and can report them to analytics or monitoring services.
 */
export default function LighthouseMetricsReporter({ onReport }: LighthouseMetricsReporterProps) {
  // Keep track of CLS
  const clsRef = useRef<number>(0);
  const clsEntriesRef = useRef<PerformanceEntry[]>([]);
  
  useEffect(() => {
    // Skip if no onReport callback or if not in browser
    if (!onReport || typeof window === 'undefined') return;
    
    // Only run in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !window.location.search.includes('debug_metrics')) {
      return;
    }
    
    // Function to calculate CLS from layout shift entries
    const calculateCLS = (entries: PerformanceEntry[]) => {
      return entries.reduce((sum, entry: any) => {
        // Only count layout shifts without recent user input
        if (!entry.hadRecentInput) {
          return sum + entry.value;
        }
        return sum;
      }, 0);
    };
    
    // Observer for Largest Contentful Paint
    let lcpValue = 0;
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      lcpValue = lastEntry.startTime;
      console.debug('LCP:', lcpValue);
    });
    
    // Observer for First Contentful Paint
    let fcpValue = 0;
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      fcpValue = entries[0].startTime;
      console.debug('FCP:', fcpValue);
    });
    
    // Observer for Layout Shifts (CLS)
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      // Add new entries to our running list
      clsEntriesRef.current = [...clsEntriesRef.current, ...entries];
      
      // Calculate new CLS value
      clsRef.current = calculateCLS(clsEntriesRef.current);
      console.debug('CLS:', clsRef.current);
    });
    
    // Observer for Long Tasks (for TBT calculation)
    let longTasksTotal = 0;
    const longTaskObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      // Calculate Total Blocking Time
      entries.forEach((entry: any) => {
        // A task is "blocking" if it takes more than 50ms
        const blockingTime = entry.duration - 50;
        if (blockingTime > 0) {
          longTasksTotal += blockingTime;
        }
      });
      
      console.debug('TBT:', longTasksTotal);
    });
    
    // Start observing the performance entries
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fcpObserver.observe({ type: 'paint', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      
      // Long Tasks may not be supported in all browsers
      if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
        longTaskObserver.observe({ type: 'longtask', buffered: true });
      }
    } catch (e) {
      console.error('Performance Observer error:', e);
    }
    
    // Timer to report metrics after the page has had time to fully load
    const timer = setTimeout(() => {
      // Calculate TTFB from navigation timing
      let ttfb = 0;
      const navEntry = performance.getEntriesByType('navigation')[0] as any;
      if (navEntry) {
        ttfb = navEntry.responseStart;
      }
      
      // Report all metrics
      onReport({
        // Overall scores (estimated)
        score: estimateLighthouseScore(lcpValue, fcpValue, clsRef.current, longTasksTotal, ttfb),
        performance: estimatePerformanceScore(lcpValue, fcpValue, clsRef.current, longTasksTotal, ttfb),
        accessibility: 100, // Not measured here, would need custom checks
        bestPractices: 100, // Not measured here, would need custom checks
        seo: 100, // Not measured here, would need custom checks
        pwa: 0, // Not measured here, would need custom checks
        
        // Raw metrics
        fcp: fcpValue,
        lcp: lcpValue,
        cls: clsRef.current,
        tbt: longTasksTotal,
        ttfb: ttfb
      });
      
      // Disconnect observers to stop collecting metrics
      lcpObserver.disconnect();
      fcpObserver.disconnect();
      clsObserver.disconnect();
      longTaskObserver.disconnect();
    }, 10000); // Report after 10 seconds
    
    // Cleanup
    return () => {
      clearTimeout(timer);
      lcpObserver.disconnect();
      fcpObserver.disconnect();
      clsObserver.disconnect();
      longTaskObserver.disconnect();
    };
  }, [onReport]);
  
  // This is a rough estimate based on Lighthouse scoring algorithms
  // For precise scores, you'd need to implement their exact formulas
  function estimateLighthouseScore(lcp: number, fcp: number, cls: number, tbt: number, ttfb: number): number {
    const performanceScore = estimatePerformanceScore(lcp, fcp, cls, tbt, ttfb);
    // In a real implementation, you'd calculate other scores too
    return performanceScore;
  }
  
  function estimatePerformanceScore(lcp: number, fcp: number, cls: number, tbt: number, ttfb: number): number {
    // Weights used by Lighthouse for Performance score
    const weights = {
      lcp: 0.25,
      fcp: 0.15,
      cls: 0.25,
      tbt: 0.25,
      ttfb: 0.1
    };
    
    // Score each metric from 0-1 based on thresholds
    // These are simplified versions of Lighthouse's scoring
    const lcpScore = scoreMetric(lcp, 2500, 4000);
    const fcpScore = scoreMetric(fcp, 1800, 3000);
    const clsScore = scoreMetric(cls * 100, 10, 25); // CLS is usually < 1, multiply by 100
    const tbtScore = scoreMetric(tbt, 200, 600);
    const ttfbScore = scoreMetric(ttfb, 200, 600);
    
    // Apply weights and combine scores
    const weightedScore = 
      lcpScore * weights.lcp +
      fcpScore * weights.fcp +
      clsScore * weights.cls +
      tbtScore * weights.tbt +
      ttfbScore * weights.ttfb;
    
    // Convert to 0-100 scale
    return Math.round(weightedScore * 100);
  }
  
  // Helper function to score a metric based on good/poor thresholds
  function scoreMetric(value: number, goodThreshold: number, poorThreshold: number): number {
    if (value <= goodThreshold) return 1;
    if (value >= poorThreshold) return 0;
    
    // Linear interpolation between good and poor
    return (poorThreshold - value) / (poorThreshold - goodThreshold);
  }
  
  // This component doesn't render anything
  return null;
}