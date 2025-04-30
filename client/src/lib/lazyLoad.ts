import { lazy } from 'react';

// Enhanced lazy loading utility that adds retry and timeout capabilities
// This helps in cases of network issues or slow connections
export function lazyLoad(moduleImportFn: () => Promise<any>, retries = 3, timeout = 10000) {
  return lazy(() => {
    let retryCount = 0;
    
    const load = async (): Promise<any> => {
      try {
        // Create a promise that resolves with the module import
        const importPromise = moduleImportFn();
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Lazy load timeout')), timeout)
        );
        
        // Race the import against the timeout
        return await Promise.race([importPromise, timeoutPromise]);
      } catch (error) {
        // If we've used all retries, throw the error
        if (retryCount >= retries) {
          console.error('Failed to lazy load module after retries:', error);
          throw error;
        }
        
        // Increment retry count and try again with exponential backoff
        retryCount++;
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return load();
      }
    };
    
    return load();
  });
}

// Preload a module in the background without waiting for it to render
export function preloadModule(moduleImportFn: () => Promise<any>) {
  // Using requestIdleCallback for low-priority preloading
  // Falls back to setTimeout for browsers that don't support it
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        moduleImportFn().catch(err => 
          console.warn('Background preload failed:', err)
        );
      });
    } else {
      setTimeout(() => {
        moduleImportFn().catch(err => 
          console.warn('Background preload failed:', err)
        );
      }, 1000);
    }
  }
}