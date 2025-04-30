/**
 * CSS Optimization Utilities
 * 
 * This module contains utilities for optimizing CSS loading and performance,
 * including critical CSS extraction, deferred loading, and unused CSS removal.
 */

/**
 * Loads a CSS file asynchronously to prevent render blocking
 * 
 * @param href URL of the CSS file to load
 * @param media Media query for the stylesheet (defaults to 'all')
 * @param id Optional ID for the link element
 */
export function loadCssAsync(href: string, media: string = 'all', id?: string): void {
  // Create link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print'; // Start with print to avoid blocking
  if (id) link.id = id;
  
  // Add to document
  document.head.appendChild(link);
  
  // Once loaded, switch to the specified media
  link.onload = () => {
    link.media = media;
  };
  
  // Fallback: If link doesn't fire onload, switch media after a timeout
  setTimeout(() => {
    if (link.media === 'print') {
      link.media = media;
    }
  }, 1000);
}

/**
 * Loads CSS with priority hints
 * 
 * @param href URL of the CSS file to load
 * @param priority 'high', 'low', or 'auto'
 */
export function loadCssWithPriority(href: string, priority: 'high' | 'low' | 'auto' = 'auto'): void {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('fetchpriority', priority);
  document.head.appendChild(link);
}

/**
 * Preloads critical CSS
 * 
 * @param href URL of the CSS file to preload
 */
export function preloadCriticalCss(href: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Loads stylesheets based on media queries (responsive loading)
 * 
 * @param stylesheets Array of stylesheets with URLs and media queries
 */
export function loadResponsiveStylesheets(
  stylesheets: Array<{ href: string; media: string }>
): void {
  stylesheets.forEach(sheet => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = sheet.href;
    link.media = sheet.media;
    document.head.appendChild(link);
  });
}

/**
 * Dynamically loads CSS only when specific elements are present in the DOM
 * 
 * @param selector CSS selector to check for
 * @param cssUrl URL of the CSS file to load if the selector matches
 */
export function loadCssIfSelectorExists(selector: string, cssUrl: string): void {
  // Only load the CSS if the selector matches elements on the page
  if (document.querySelector(selector)) {
    loadCssAsync(cssUrl);
  }
}

/**
 * Example usage:
 * 
 * // Load base styles with high priority
 * preloadCriticalCss('/css/critical.css');
 * loadCssWithPriority('/css/critical.css', 'high');
 * 
 * // Load non-critical styles asynchronously
 * loadCssAsync('/css/non-critical.css');
 * 
 * // Load responsive stylesheets
 * loadResponsiveStylesheets([
 *   { href: '/css/mobile.css', media: '(max-width: 640px)' },
 *   { href: '/css/tablet.css', media: '(min-width: 641px) and (max-width: 1024px)' },
 *   { href: '/css/desktop.css', media: '(min-width: 1025px)' }
 * ]);
 * 
 * // Load component-specific CSS only when that component exists
 * loadCssIfSelectorExists('.carousel', '/css/carousel.css');
 * loadCssIfSelectorExists('.data-table', '/css/data-table.css');
 */