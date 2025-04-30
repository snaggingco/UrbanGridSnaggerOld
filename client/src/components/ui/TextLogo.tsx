import { Link } from 'wouter';

interface TextLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
}

/**
 * TextLogo component
 * 
 * A lightweight text-based logo that loads instantly without image downloads
 * Matches the urbangrid-logo.html specification with "URBAN" in green (#2D7E45) and "GRID" in black
 */
export default function TextLogo({ 
  className = '', 
  size = 'md',
  linkTo = '/'
}: TextLogoProps) {
  const sizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold',
  };
  
  const textLogo = (
    <div className={`flex items-center ${className} ${sizeClasses[size]}`}>
      <span 
        className="text-[#2D7E45]" 
        style={{ 
          letterSpacing: '0.02em',
          fontWeight: 700,
        }}
      >
        URBAN
      </span>
      <span 
        className="text-black" 
        style={{ 
          letterSpacing: '0.02em',
          fontWeight: 700,
        }}
      >
        GRID
      </span>
    </div>
  );
  
  if (linkTo) {
    return (
      <Link href={linkTo}>
        <a className="inline-flex no-underline">
          {textLogo}
        </a>
      </Link>
    );
  }
  
  return textLogo;
}