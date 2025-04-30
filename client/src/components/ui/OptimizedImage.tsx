import { useState, useEffect, DetailedHTMLProps, ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  blurPlaceholder?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * OptimizedImage component for improved image loading and performance
 * - Lazy loads images by default for better performance
 * - Supports priority loading for above-the-fold images
 * - Provides placeholder for better UX during loading
 * - Helps prevent Cumulative Layout Shift (CLS)
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  blurPlaceholder = false,
  objectFit = 'cover',
  className = '',
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Load image with IntersectionObserver for better performance
  useEffect(() => {
    if (!src || priority) return;
    
    const imgElement = document.querySelector(`img[data-src="${src}"]`) as HTMLImageElement;
    if (!imgElement) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        observer.unobserve(img);
      });
    }, {
      rootMargin: '200px 0px', // Start loading when image is 200px from viewport
      threshold: 0.01
    });
    
    observer.observe(imgElement);
    
    return () => {
      if (imgElement) observer.unobserve(imgElement);
    };
  }, [src, priority]);
  
  // Handle image load success
  const handleLoad = () => {
    setLoaded(true);
  };
  
  // Handle image load error
  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };
  
  // Determine if we should use a placeholder
  const showPlaceholder = !loaded && !error && blurPlaceholder;
  
  // Generate appropriate styles for the image
  const imageStyles = {
    objectFit,
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    // Only set width and height if they are provided as props
    ...(width ? { width: `${width}px` } : {}),
    ...(height ? { height: `${height}px` } : {}),
  };
  
  // Placeholder element to show while image is loading
  const renderPlaceholder = () => {
    if (!showPlaceholder) return null;
    
    return (
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f3f4f6',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          transform: 'scale(1.05)',
        }}
      />
    );
  };
  
  // Render error state if image failed to load
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '240px',
        }}
        role="img"
        aria-label={alt}
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L13.5431 16M14.75 14L16.2501 12.1333C16.9943 11.2175 18.3422 11.3433 19.1769 12.368L19.25 12.5"
          />
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M19.25 16V17.25M4.75 17.25V8.75C4.75 7.64543 5.64543 6.75 6.75 6.75H17.25C18.3546 6.75 19.25 7.64543 19.25 8.75V14"
          />
          <circle cx="17" cy="17" r="1" fill="currentColor" />
        </svg>
      </div>
    );
  }
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
      }}
    >
      {renderPlaceholder()}
      
      <img
        src={priority ? src : undefined}
        data-src={!priority ? src : undefined}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        style={imageStyles}
        width={width}
        height={height}
        className={`${className} w-full h-full`}
        {...props}
      />
    </div>
  );
}