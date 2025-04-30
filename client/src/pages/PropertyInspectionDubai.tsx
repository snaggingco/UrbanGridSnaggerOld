import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import OptimizedImage from "@/components/ui/OptimizedImage";
import QuickResponseForm from "@/components/sections/QuickResponseForm";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SEO from "@/components/SEO";

export default function PropertyInspectionDubai() {
  // Create JSON-LD structured data for rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Property Inspection Dubai",
    "description": "Professional property inspection services in Dubai by qualified surveyors. Comprehensive reports for handover, warranty and resale inspections.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Snagging By UrbanGrid",
      "image": "https://www.urbangrid.ae/images/urbangrid-logo.png",
      "url": "https://www.urbangrid.ae",
      "telephone": "+971-50-123-4567",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Naema Ali Buamim Building - 306 - Al Bada'a",
        "addressLocality": "Dubai",
        "addressRegion": "Dubai",
        "postalCode": "00000",
        "addressCountry": "AE"
      }
    },
    "areaServed": {
      "@type": "City", 
      "name": "Dubai"
    },
    "serviceType": "Property Inspection",
    "serviceOutput": "Detailed inspection report with photographs and remedial action plans",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": "https://www.urbangrid.ae/book-service",
      "servicePhone": "+971-50-123-4567",
      "serviceSmsNumber": "+971-50-123-4567"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Mohammed A."
        },
        "reviewBody": "Excellent property inspection service. Very thorough and professional inspectors."
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "156"
    }
  };

  return (
    <>
      <SEO 
        title="Property Inspection Dubai | Expert Building & Home Inspection"
        description="Top-rated property inspection services in Dubai by certified professionals. Comprehensive handover, warranty, and resale inspections with detailed reports."
        keywords={[
          "property inspection dubai",
          "dubai property inspection",
          "home inspection dubai",
          "building inspection uae",
          "property inspection service dubai",
          "handover inspection dubai",
          "resale property inspection dubai",
          "villa inspection dubai",
          "apartment inspection dubai",
          "commercial inspection dubai"
        ]}
        canonicalUrl="https://www.urbangrid.ae/property-inspection-dubai"
        jsonLd={jsonLd}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/2"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Professional Property Inspection in Dubai
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Expert inspection services for all property types in Dubai. Our certified inspectors provide thorough assessments, detailed reports and actionable recommendations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/book-service">Book Property Inspection</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#inspection-services">Our Services</a>
                </Button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:w-1/2"
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1513584684374-8bab748fbf90"
                  alt="Professional property inspectors in Dubai conducting a thorough building assessment"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="inspection-services" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Dubai Property Inspection Services</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Comprehensive inspection services tailored to different property needs in Dubai
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card shadow-md rounded-xl overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <span className="text-4xl font-bold">1</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Handover Inspection</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive inspection of newly built properties before accepting handover from the developer. We identify construction defects, 
                  finishing issues, and ensure all systems work as promised.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/property-handover">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card shadow-md rounded-xl overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-r from-green-500 to-green-700 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <span className="text-4xl font-bold">2</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Warranty Inspection</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed inspection before your property warranty period expires to identify any defects that should be fixed by 
                  the developer under warranty terms.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/snagging-services">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card shadow-md rounded-xl overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-r from-purple-500 to-purple-700 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <span className="text-4xl font-bold">3</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Resale Property Inspection</h3>
                <p className="text-muted-foreground mb-4">
                  Thorough inspection of resale properties to identify any existing issues before purchase, helping buyers make informed 
                  decisions and negotiate better prices.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/property-inspection">Learn More</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeIn}>
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952"
                  alt="Dubai property inspector using advanced equipment for building assessment"
                  width={600}
                  height={450}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="space-y-6">
              <h2 className="text-3xl font-bold">Why Choose Our Dubai Property Inspection</h2>
              
              <p className="text-muted-foreground">
                Our property inspection service in Dubai stands out for its thoroughness, expertise, and commitment to protecting your investment. 
                With certified inspectors, advanced technology, and detailed reporting, we ensure no issue goes unnoticed.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Certified Inspectors</h3>
                  <p className="text-muted-foreground">InterNACHI certified property inspection professionals</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Advanced Technology</h3>
                  <p className="text-muted-foreground">Thermal imaging, moisture detection, and laser measurements</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Detailed Reports</h3>
                  <p className="text-muted-foreground">Comprehensive documentation with photos and recommendations</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Negotiation Support</h3>
                  <p className="text-muted-foreground">Expert assistance in developer/seller discussions</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-xl bg-card shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 space-y-4">
                <h2 className="text-2xl font-bold">Get a Property Inspection Quote</h2>
                <p className="text-muted-foreground">
                  Fill out this form for a quick response and pricing for your Dubai property inspection needs.
                </p>
                <QuickResponseForm />
              </div>
              <div className="bg-primary/10 p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="bg-white/90 rounded-lg p-4 shadow-sm">
                    <p className="italic text-sm">
                      "The inspection was incredibly thorough. They found issues I would never have noticed until it was too late. 
                      Definitely the best property inspection service in Dubai."
                    </p>
                    <p className="font-semibold mt-2">— Fatima K., Dubai Marina</p>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 shadow-sm">
                    <p className="italic text-sm">
                      "Worth every dirham. Their property inspection report gave me leverage to negotiate repairs with the developer 
                      before accepting handover."
                    </p>
                    <p className="font-semibold mt-2">— James T., Downtown Dubai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Dubai Property Inspection FAQs</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Common questions about our property inspection services in Dubai
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto divide-y">
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">How much does a property inspection cost in Dubai?</h3>
              <p className="text-muted-foreground">
                Property inspection costs in Dubai typically range from AED 1,500 for a studio apartment to AED 5,000+ for larger 
                villas and townhouses. Factors affecting the price include property size, type, age, and the scope of the inspection.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">How long does a property inspection take in Dubai?</h3>
              <p className="text-muted-foreground">
                A comprehensive property inspection in Dubai usually takes 2-5 hours depending on the property size and type. Apartments 
                typically take 2-3 hours, while villas may require up to 5 hours for a thorough inspection.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">What's included in a Dubai property inspection report?</h3>
              <p className="text-muted-foreground">
                Our Dubai property inspection reports include detailed assessments of structural elements, electrical and plumbing systems, 
                HVAC, fixtures, finishes, and external areas. Each report contains photographs documenting issues, severity ratings, 
                and recommended remedial actions.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">Do you inspect commercial properties in Dubai?</h3>
              <p className="text-muted-foreground">
                Yes, we provide comprehensive commercial property inspections in Dubai for office spaces, retail units, warehouses, 
                and other commercial buildings. Our commercial inspections assess structural integrity, MEP systems, safety compliance, 
                and maintenance requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Ready for a Professional Property Inspection in Dubai?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Book your inspection today and ensure your property investment is protected
            </p>
            <Button asChild size="lg" className="px-8">
              <Link href="/book-service">Book Property Inspection</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}