import { ReactNode } from 'react';
import { Link } from 'wouter';

interface LinkWithDescriptionProps {
  href: string;
  description: string;
  children: ReactNode;
  className?: string;
}

/**
 * An accessible link component that includes a description for screen readers
 * while maintaining the visible label for sighted users
 */
export function LinkWithDescription({
  href,
  description,
  children,
  className,
}: LinkWithDescriptionProps) {
  // For internal links (those that don't start with http/https), use wouter Link
  const isExternal = href.startsWith('http');
  
  const linkContent = (
    <>
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">{description}</span>
    </>
  );
  
  if (isExternal) {
    return (
      <a 
        href={href}
        className={className}
        aria-label={description}
        rel="noopener noreferrer"
      >
        {linkContent}
      </a>
    );
  }
  
  return (
    <Link href={href}>
      <a className={className} aria-label={description}>
        {linkContent}
      </a>
    </Link>
  );
}