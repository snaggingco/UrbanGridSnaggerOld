import { Helmet } from 'react-helmet';

/**
 * Preconnect Component - Establishes early connections to important domains
 * 
 * This component adds preconnect and dns-prefetch resource hints to improve
 * page load performance by establishing early connections to critical domains.
 * 
 * @see https://web.dev/preconnect-and-dns-prefetch/
 */
export default function Preconnect() {
  // Essential domains that should be connected to early
  const criticalDomains = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  // Additional domains that might be needed soon
  const secondaryDomains = [
    'https://www.youtube.com',
    'https://i.ytimg.com',
    'https://maps.googleapis.com'
  ];
  
  return (
    <Helmet>
      {/* Critical domains get both preconnect and dns-prefetch for maximum performance */}
      {criticalDomains.map(domain => (
        <link key={`preconnect-${domain}`} rel="preconnect" href={domain} crossOrigin="anonymous" />
      ))}
      {criticalDomains.map(domain => (
        <link key={`dns-prefetch-${domain}`} rel="dns-prefetch" href={domain} />
      ))}
      
      {/* Secondary domains just get dns-prefetch to avoid too many connections */}
      {secondaryDomains.map(domain => (
        <link key={`dns-prefetch-secondary-${domain}`} rel="dns-prefetch" href={domain} />
      ))}
    </Helmet>
  );
}