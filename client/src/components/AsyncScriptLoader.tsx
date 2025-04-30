import { useState, useEffect } from 'react';

interface AsyncScriptOptions {
  src: string;
  id?: string;
  async?: boolean;
  defer?: boolean;
  module?: boolean;
  noModule?: boolean;
  integrity?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  fetchPriority?: 'high' | 'low' | 'auto';
  loadingStrategy?: 'immediate' | 'afterInteractive' | 'afterLoad' | 'onVisible';
  intersectionThreshold?: number;
  intersectionMargin?: string;
  timeout?: number;
  onLoad?: () => void;
  onError?: (error: Error | Event) => void;
}

/**
 * useAsyncScript - Advanced hook for loading JavaScript dynamically
 * 
 * Features:
 * - Multiple loading strategies (immediate, afterInteractive, afterLoad, onVisible)
 * - Loading status tracking (loading, loaded, error)
 * - IntersectionObserver support for loading scripts only when visible
 * - Timeout support for cleaning up failed loads
 * - Built-in error handling
 * - Performance optimizations with fetchPriority
 * 
 * @example
 * const { status, error } = useAsyncScript({
 *   src: 'https://example.com/script.js',
 *   loadingStrategy: 'onVisible',
 *   timeout: 5000,
 * });
 */
export function useAsyncScript({
  src,
  id,
  async = true,
  defer = false,
  module = false,
  noModule = false,
  integrity,
  crossOrigin,
  referrerPolicy,
  fetchPriority = 'auto',
  loadingStrategy = 'immediate',
  intersectionThreshold = 0.1,
  intersectionMargin = '200px',
  timeout,
  onLoad,
  onError,
}: AsyncScriptOptions) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [error, setError] = useState<Error | Event | null>(null);
  
  useEffect(() => {
    if (!src) return;
    
    // Skip if script already exists in document
    const scriptId = id || `async-script-${src.replace(/[^\w]/g, '-')}`;
    if (document.getElementById(scriptId)) {
      setStatus('loaded');
      return;
    }
    
    const loadScript = () => {
      // Don't reload if already loaded or loading
      if (status === 'loading' || status === 'loaded') return;
      
      setStatus('loading');
      
      const script = document.createElement('script');
      script.src = src;
      script.id = scriptId;
      script.async = async;
      script.defer = defer;
      
      // Additional attributes
      if (module) script.type = 'module';
      if (noModule) script.noModule = true;
      if (integrity) script.integrity = integrity;
      if (crossOrigin) script.crossOrigin = crossOrigin;
      if (referrerPolicy) script.referrerPolicy = referrerPolicy;
      if (fetchPriority) script.setAttribute('fetchpriority', fetchPriority);
      
      // Event handlers
      script.onload = () => {
        setStatus('loaded');
        if (onLoad) onLoad();
      };
      
      script.onerror = (event) => {
        setStatus('error');
        const error = new Error(`Failed to load script: ${src}`);
        setError(error);
        if (onError) onError(event);
      };
      
      // Add script to document
      document.head.appendChild(script);
      
      // Set timeout to handle scripts that never load
      let timeoutId: number | undefined;
      if (timeout) {
        timeoutId = window.setTimeout(() => {
          if (status === 'loading') {
            setStatus('error');
            const timeoutError = new Error(`Script loading timed out: ${src}`);
            setError(timeoutError);
            if (onError) onError(timeoutError);
          }
        }, timeout);
      }
      
      // Cleanup function
      return () => {
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    };
    
    // Different loading strategies
    if (loadingStrategy === 'immediate') {
      loadScript();
    } 
    else if (loadingStrategy === 'afterInteractive') {
      if (document.readyState === 'complete') {
        loadScript();
      } else {
        window.addEventListener('load', loadScript);
        return () => window.removeEventListener('load', loadScript);
      }
    } 
    else if (loadingStrategy === 'afterLoad') {
      window.addEventListener('load', () => setTimeout(loadScript, 0));
      return () => window.removeEventListener('load', loadScript);
    } 
    else if (loadingStrategy === 'onVisible') {
      // Use intersection observer to load when visible
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              loadScript();
              observer.disconnect();
            }
          },
          {
            rootMargin: intersectionMargin,
            threshold: intersectionThreshold
          }
        );
        
        // Create a target element if needed
        const target = document.getElementById(`target-${scriptId}`) || 
                       (() => {
                         const el = document.createElement('div');
                         el.id = `target-${scriptId}`;
                         el.style.width = '1px';
                         el.style.height = '1px';
                         el.style.position = 'absolute';
                         el.style.bottom = '200px';
                         el.style.left = '0';
                         el.style.pointerEvents = 'none';
                         document.body.appendChild(el);
                         return el;
                       })();
        
        observer.observe(target);
        
        return () => {
          observer.disconnect();
          if (target.id === `target-${scriptId}`) {
            document.body.removeChild(target);
          }
        };
      } else {
        // Fallback for browsers without IntersectionObserver
        loadScript();
      }
    }
    
  }, [src, id, async, defer, module, noModule, integrity, crossOrigin, referrerPolicy,
      fetchPriority, loadingStrategy, intersectionThreshold, intersectionMargin, timeout,
      onLoad, onError, status]);
  
  return { status, error };
}

/**
 * AsyncScriptLoader - Component wrapper for useAsyncScript hook
 * 
 * @example
 * <AsyncScriptLoader
 *   src="https://analytics.example.com/script.js"
 *   loadingStrategy="afterLoad"
 *   onLoad={() => console.log('Analytics loaded')}
 * />
 */
export default function AsyncScriptLoader(props: AsyncScriptOptions) {
  useAsyncScript(props);
  return null;
}