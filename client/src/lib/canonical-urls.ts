/**
 * Canonical URL utility for maintaining consistent URLs across the site
 * This helps prevent duplicate content issues between urbangrid.ae and snagging.me domains
 */

// Primary domain for the site
export const PRIMARY_DOMAIN = 'https://www.snagging.me';

// Secondary/legacy domain
export const SECONDARY_DOMAIN = 'https://www.urbangrid.ae';

/**
 * Generate a canonical URL for the current path
 * @param path - Current path (starting with "/")
 * @returns Full canonical URL
 */
export function getCanonicalUrl(path: string): string {
  // Ensure path starts with "/"
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Special case for home page
  if (normalizedPath === '/' || normalizedPath === '') {
    return PRIMARY_DOMAIN;
  }
  
  // Return full canonical URL with primary domain
  return `${PRIMARY_DOMAIN}${normalizedPath}`;
}

/**
 * Check if a URL is on the primary domain
 * @param url - URL to check
 * @returns Boolean indicating if URL is on primary domain
 */
export function isPrimaryDomain(url: string): boolean {
  return url.startsWith(PRIMARY_DOMAIN);
}

/**
 * Basic URL normalization
 * @param url - URL to normalize
 * @returns Normalized URL
 */
export function normalizeUrl(url: string): string {
  // Remove trailing slash except for root URL
  if (url.endsWith('/') && url !== PRIMARY_DOMAIN && url !== SECONDARY_DOMAIN) {
    return url.slice(0, -1);
  }
  return url;
}