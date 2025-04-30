import React, { lazy } from 'react';

/**
 * Creates a lazy-loaded component with default loading state
 * 
 * @param importFn - Dynamic import function for the component
 * @returns A lazy-loaded component
 */
export function lazyLoad(importFn: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(importFn);
}

/**
 * Legacy browser-compatible version of the native import.meta.glob for dynamic imports
 */
export function createDynamicImports(
  moduleMap: Record<string, () => Promise<{ default: React.ComponentType<any> }>>
) {
  return moduleMap;
}

/**
 * Register modules that can be preloaded during idle time
 * 
 * @param imports - Object mapping module names to their import functions
 */
export function registerPreloadableModules(imports: Record<string, () => Promise<any>>) {
  if (typeof window === 'undefined') return;

  // Store the imports in a global registry
  window.__PRELOADABLE_MODULES__ = window.__PRELOADABLE_MODULES__ || {};
  Object.assign(window.__PRELOADABLE_MODULES__, imports);
}

/**
 * Preload a module during browser idle time
 * 
 * @param moduleName - Name of the module to preload
 */
export function preloadModule(moduleName: string) {
  if (typeof window === 'undefined' || !window.__PRELOADABLE_MODULES__) return;

  const importFunc = window.__PRELOADABLE_MODULES__[moduleName];
  if (importFunc) {
    // Use requestIdleCallback to preload during idle time
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        importFunc();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        importFunc();
      }, 1000);
    }
  }
}

// Augment the Window interface
declare global {
  interface Window {
    __PRELOADABLE_MODULES__?: Record<string, () => Promise<any>>;
  }
}