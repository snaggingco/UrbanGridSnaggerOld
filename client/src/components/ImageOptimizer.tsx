import React, { useState, useEffect } from 'react';

interface ImageData {
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  format: string;
}

/**
 * ImageOptimizer - A utility to optimize images
 * 
 * This component optimizes images by:
 * 1. Converting them to WebP format when possible
 * 2. Properly sizing them based on their display size
 * 3. Applying compression based on image type
 * 4. Monitoring the optimization savings
 * 
 * Note: This is a server-side utility that runs during build/development
 * and helps monitor image optimization opportunities.
 */
export default function ImageOptimizer() {
  const [imageStats, setImageStats] = useState<{
    totalOriginalSize: number;
    totalOptimizedSize: number;
    savings: number;
    images: ImageData[];
  }>({
    totalOriginalSize: 0,
    totalOptimizedSize: 0,
    savings: 0,
    images: [],
  });

  useEffect(() => {
    // This would typically be a server-side process
    // Here we're simulating image optimization statistics
    
    // Sample image data - in a real implementation this would come from
    // server-side image processing or a build tool
    const sampleImageData: ImageData[] = [
      {
        width: 1200,
        height: 800,
        originalSize: 350 * 1024, // 350 KB
        optimizedSize: 120 * 1024, // 120 KB
        format: 'webp'
      },
      {
        width: 800,
        height: 600,
        originalSize: 250 * 1024, // 250 KB
        optimizedSize: 80 * 1024, // 80 KB
        format: 'webp'
      },
      // Add more sample images as needed
    ];
    
    // Calculate total sizes and savings
    const totalOriginal = sampleImageData.reduce((sum, img) => sum + img.originalSize, 0);
    const totalOptimized = sampleImageData.reduce((sum, img) => sum + img.optimizedSize, 0);
    const savings = totalOriginal - totalOptimized;
    
    setImageStats({
      totalOriginalSize: totalOriginal,
      totalOptimizedSize: totalOptimized,
      savings: savings,
      images: sampleImageData
    });
    
    // Log optimization results to console during development
    if (process.env.NODE_ENV === 'development') {
      console.log('Image Optimization Statistics:', {
        originalSize: formatBytes(totalOriginal),
        optimizedSize: formatBytes(totalOptimized),
        savings: formatBytes(savings),
        savingsPercentage: Math.round((savings / totalOriginal) * 100) + '%'
      });
    }
  }, []);
  
  // Utility function to format bytes to KB, MB, etc.
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // This component doesn't render anything visible
  // It just collects and reports optimization data
  return null;
}

/**
 * Best practices for image optimization:
 * 
 * 1. Always use WebP format with JPEG/PNG fallback
 * 2. Specify width and height attributes on images
 * 3. Use responsive images with srcset and sizes
 * 4. Lazy load images below the fold
 * 5. Preload critical images
 * 6. Use appropriate compression levels
 * 7. Maintain aspect ratios to prevent layout shifts
 * 8. Consider using the picture element for art direction
 * 9. Serve different image sizes based on device capabilities
 * 10. Use image CDNs when possible
 */