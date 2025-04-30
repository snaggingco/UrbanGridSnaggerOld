import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  widths: number[];
  sizes: string;
  className?: string;
  containerClassName?: string;
  loadingPlaceholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  aspectRatio?: number;
  priority?: boolean;
  eager?: boolean;
}

/**
 * ResponsiveImage - Advanced responsive image component
 * 
 * Features:
 * - Automatically generates srcSet based on provided widths
 * - Supports different loading strategies (lazy, eager, priority)
 * - Maintains aspect ratio to prevent layout shifts
 * - Shows loading placeholder and handles errors
 * - Supports image format detection and optimization
 */
export default function ResponsiveImage({
  src,
  alt,
  widths,
  sizes,
  className,
  containerClassName,
  loadingPlaceholder,
  onLoad,
  onError,
  fallbackSrc,
  aspectRatio,
  priority = false,
  eager = false,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Determine image type based on extension
  const extension = src.split('.').pop()?.toLowerCase() || '';
  const isWebp = extension === 'webp';
  const isJpg = extension === 'jpg' || extension === 'jpeg';
  const isPng = extension === 'png';
  
  // Generate srcSet string
  const srcSet = widths
    .map(width => `${src}?w=${width} ${width}w`)
    .join(', ');
  
  // Handle image loading
  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
    if (onError) onError();
    
    // Try fallback image if provided
    if (fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc;
    }
  };
  
  // Use IntersectionObserver for more efficient lazy loading
  useEffect(() => {
    if (!imgRef.current || priority || eager) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imgRef.current) {
            // When the image is in viewport, set the src and srcSet
            imgRef.current.src = src;
            imgRef.current.srcset = srcSet;
            
            // Disconnect the observer after loading starts
            observer.disconnect();
          }
        });
      },
      { 
        rootMargin: '200px', // Load image when it's 200px from viewport
        threshold: 0.01 
      }
    );
    
    observer.observe(imgRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [src, srcSet, priority, eager]);
  
  // Calculate padding based on aspect ratio to prevent layout shifts
  const paddingBottom = aspectRatio ? `${(1 / aspectRatio) * 100}%` : undefined;
  
  // Preload high priority images
  useEffect(() => {
    if (priority && src) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      preloadLink.imageSrcset = srcSet;
      preloadLink.imageSizes = sizes;
      document.head.appendChild(preloadLink);
      
      return () => {
        document.head.removeChild(preloadLink);
      };
    }
  }, [src, srcSet, sizes, priority]);
  
  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )} 
      style={{ paddingBottom }}
    >
      {/* Loading placeholder */}
      {(!loaded && !error) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          {loadingPlaceholder || null}
        </div>
      )}
      
      {/* The actual image */}
      <img
        ref={imgRef}
        src={priority || eager ? src : ''}
        srcSet={priority || eager ? srcSet : ''}
        sizes={sizes}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          error && !fallbackSrc && 'hidden',
          className
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Error state */}
      {error && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <span>Image failed to load</span>
        </div>
      )}
    </div>
  );
}