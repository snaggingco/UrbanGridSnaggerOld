import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Component that silently tracks page visits
 * This component should be included in App.tsx to track all page views
 * No UI is rendered, only tracking functionality
 */
const VisitorTracker: React.FC = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    // Don't track visits to admin pages
    if (location.startsWith('/admin') || location.startsWith('/login') || location.startsWith('/inspection')) {
      return;
    }
    
    const trackPageView = async () => {
      try {
        // Get referrer (if available)
        const referrer = document.referrer || null;
        
        // Extract query parameters from URL
        const url = new URL(window.location.href);
        const queryParams = Array.from(url.searchParams.entries())
          .reduce((acc: Record<string, string>, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
          
        // Collect basic browser and device info
        const userAgent = navigator.userAgent;
        const browser = detectBrowser();
        const device = detectDevice();
        const operatingSystem = detectOS();
        
        // Prepare the tracking data
        const trackingData = {
          visitedPage: location,
          userAgent,
          referrer,
          queryParams,
          browser,
          device,
          operatingSystem,
          sessionId: getOrCreateSessionId(),
        };
        
        // Send the tracking data to the server
        await fetch('/api/visitors/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackingData),
        });
      } catch (error) {
        // Silently fail - don't affect user experience if tracking fails
        console.error('Error tracking visitor:', error);
      }
    };
    
    // Track the page view
    trackPageView();
    
  }, [location]); // Re-run when the location changes
  
  // Helper function to detect browser type
  const detectBrowser = (): string => {
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.indexOf('edge') > -1) return 'Edge';
    if (ua.indexOf('edg') > -1) return 'Edge Chromium';
    if (ua.indexOf('opr') > -1 || ua.indexOf('opera') > -1) return 'Opera';
    if (ua.indexOf('chrome') > -1) return 'Chrome';
    if (ua.indexOf('safari') > -1) return 'Safari';
    if (ua.indexOf('firefox') > -1) return 'Firefox';
    if (ua.indexOf('msie') > -1 || ua.indexOf('trident') > -1) return 'Internet Explorer';
    
    return 'Unknown Browser';
  };
  
  // Helper function to detect device type
  const detectDevice = (): string => {
    const ua = navigator.userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
      return 'Tablet';
    }
    
    if (/mobile|iphone|ipod|blackberry|android|palm|windows phone/i.test(ua)) {
      return 'Mobile';
    }
    
    return 'Desktop';
  };
  
  // Helper function to detect operating system
  const detectOS = (): string => {
    const ua = navigator.userAgent;
    
    if (ua.indexOf('Win') !== -1) return 'Windows';
    if (ua.indexOf('Mac') !== -1) return 'MacOS';
    if (ua.indexOf('Linux') !== -1) return 'Linux';
    if (ua.indexOf('Android') !== -1) return 'Android';
    if (ua.indexOf('iOS') !== -1 || ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) return 'iOS';
    
    return 'Unknown OS';
  };
  
  // Helper to get or create a session ID to track the same user across multiple pages
  const getOrCreateSessionId = (): string => {
    let sessionId = sessionStorage.getItem('visitor_session_id');
    
    if (!sessionId) {
      // Generate a simple random ID
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('visitor_session_id', sessionId);
    }
    
    return sessionId;
  };
  
  // This component doesn't render anything visible
  return null;
};

export default VisitorTracker;