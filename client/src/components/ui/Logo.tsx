import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import OptimizedImage from './OptimizedImage';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  className?: string;
  href?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  iconOnly = false,
  className,
  href = '/'
}) => {
  // Adjusted to maintain the original logo's aspect ratio
  const sizeMap = {
    sm: { height: 34, width: 142 },
    md: { height: 45, width: 190 },
    lg: { height: 56, width: 235 }
  };
  
  const { height, width } = sizeMap[size];
  
  const content = (
    <a className={cn("flex items-center", className)}>
      <div 
        style={{
          height: `${height}px`,
          width: iconOnly ? `${height}px` : `${width}px`,
        }}
        className="overflow-hidden flex items-center justify-center bg-transparent -mt-1"
      >
        <OptimizedImage 
          src="/company/assets/logo-urban.png" 
          alt="UrbanGrid Logo" 
          height={height} 
          width={iconOnly ? height : width}
          className="object-contain max-w-full max-h-full w-auto h-auto"
          priority
          loading="eager"
          decoding="sync"
        />
      </div>
      {!iconOnly && (
        <span className="sr-only">UrbanGrid</span>
      )}
    </a>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

export default Logo;