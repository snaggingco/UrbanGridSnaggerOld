import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import OptimizedImage from "@/components/ui/OptimizedImage";
import QuickResponseForm from "@/components/sections/QuickResponseForm";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SEO from "@/components/SEO";

export default function SnaggingServices() {
  // Create JSON-LD structured data for rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Professional Snagging Services Dubai",
    "description": "Premier property snagging services in Dubai. Our expert inspectors identify all defects in your property with comprehensive reporting and developer negotiation support.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Snagging By UrbanGrid",
      "image": "https://www.snagging.me/images/urbangrid-logo.png",
      "url": "https://www.snagging.me",
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
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Snagging Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Studio & 1 Bedroom Snagging",
            "description": "Comprehensive snagging inspection for studio and 1 bedroom properties in Dubai"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "2-3 Bedroom Apartment Snagging",
            "description": "Detailed snagging service for 2-3 bedroom apartments in Dubai"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Villa & Townhouse Snagging",
            "description": "Premium snagging inspection for villas and townhouses in Dubai"
          }
        }
      ]
    }
  };

  return (
    <>
      <SEO 
        title="Leading Snagging Company in Dubai | Expert Property Defect Detection"
        description="Dubai's premier snagging company with certified inspectors. We identify all property defects before handover, saving you time and money. Book now!"
        keywords={[
          "snagging dubai",
          "snagging company dubai", 
          "snagging companies in dubai",
          "dubai snagging",
          "property snagging dubai",
          "snagging inspection dubai",
          "snagging service in dubai",
          "snagging services dubai",
          "snagging company near me",
          "property inspection dubai",
          "property inspection services",
          "best snagging company",
          "snagging company",
          "property handover",
          "property handover uae",
          "move in inspection",
          "snagging experts dubai",
          "snagging dubai cost",
          "snagging dubai price",
          "handover inspection cost",
          "building dilapidation survey",
          "snagging cost",
          "top snagging companies in uae",
          "property snagging company"
        ]}
        canonicalUrl="https://www.snagging.me/snagging-services"
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
                Dubai's Most Trusted Snagging Company
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                With over 1000+ properties inspected across Dubai, our expert snagging specialists identify defects that others miss. 
                Protect your investment with the most thorough snagging service in Dubai.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/book-service">Book Snagging Inspection</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#snagging-process">Our Process</a>
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
                  src="https://images.unsplash.com/photo-1531973576160-7125cd663d86"
                  alt="Dubai Snagging Specialist examining property defects in a luxury apartment"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-start"
          >
            <motion.div variants={fadeIn} className="space-y-6">
              <h2 className="text-3xl font-bold">Why Choose Our Dubai Snagging Services</h2>
              
              <p className="text-muted-foreground">
                As Dubai's premier snagging company, we go beyond surface-level inspections to identify all defects 
                and construction issues before you accept your property. Our team of InterNACHI certified inspectors 
                follows a meticulous 200+ point checklist tailored specifically for Dubai properties.
              </p>
              
              <p className="text-muted-foreground">
                Unlike generalist building inspectors, our snagging specialists focus exclusively on identifying defects, quality 
                issues, and construction flaws that developers might miss or overlook. This specialized expertise makes us the 
                preferred snagging company for discerning Dubai property buyers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">200+ Point Checklist</h3>
                  <p className="text-muted-foreground">Thorough snagging methodology specific to Dubai properties</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Specialized Equipment</h3>
                  <p className="text-muted-foreground">Thermal cameras, moisture meters, and laser measures</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Dubai Developer Knowledge</h3>
                  <p className="text-muted-foreground">Experience with all major Dubai developers and communities</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Defect Resolution</h3>
                  <p className="text-muted-foreground">Developer follow-up and defect resolution tracking</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <div className="bg-card shadow-lg rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-4">Get a Snagging Quote</h3>
                <QuickResponseForm />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="snagging-process" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Our Dubai Snagging Process</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              A systematic approach to identifying property defects and ensuring they're resolved
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card shadow-md rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Inspection Planning</h3>
              <p className="text-muted-foreground">
                We coordinate with you and the developer to schedule the snagging inspection at the optimal time in the handover process.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card shadow-md rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Thorough Inspection</h3>
              <p className="text-muted-foreground">
                Our certified inspectors conduct a comprehensive room-by-room assessment using specialized equipment to identify all defects.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card shadow-md rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Detailed Report</h3>
              <p className="text-muted-foreground">
                We create a comprehensive report with photos documenting all defects, categorized by severity and location.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card shadow-md rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Developer Follow-up</h3>
              <p className="text-muted-foreground">
                We assist with submitting the report to your developer and can provide follow-up inspections to verify defect resolution.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Check */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">What Our Dubai Snagging Experts Check</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Our comprehensive snagging inspection includes checks of all these elements and more
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold">Structural Elements</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Walls for cracks and alignment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Ceiling for defects and water damage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Floors for levelness and defects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Balconies and terraces</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Windows and door frames</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold">Mechanical & Electrical</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>All electrical outlets and switches</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Light fixtures and ceiling fans</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>AC units and thermostats</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Plumbing fixtures and water pressure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Water heaters and pumps</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold">Finishes & Fixtures</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Paint finish and consistency</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Tiling work and grouting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Kitchen cabinets and countertops</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Bathroom fixtures and sealing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Doors, handles, and locks</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">What Our Dubai Clients Say</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Real feedback from property owners who used our snagging services
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card shadow-md rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "The team identified over 70 defects that I would have completely missed. Their detailed report 
                helped me get everything fixed before moving in. Best investment I made in my Dubai Marina apartment."
              </p>
              <div className="font-semibold">Mohamad A. - Dubai Marina</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card shadow-md rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "As a first-time buyer in Dubai, I was nervous about the handover process. The snagging inspection 
                gave me confidence and the developer actually complimented how thorough the report was."
              </p>
              <div className="font-semibold">Sarah T. - Downtown Dubai</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card shadow-md rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "Extremely professional service. They found issues with the AC system that would have cost thousands to fix later. 
                The developer fixed everything before my final handover. Highly recommend to all Dubai property buyers."
              </p>
              <div className="font-semibold">Rajesh M. - Dubai Hills Estate</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Frequently Asked Questions About Snagging in Dubai</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Common questions about our snagging services
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto divide-y">
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">What exactly is snagging and why is it important in Dubai?</h3>
              <p className="text-muted-foreground">
                Snagging is the process of identifying defects or issues in a newly built property before the final handover from 
                the developer. In Dubai's fast-paced construction environment, snagging is particularly important to ensure 
                quality standards are met and to avoid costly repairs later that may not be covered under warranty.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">When should I schedule a snagging inspection in Dubai?</h3>
              <p className="text-muted-foreground">
                Ideally, schedule a snagging inspection immediately after receiving the completion certificate from your developer 
                but before signing the final handover documents. This typically gives you a 7-14 day window when the property is 
                ready but you haven't yet taken final possession.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">How much does a professional snagging service cost in Dubai?</h3>
              <p className="text-muted-foreground">
                Snagging service costs in Dubai typically range from AED 1,500 to AED 3,500 depending on the property type and size. 
                Considering that we often identify defects that would cost many times this amount to fix after handover, it's a 
                worthwhile investment in protecting your property.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">Do Dubai developers have to fix the snags identified?</h3>
              <p className="text-muted-foreground">
                Yes, Dubai developers are obligated to rectify genuine defects and construction issues identified during the snagging process. 
                Our professional reports carry weight with developers, and we can help you communicate effectively with them to ensure all 
                legitimate issues are addressed before final handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Book Your Dubai Property Snagging?</h2>
            <p className="text-xl mb-8">
              Don't risk missing critical defects in your new Dubai property. Book our professional snagging service today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/book-service">Book Snagging Inspection</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent" asChild>
                <a href="tel:+971501231234">Call For Details</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}