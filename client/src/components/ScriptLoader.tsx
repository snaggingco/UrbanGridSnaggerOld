import { useEffect } from 'react';

interface ScriptLoaderProps {
  src?: string; // Made optional for inline scripts
  id?: string;
  async?: boolean;
  defer?: boolean;
  onLoad?: () => void;
  onError?: (error: Error | Event) => void;
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
  children?: string;
}

/**
 * ScriptLoader - A component for efficiently loading external scripts
 * with proper performance attributes and lifecycle hooks
 */
export default function ScriptLoader({
  src,
  id,
  async = true,
  defer = false,
  onLoad,
  onError,
  strategy = 'afterInteractive',
  children
}: ScriptLoaderProps) {
  useEffect(() => {
    // Skip if strategy is afterInteractive but document is not yet interactive
    if (strategy === 'afterInteractive' && document.readyState !== 'complete') {
      const handleLoad = () => {
        if (document.readyState === 'complete') {
          loadScript();
          window.removeEventListener('load', handleLoad);
        }
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }

    // Skip if strategy is lazyOnload - will be loaded after all resources
    if (strategy === 'lazyOnload') {
      const handleLoad = () => {
        setTimeout(loadScript, 0);
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }

    // Otherwise load immediately (beforeInteractive or afterInteractive + doc is ready)
    loadScript();

    // Cleanup function
    return () => {
      // Generate a consistent ID for cleanup
      let scriptId = 'inline-script';
      if (id) {
        scriptId = id;
      } else if (src) {
        scriptId = src;
      }
      
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [src, id, strategy]);

  const loadScript = () => {
    // Check if script already exists
    if (id && document.getElementById(id)) {
      return;
    }

    // Create script element
    const script = document.createElement('script');
    if (src) {
      script.src = src;
      
      // Add resource hints to improve loading performance
      if (strategy === 'beforeInteractive') {
        // Preconnect to the script domain to speed up connection
        const scriptUrl = new URL(src, window.location.origin);
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = `${scriptUrl.protocol}//${scriptUrl.hostname}`;
        document.head.appendChild(preconnect);
      }
    }
    
    // Add performance attributes
    script.async = async;
    script.defer = defer;
    
    // Add performance hints for browser optimizations
    if (strategy === 'lazyOnload') {
      script.setAttribute('fetchpriority', 'low');
    }
    
    if (id) {
      script.id = id;
    }

    // Add event listeners
    if (onLoad) {
      script.onload = onLoad;
    }
    
    if (onError) {
      script.onerror = (event) => onError(event as Event);
    }

    // Add inline script content if provided
    if (children) {
      script.innerHTML = children;
    }

    // Add script to document
    document.head.appendChild(script);
  };

  return null;
}