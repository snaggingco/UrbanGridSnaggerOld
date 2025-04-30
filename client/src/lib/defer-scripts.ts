/**
 * Script Loading Optimizer
 * 
 * This utility helps to improve performance by deferring non-critical scripts
 * and loading them only when they are needed.
 */

interface DeferredScriptOptions {
  id?: string;
  async?: boolean;
  defer?: boolean;
  onLoad?: () => void;
}

/**
 * Load a script only when it's needed, after critical content has loaded
 */
export function loadScriptWhenNeeded(src: string, options: DeferredScriptOptions = {}) {
  // Check if script already exists to avoid duplicates
  const existingScript = document.getElementById(options.id || src) as HTMLScriptElement;
  if (existingScript) {
    if (options.onLoad) options.onLoad();
    return existingScript;
  }

  return new Promise<HTMLScriptElement>((resolve, reject) => {
    // Wait until page is mostly loaded before adding non-critical scripts
    if (document.readyState === 'complete') {
      createAndLoadScript(src, options, resolve, reject);
    } else {
      // Wait for important content to load first
      window.addEventListener('load', () => {
        // Add a small delay to prioritize other important resources
        setTimeout(() => {
          createAndLoadScript(src, options, resolve, reject);
        }, 100);
      });
    }
  });
}

/**
 * Helper to create and load a script element
 */
function createAndLoadScript(
  src: string, 
  options: DeferredScriptOptions,
  resolve: (script: HTMLScriptElement) => void,
  reject: (error: Error) => void
) {
  const script = document.createElement('script');
  script.src = src;
  script.type = 'text/javascript';
  
  if (options.id) {
    script.id = options.id;
  } else {
    script.id = src;
  }
  
  if (options.async) {
    script.async = true;
  }
  
  if (options.defer) {
    script.defer = true;
  }
  
  script.onload = () => {
    if (options.onLoad) options.onLoad();
    resolve(script);
  };
  
  script.onerror = () => {
    reject(new Error(`Script load error for ${src}`));
  };
  
  document.body.appendChild(script);
}

/**
 * Defer loading of third-party scripts until idle
 */
export function loadScriptOnIdle(src: string, options: DeferredScriptOptions = {}) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      loadScriptWhenNeeded(src, options);
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      loadScriptWhenNeeded(src, options);
    }, 2000); // Wait 2 seconds before loading non-critical scripts
  }
}