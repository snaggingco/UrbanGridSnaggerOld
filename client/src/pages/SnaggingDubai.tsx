import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import OptimizedImage from "@/components/ui/OptimizedImage";
import QuickResponseForm from "@/components/sections/QuickResponseForm";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import { BsCheck2Circle } from "react-icons/bs";

export default function SnaggingDubai() {
  // Create JSON-LD structured data for rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Professional Snagging Services Dubai",
    "description": "Expert property snagging services in Dubai with comprehensive defect identification, detailed reports, and developer liaison for resolution.",
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
    "serviceType": "Property Snagging",
    "serviceOutput": "Detailed snagging report with photographs and remedial action plans",
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
          "name": "Sarah M."
        },
        "reviewBody": "Excellent snagging service. They found over 120 defects in my apartment that I would have missed."
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "142"
    }
  };

  return (
    <>
      <SEO 
        title="Snagging Dubai | Professional Property Snagging Services"
        description="Expert property snagging in Dubai by certified professionals. Thorough defect inspections, comprehensive reports, and developer liaison for new and existing properties."
        keywords={[
          "snagging dubai",
          "property snagging dubai",
          "snag inspection dubai",
          "villa snagging dubai",
          "apartment snagging dubai",
          "handover snagging dubai",
          "property defect inspection dubai",
          "snagging company dubai",
          "best snagging service dubai",
          "affordable snagging dubai",
          "snagging dubai price",
          "snagging dubai cost",
          "best snagging company",
          "snagging experts dubai",
          "dubai property snagging",
          "property inspection dubai",
          "snagging companies in dubai",
          "snagging inspection in dubai"
        ]}
        canonicalUrl="https://www.urbangrid.ae/snagging-dubai"
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
                Dubai's Premier Property Snagging Service
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Expert snagging inspections for Dubai properties. We identify all defects before you accept handover, ensuring your property meets the highest standards.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/book-service">Book Snagging Inspection</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#our-process">View Our Process</a>
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
                  src="https://images.unsplash.com/photo-1600607687644-c7f33f0fa46d"
                  alt="Professional snagging inspection of a luxury Dubai apartment"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is Snagging Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">What is Property Snagging in Dubai?</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              A comprehensive service to identify and document property defects before handover
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-muted-foreground mb-6">
                Property snagging in Dubai is a thorough inspection process designed to identify any defects, 
                issues, or unfinished work in newly built or existing properties. These can range from minor 
                cosmetic issues to serious structural problems that need to be addressed.
              </p>
              <p className="text-muted-foreground mb-6">
                Our professional snagging service in Dubai provides an independent, detailed assessment of your 
                property before you accept handover from the developer or make a purchase, ensuring you're aware of 
                all issues and can have them rectified.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-2">
                  <BsCheck2Circle className="text-primary mt-1" size={20} />
                  <span>Structural issues</span>
                </div>
                <div className="flex items-start gap-2">
                  <BsCheck2Circle className="text-primary mt-1" size={20} />
                  <span>Plumbing defects</span>
                </div>
                <div className="flex items-start gap-2">
                  <BsCheck2Circle className="text-primary mt-1" size={20} />
                  <span>Electrical problems</span>
                </div>
                <div className="flex items-start gap-2">
                  <BsCheck2Circle className="text-primary mt-1" size={20} />
                  <span>HVAC malfunctions</span>
                </div>
                <div className="flex items-start gap-2">
                  <BsCheck2Circle className="text-primary mt-1" size={20} />
                  <span>Finishing flaws</span>
                </div>
                <div className="flex items-start gap-2">
                  <BsCheck2Circle className="text-primary mt-1" size={20} />
                  <span>Safety hazards</span>
                </div>
              </div>
              <Button asChild>
                <Link href="/snagging-services">Learn More About Snagging Services</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1594540739236-4a45070c2d39"
                  alt="Detailed snagging inspection being performed in a Dubai property"
                  width={600}
                  height={450}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section id="our-process" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold">Our Dubai Snagging Process</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              A methodical approach to property inspection ensuring nothing is missed
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
              <div className="h-2 bg-primary"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Initial Assessment</h3>
                <p className="text-muted-foreground">
                  Our professional inspectors conduct a thorough walkthrough of every room and space in your 
                  Dubai property, checking walls, ceilings, floors, fixtures, and systems against industry standards.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card shadow-md rounded-xl overflow-hidden"
            >
              <div className="h-2 bg-primary"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Defect Documentation</h3>
                <p className="text-muted-foreground">
                  We document every defect with high-resolution photographs, detailed descriptions, and precise 
                  locations, creating a comprehensive record of all issues found during the snagging inspection.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card shadow-md rounded-xl overflow-hidden"
            >
              <div className="h-2 bg-primary"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Report Generation</h3>
                <p className="text-muted-foreground">
                  We compile a professional, detailed snagging report that categorizes issues by type, 
                  location, and severity, providing you with a clear overview of your property's condition.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card shadow-md rounded-xl overflow-hidden"
            >
              <div className="h-2 bg-primary"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Client Consultation</h3>
                <p className="text-muted-foreground">
                  We walk you through the findings, explaining each issue, its implications, and 
                  recommended resolution, ensuring you fully understand the state of your Dubai property.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-card shadow-md rounded-xl overflow-hidden"
            >
              <div className="h-2 bg-primary"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">5</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Developer Communication</h3>
                <p className="text-muted-foreground">
                  We can liaise with your developer on your behalf, presenting our findings professionally 
                  and technically, increasing the likelihood of swift and proper rectification.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-card shadow-md rounded-xl overflow-hidden"
            >
              <div className="h-2 bg-primary"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">6</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Follow-up Inspection</h3>
                <p className="text-muted-foreground">
                  After rectification work is complete, we conduct a follow-up inspection to verify that all 
                  issues have been properly addressed to meet Dubai's quality standards.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Check Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">What We Check During Dubai Snagging</h2>
              
              <p className="text-muted-foreground">
                Our comprehensive snagging inspections in Dubai cover every aspect of your property, 
                from visible finishes to hidden infrastructure systems. Our certified inspectors use advanced 
                tools and techniques to identify even the most subtle defects.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Structural Elements</AccordionTrigger>
                  <AccordionContent>
                    We inspect foundations, load-bearing walls, columns, beams, and slabs for cracks, settling, 
                    misalignments, and other structural issues that could affect your Dubai property's integrity 
                    and safety.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Mechanical Systems</AccordionTrigger>
                  <AccordionContent>
                    Our inspectors test all HVAC systems, ensuring proper airflow, temperature control, 
                    and ventilation throughout your Dubai property, checking for installation defects and performance issues.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Electrical Components</AccordionTrigger>
                  <AccordionContent>
                    We verify all electrical outlets, switches, lighting fixtures, circuit breakers, and distribution 
                    panels for proper installation, functionality, and safety compliance with Dubai regulations.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Plumbing Systems</AccordionTrigger>
                  <AccordionContent>
                    Our thorough inspection includes checking all water supply lines, drainage systems, fixtures, 
                    water pressure, and water heaters for leaks, improper installation, and functionality issues.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Finishes & Aesthetics</AccordionTrigger>
                  <AccordionContent>
                    We examine all interior and exterior finishes including paint, tiling, flooring, ceilings, 
                    cabinetry, countertops, and trim work for defects, damages, or poor workmanship.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden shadow-md">
                  <OptimizedImage 
                    src="https://images.unsplash.com/photo-1541123603104-512919d6a96c"
                    alt="Electrical system inspection during Dubai property snagging"
                    width={300}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <OptimizedImage 
                    src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789"
                    alt="Plumbing inspection as part of Dubai snagging service"
                    width={300}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-md col-span-2">
                  <OptimizedImage 
                    src="https://images.unsplash.com/photo-1614332287897-cdc485fa562d"
                    alt="Comprehensive structural inspection during property snagging in Dubai"
                    width={650}
                    height={350}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-xl bg-card shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 space-y-4">
                <h2 className="text-2xl font-bold">Get a Snagging Quote</h2>
                <p className="text-muted-foreground">
                  Fill out this form for a quick response and pricing for your Dubai property snagging needs.
                </p>
                <QuickResponseForm />
              </div>
              <div className="bg-primary/10 p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="bg-white/90 rounded-lg p-4 shadow-sm">
                    <p className="italic text-sm">
                      "The snagging team identified over 150 defects in my Dubai Marina apartment that I would never 
                      have spotted. Their detailed report helped me get everything fixed before moving in."
                    </p>
                    <p className="font-semibold mt-2">— Ahmed K., Dubai Marina</p>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 shadow-sm">
                    <p className="italic text-sm">
                      "As an overseas investor, I couldn't be present for the handover of my Dubai property. 
                      This snagging service acted as my eyes and ears, ensuring I got the quality I paid for."
                    </p>
                    <p className="font-semibold mt-2">— Emma L., Emirates Hills</p>
                  </div>
                </div>
              </div>
            </div>
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
            <h2 className="text-3xl font-bold">Dubai Snagging FAQs</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Common questions about our property snagging services in Dubai
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>How much does snagging cost in Dubai?</AccordionTrigger>
                <AccordionContent>
                  Snagging costs in Dubai typically range from AED 1,500 for small apartments to AED 5,000+ for large villas. 
                  The price depends on property size, type, and the scope of inspection required. We offer customized 
                  packages based on your specific needs and property characteristics.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="faq-2">
                <AccordionTrigger>When should I book a snagging inspection in Dubai?</AccordionTrigger>
                <AccordionContent>
                  The ideal time to book a snagging inspection in Dubai is immediately after receiving notification 
                  of property completion but before the official handover. This timing allows you to identify and address 
                  issues with the developer before you take possession, when they're most obligated to fix them.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="faq-3">
                <AccordionTrigger>How long does a snagging inspection take?</AccordionTrigger>
                <AccordionContent>
                  A thorough snagging inspection in Dubai typically takes 2-5 hours depending on the property size and 
                  complexity. A studio or 1-bedroom apartment usually requires 2-3 hours, while larger villas may take 
                  up to a full day to inspect properly.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="faq-4">
                <AccordionTrigger>What types of properties do you snag in Dubai?</AccordionTrigger>
                <AccordionContent>
                  We provide snagging services for all property types in Dubai, including apartments, penthouses, 
                  villas, townhouses, commercial spaces, and retail units. Our teams are experienced with all major 
                  Dubai developments and builder standards across various property categories.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="faq-5">
                <AccordionTrigger>Do developers have to fix all snagging issues?</AccordionTrigger>
                <AccordionContent>
                  In Dubai, developers are legally required to fix genuine defects and issues that don't meet the contractual 
                  specifications or building standards. However, they may dispute subjective or minor aesthetic issues. 
                  Our detailed, professional reports increase the likelihood of developers addressing all legitimate concerns.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Book Your Dubai Snagging Inspection?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Protect your investment with our professional snagging service
            </p>
            <Button asChild size="lg" className="px-8">
              <Link href="/book-service">Book Snagging Service</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}