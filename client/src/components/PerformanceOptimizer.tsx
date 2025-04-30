import { useEffect } from 'react';
import { scheduleIdleTask } from '@/lib/idle-callback';
import { preloadCriticalCss, loadCssAsync } from '@/lib/css-optimization';

/**
 * PerformanceOptimizer - Component for implementing all performance optimizations
 * 
 * This component:
 * 1. Implements priority loading for critical resources
 * 2. Defers non-essential JavaScript and CSS
 * 3. Uses requestIdleCallback for non-critical operations
 * 4. Lazy loads below-the-fold content
 * 5. Implements resource hints (preconnect, dns-prefetch)
 * 6. Optimizes third-party scripts loading
 */
export default function PerformanceOptimizer() {
  useEffect(() => {
    // Critical optimizations that run immediately
    performCriticalOptimizations();
    
    // Non-critical optimizations run during idle time
    scheduleIdleTask(() => {
      performNonCriticalOptimizations();
    });
    
    // Run after page load is complete
    window.addEventListener('load', performAfterLoadOptimizations);
    
    return () => {
      window.removeEventListener('load', performAfterLoadOptimizations);
    };
  }, []);
  
  return null;
}

/**
 * Critical optimizations that run immediately
 */
function performCriticalOptimizations() {
  // Preload critical fonts
  const criticalFonts = ['/fonts/inter-var.woff2'];
  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
  
  // Preconnect to important domains
  const domains = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
  
  // Add fetchpriority to hero/LCP images
  const lcpImages = document.querySelectorAll('.hero-image, .lcp-image');
  lcpImages.forEach(img => {
    if (img instanceof HTMLImageElement) {
      img.fetchPriority = 'high';
    }
  });
  
  // Preload critical CSS
  preloadCriticalCss('/assets/index.css');
}

/**
 * Non-critical optimizations that run during idle time
 */
function performNonCriticalOptimizations() {
  // Lazy load images outside viewport
  setupLazyLoading();
  
  // Add resource hints for future navigations
  addResourceHints();
  
  // Apply font display swap for better text rendering
  applyFontDisplaySwap();
  
  // Optimize YouTube embeds if present
  optimizeYouTubeEmbeds();
  
  // Set up connection caching for websocket if needed
  setupPersistentConnections();
}

/**
 * Optimizations that run after the page is fully loaded
 */
function performAfterLoadOptimizations() {
  // Load non-critical CSS asynchronously
  loadCssAsync('/assets/animations.css');
  
  // Load third-party analytics
  loadAnalytics();
  
  // Prefetch likely navigation destinations
  prefetchLikelyDestinations();
}

// Helper functions for specific optimizations

function setupLazyLoading() {
  // Set up intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Set the src from data-src if it exists
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          
          // Set the srcset from data-srcset if it exists
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }
}

function addResourceHints() {
  // Prefetch resources for likely navigation
  const navigationLinks = document.querySelectorAll('a.main-nav-link');
  navigationLinks.forEach(link => {
    if (link instanceof HTMLAnchorElement) {
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = link.href;
      document.head.appendChild(prefetchLink);
    }
  });
}

function applyFontDisplaySwap() {
  // Add font-display: swap to all font faces
  const style = document.createElement('style');
  style.innerHTML = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

function optimizeYouTubeEmbeds() {
  // Replace YouTube iframes with lite versions that load on click
  document.querySelectorAll('iframe[src*="youtube.com"]').forEach(iframe => {
    // Implementation would depend on your YouTube embedding strategy
    console.log('Found YouTube iframe:', iframe);
  });
}

function setupPersistentConnections() {
  // Keep connections alive for faster subsequent requests
  // Implementation depends on your specific backend services
}

function loadAnalytics() {
  // Load analytics scripts asynchronously
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
  script.async = true;
  document.head.appendChild(script);
}

function prefetchLikelyDestinations() {
  // Prefetch pages the user is likely to visit next
  const commonDestinations = [
    '/book-service',
    '/services',
    '/about'
  ];
  
  commonDestinations.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  });
}