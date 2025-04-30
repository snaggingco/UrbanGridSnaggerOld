import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LinkWithDescription } from "@/components/ui/LinkWithDescription";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const { t } = useTranslation();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [titleHeight, setTitleHeight] = useState<number>(0);
  
  // Optimize LCP by pre-rendering the title with fixed dimensions
  useEffect(() => {
    // Set fixed heights for different viewport sizes
    // This prevents layout shifts when the title renders
    setTitleHeight(window.innerWidth >= 768 ? 160 : 120);
    
    // Add preconnect for critical resources
    const preconnectLinks = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
    preconnectLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      if (href.includes('gstatic')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
    
    // Mark the subtitle as high priority LCP element
    if (subtitleRef.current) {
      // According to Lighthouse, the subtitle is the LCP element
      const subtitleElement = subtitleRef.current;
      
      // Use dataset instead of direct attributes for better compatibility
      subtitleElement.dataset.importance = 'high';
      
      // Force browser to prioritize this element's paint
      subtitleElement.style.display = 'block';
    }
  }, []);
  
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 hero-section overflow-hidden">
      {/* Add a subtle property image in background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <OptimizedImage
          src="/images/property-hero.svg"
          alt=""
          width={800}
          height={600}
          className="w-full h-full object-cover"
          aria-hidden="true"
          loading="eager"
          priority
        />
      </div>
      
      {/* Mobile fixes - prevent horizontal scrolling and ensure content fits */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
          body, html {
            overflow-x: hidden;
            width: 100%;
            position: relative;
          }
          .hero-section {
            width: 100vw;
            overflow-x: hidden;
          }
          .hero-container {
            width: 100%;
            max-width: 100%;
            padding-left: 16px;
            padding-right: 16px;
            box-sizing: border-box;
          }
        }
        
        /* Create a placeholder for the title with correct dimensions to prevent layout shifts */
        .hero-title {
          min-height: ${titleHeight > 0 ? `${titleHeight}px` : '120px'};
        }
        @media (min-width: 768px) {
          .hero-title {
            min-height: ${titleHeight > 0 ? `${titleHeight}px` : '160px'};
          }
        }
      `}} />
      
      <div className="relative z-10 hero-container w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-40">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Fix layout shift by using fixed heights with proper overflow handling */}
          <div className="hero-title mb-6 sm:mb-8 flex items-center justify-center">
            <h1 
              ref={titleRef}
              className="text-4xl sm:text-5xl md:text-7xl font-normal text-gray-900 leading-tight"
            >
              {t('hero.title')}
            </h1>
          </div>

          <div className="min-h-[100px] md:min-h-[140px] mb-6 sm:mb-8 flex items-center justify-center">
            <p 
              ref={subtitleRef}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
              id="hero-subtitle"
            >
              {t('hero.subtitle')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <Clock className="h-5 w-5 text-[#2D7E45]" />
            <p className="text-sm font-medium text-[#2D7E45]">
              {t('hero.limited_offer')}
            </p>
          </div>

          {/* Certification text badge - lighter alternative to improve performance */}
          <div className="flex justify-center items-center mb-8">
            <Badge variant="outline" className="bg-white bg-opacity-70 px-3 py-1.5 text-[#2D7E45]">
              InterNACHI Certified Company
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-shadow group bg-[#2D7E45] hover:bg-[#2D7E45]/90 text-white"
              asChild
            >
              <LinkWithDescription href="/book-service" description="Book a property inspection service">
                {t('hero.cta')}
              </LinkWithDescription>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 rounded-full border-2 hover:bg-gray-50"
              asChild
            >
              <LinkWithDescription href="#services" description="Learn more about our property snagging services">
                {t('hero.learn_more')}
              </LinkWithDescription>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}