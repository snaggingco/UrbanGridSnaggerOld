import { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import WebVitalsTracker from '../WebVitalsTracker';
import ResourceHints from '../ResourceHints';
import CriticalPreload from '../CriticalPreload';
import GoogleAnalytics from '../GoogleAnalytics';
import PerformanceOptimizer from '../PerformanceOptimizer';
import LighthouseMetricsReporter from '../LighthouseMetricsReporter';
import Preconnect from '../Preconnect';
import { scheduleIdleTask } from '@/lib/idle-callback';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

/**
 * AppLayout - Main layout component for the application
 * 
 * Includes:
 * - Web Vitals tracking
 * - Resource hints for performance optimization
 * - Base HTML metadata
 */
export default function AppLayout({ 
  children, 
  title = 'Snagging By UrbanGrid | Professional Property Inspection Services in Dubai',
  description = 'Expert property snagging and inspection services in Dubai. We identify defects and issues in new and existing properties to ensure quality and value.',
}: AppLayoutProps) {
  // Critical resources to preload
  const criticalResources = [
    // Preload the logo
    { 
      href: '/company/assets/snagging-logo.png', 
      as: 'image' as const
    },
    // Preload critical fonts
    { 
      href: '/fonts/inter-var.woff2', 
      as: 'font' as const,
      type: 'font/woff2',
      crossOrigin: 'anonymous' as const
    }
  ];

  // Domains to establish early connections with
  const importantDomains = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://www.snagging.me'
  ];

  const handleWebVitalsReport = (metric: any) => {
    // Log web vitals metrics to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', metric);
    }
    
    // Here you could send the metrics to your analytics service
    // Example: sendToAnalytics(metric);
  };

  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Critical CSS inlined for immediate rendering and FCP/LCP improvement */}
        <style>
          {`
            /* Critical CSS to prevent layout shifts and optimize rendering */
            body { 
              margin: 0;
              padding: 0;
              width: 100%;
              overflow-x: hidden;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              position: relative;
            }
            
            html {
              width: 100%;
              overflow-x: hidden;
              box-sizing: border-box;
              scrollbar-gutter: stable;
            }
            
            *, *:before, *:after {
              box-sizing: inherit;
            }
            
            /* Fix mobile layout issues */
            @media (max-width: 767px) {
              section, div, article, form, footer, header {
                max-width: 100vw;
                overflow-x: hidden;
              }
            }
            
            /* Hide elements during font loading to prevent layout shifts */
            .font-loading-hidden {
              visibility: hidden;
            }
                        
            /* Pre-define spaces for important elements to prevent layout shifts */
            footer {
              min-height: 300px;
              max-width: 100%;
            }
            
            /* Optimize image rendering */
            img {
              max-width: 100%;
              height: auto;
              display: block;
              image-rendering: auto;
            }
            
            /* Reserve space for header */
            header {
              min-height: 80px;
              max-width: 100%;
            }
            
            /* Reserve space for hero section */
            .hero-section {
              min-height: 400px;
              max-width: 100%;
            }
            
            /* Set explicit aspect ratios for common image containers */
            .aspect-video {
              aspect-ratio: 16 / 9;
            }
            
            /* Layout stability for certification logo containers */
            .certification-logo {
              height: 100px;
              width: 150px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            /* Apply hardware acceleration to animated elements */
            .animated {
              transform: translateZ(0);
              will-change: transform, opacity;
            }
          `}
        </style>
      </Helmet>
      
      {/* Performance optimizations */}
      <ResourceHints />
      
      {/* Web Vitals tracking */}
      <WebVitalsTracker onReport={handleWebVitalsReport} />
      
      {/* Critical preload for improved LCP and CLS */}
      <CriticalPreload />
      
      {/* Google Analytics tracking */}
      <GoogleAnalytics />
      
      {/* Performance optimizer that handles advanced optimizations */}
      <PerformanceOptimizer />
      
      {/* Preconnect to critical domains */}
      <Preconnect />
      
      {/* Monitor Lighthouse metrics */}
      <LighthouseMetricsReporter 
        onReport={(metrics) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Lighthouse Metrics:', metrics);
          }
        }} 
      />
      
      {/* Main content */}
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}