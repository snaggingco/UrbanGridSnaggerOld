import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Award, CheckCircle, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function Certifications() {
  const { t } = useTranslation();
  const logoContainer1Ref = useRef<HTMLDivElement>(null);
  const logoContainer2Ref = useRef<HTMLDivElement>(null);

  return (
    <section id="certifications" className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">TRUSTED & CERTIFIED</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('certifications.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('certifications.subtitle')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center mb-12 gap-8">
          {/* InterNACHI logos with optimized image loading */}
          <div 
            ref={logoContainer1Ref}
            className="certification-logo-container rounded-lg shadow-md bg-white p-2 flex items-center justify-center"
            style={{ 
              width: '300px', 
              height: '220px',
              contain: 'layout paint'
            }}
          >
            {/* Create a fixed-size container with preserved aspect ratio */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{
                // Reserve space for the image to prevent layout shifts
                minHeight: '180px'
              }}
            >
              <img
                src="/internachi.webp"
                alt="InterNACHI Certified Professional Inspector"
                width={200}
                height={200}
                // Use width and height attributes for layout stability
                className="w-auto h-auto"
                loading="lazy"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  // Important: Don't clip or crop the image
                  objectFit: 'scale-down',
                  // Create space around the image
                  padding: '10px'
                }}
              />
            </div>
          </div>
          
          <div 
            ref={logoContainer2Ref}
            className="certification-logo-container rounded-lg shadow-md bg-white p-2 flex items-center justify-center"
            style={{ 
              width: '300px', 
              height: '220px',
              contain: 'layout paint'
            }}
          >
            {/* Create a fixed-size container with preserved aspect ratio */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{
                // Reserve space for the image to prevent layout shifts
                minHeight: '180px'
              }}
            >
              <img 
                src="/internachi2.webp"
                alt="InterNACHI Member"
                width={200}
                height={200}
                // Use width and height attributes for layout stability
                className="w-auto h-auto"
                loading="lazy"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  // Important: Don't clip or crop the image
                  objectFit: 'scale-down',
                  // Create space around the image
                  padding: '10px'
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#2D7E45] bg-opacity-10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-[#2D7E45]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('certifications.professional_inspector')}</h3>
                <p className="text-sm text-muted-foreground">
                  Our inspectors have completed rigorous training and testing required by InterNACHI
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#2D7E45] bg-opacity-10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-[#2D7E45]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Ongoing Education</h3>
                <p className="text-sm text-muted-foreground">
                  We continuously update our knowledge and skills through InterNACHI's education programs
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#2D7E45] bg-opacity-10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-[#2D7E45]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Standards of Practice</h3>
                <p className="text-sm text-muted-foreground">
                  We adhere to InterNACHI's comprehensive Standards of Practice for property inspections
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#2D7E45] bg-opacity-10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[#2D7E45]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('certifications.internachi')}</h3>
                <p className="text-sm text-muted-foreground">
                  We're part of InterNACHI's global network of certified professionals sharing best practices
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}