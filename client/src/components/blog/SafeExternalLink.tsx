import React from 'react';

interface SafeExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SafeExternalLink component
 * Renders external links with rel="nofollow noopener" to prevent SEO advantages
 * Particularly useful for competitor links in blog posts
 */
const SafeExternalLink: React.FC<SafeExternalLinkProps> = ({ 
  href, 
  children, 
  className = '' 
}) => {
  // Define competitor domains that should always use nofollow
  const competitorDomains = [
    'propertysnagging.ae',
    'propertyfinder.ae',
    'thesnagmaster.ae',
    'landsterling.com',
    'propertycheck.me'
  ];
  
  // Check if the URL is for a competitor
  const isCompetitor = competitorDomains.some(domain => href.includes(domain));
  
  // Set the appropriate rel attributes
  const relValue = isCompetitor 
    ? 'nofollow noopener noreferrer' 
    : 'noopener noreferrer';

  return (
    <a 
      href={href} 
      target="_blank" 
      rel={relValue}
      className={className}
    >
      {children}
    </a>
  );
};

export default SafeExternalLink;