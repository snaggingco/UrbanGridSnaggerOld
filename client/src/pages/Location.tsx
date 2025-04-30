import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import UnifiedActionButtons from "@/components/ui/UnifiedActionButtons";

export default function Location() {
  const { t } = useTranslation();

  useEffect(() => {
    // Add the LocalBusiness schema with address information
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'location-schema';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Snagging By UrbanGrid",
      "url": "https://www.snagging.me",
      "logo": "https://www.snagging.me/favicon.svg",
      "telephone": "+971 50 778 9712",
      "email": "info@snagging.me",
      "description": "Professional property inspection and snagging services in Dubai. Comprehensive inspections for property handover, warranty, and resale.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Naema Ali Buamim Building - 306",
        "addressLocality": "Al Bada'a",
        "addressRegion": "Dubai",
        "postalCode": "000000",
        "addressCountry": "AE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 25.2276,
        "longitude": 55.2673
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Saturday"],
          "opens": "10:00",
          "closes": "14:00"
        }
      ],
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 25.2048,
          "longitude": 55.2708
        },
        "geoRadius": "50000"
      }
    });
    document.head.appendChild(script);
    
    return () => {
      const existingScript = document.getElementById('location-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // List of neighborhoods we serve
  const neighborhoods = [
    "Dubai Marina",
    "Downtown Dubai",
    "Palm Jumeirah",
    "Arabian Ranches",
    "Jumeirah Village Circle",
    "Dubai Hills Estate",
    "Business Bay",
    "Emirates Hills",
    "Jumeirah Lake Towers",
    "The Springs",
    "The Meadows",
    "The Greens",
    "Dubai Silicon Oasis",
    "Mirdif",
    "Damac Hills",
    "Sports City"
  ];

  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="py-12 md:py-16 bg-primary/5">
          <div className="container">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-3">OUR LOCATION</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Where to Find Us</h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our office is conveniently located in Al Bada'a, Dubai, providing easy access for clients from all areas of the city.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="rounded-lg overflow-hidden h-[400px] shadow-lg">
                {/* Google Maps iframe */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.9531256529283!2d55.26519182396201!3d25.2276014771147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f4294b73e2fed%3A0x1eaead3b527ca7b0!2sNaema%20Ali%20Buamim%20Building%20-%20Al%20Badaa%20St%20-%20Al%20Bada&#39;a%20-%20Dubai!5e0!3m2!1sen!2sae!4v1710520120321!5m2!1sen!2sae" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen
                  loading="lazy"
                  aria-label="Office location map"
                ></iframe>
              </div>
              
              <div className="space-y-6 px-4">
                <h2 className="text-3xl font-bold">Our Dubai Office</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Address:</p>
                      <p className="text-muted-foreground">Naema Ali Buamim Building - 306, Al Bada'a, Dubai, UAE</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Phone:</p>
                      <p className="text-muted-foreground">+971 50 778 9712</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email:</p>
                      <p className="text-muted-foreground">info@snagging.me</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-xl font-semibold mb-3">Working Hours</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span>10:00 AM - 2:00 PM</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span>Closed</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button size="lg" className="gap-2 w-full md:w-auto">
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12 bg-gray-50">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Areas We Serve in Dubai</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                We provide property inspection and snagging services throughout Dubai, covering all major residential and commercial areas.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {neighborhoods.map((neighborhood, index) => (
                <div 
                  key={index} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{neighborhood}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Don't see your area? We cover all of Dubai and surrounding emirates. 
                <span className="text-primary font-medium"> Contact us for service availability.</span>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <UnifiedActionButtons />
    </>
  );
}