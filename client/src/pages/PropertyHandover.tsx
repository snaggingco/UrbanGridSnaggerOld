import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import OptimizedImage from "@/components/ui/OptimizedImage";
import QuickResponseForm from "@/components/sections/QuickResponseForm";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SEO from "@/components/SEO";

export default function PropertyHandover() {
  // JSON-LD structured data for this service
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Dubai Property Handover Inspection Services",
    "description": "Professional property handover inspection services in Dubai to identify defects and issues before final acceptance from developers.",
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
    "serviceType": "Property Handover Inspection",
    "areaServed": {
      "@type": "City",
      "name": "Dubai, UAE"
    }
  };

  return (
    <>
      <SEO 
        title="Professional Property Handover Inspection in Dubai | Expert Handover Services"
        description="Expert property handover inspection services in Dubai. Our detailed assessments ensure your new property meets quality standards before final acceptance."
        keywords={[
          "property handover dubai", 
          "property handover", 
          "property handover uae", 
          "handover inspection dubai", 
          "new property handover",
          "property handover inspection",
          "move in inspection",
          "handover inspection cost",
          "dubai property handover",
          "property inspection",
          "property inspection dubai",
          "property inspection services"
        ]}
        canonicalUrl="https://www.snagging.me/property-handover"
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
                Expert Property Handover Inspection in Dubai
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Don't accept your new Dubai property until our experts have inspected it. 
                Our comprehensive handover inspection identifies all defects that developers must fix before you move in.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/book-service">Book Handover Inspection</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#handover-process">Handover Process</a>
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
                  src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0"
                  alt="Dubai Property Handover Inspection by certified professionals"
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
              <h2 className="text-3xl font-bold">Why Property Handover Inspection Is Critical in Dubai</h2>
              
              <p className="text-muted-foreground">
                The property handover stage is your one opportunity to ensure developers address all defects 
                in your new Dubai property before final acceptance. Our professional handover inspection service 
                identifies issues that might otherwise cost you thousands to fix after the warranty period.
              </p>
              
              <p className="text-muted-foreground">
                Dubai's construction boom means developers are under pressure to complete projects quickly, which can 
                sometimes lead to quality issues. Our handover inspection specialists are familiar with all major 
                Dubai developers and common issues in different communities, giving you peace of mind during this critical phase.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Developer Leverage</h3>
                  <p className="text-muted-foreground">Get defects fixed while developer is still responsible</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Detailed Documentation</h3>
                  <p className="text-muted-foreground">Comprehensive evidence of all property issues</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Professional Assessment</h3>
                  <p className="text-muted-foreground">Certified inspectors catch what you might miss</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Dubai Experience</h3>
                  <p className="text-muted-foreground">Specialized knowledge of Dubai property standards</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <div className="bg-card shadow-lg rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-4">Book Your Handover Inspection</h3>
                <QuickResponseForm />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="handover-process" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">The Dubai Property Handover Process</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              A complete guide to the property handover inspection process in Dubai
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card shadow-md rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Completion Notice</h3>
              <p className="text-muted-foreground">
                When you receive the completion notice from your developer, contact us immediately to schedule your handover inspection.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card shadow-md rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Inspection</h3>
              <p className="text-muted-foreground">
                Our certified inspectors conduct a thorough examination of your property using specialized equipment to identify all defects.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card shadow-md rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Comprehensive Report</h3>
              <p className="text-muted-foreground">
                We provide a detailed defect report with photographic evidence that you can submit to your developer for rectification.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card shadow-md rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Defect Resolution</h3>
              <p className="text-muted-foreground">
                We can assist with follow-up inspections to verify all defects have been properly fixed before final acceptance.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dubai Developers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Dubai Developers We Work With</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              We provide handover inspection services for properties from all major Dubai developers
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="bg-card p-4 rounded-lg shadow-md text-center"
            >
              <p className="font-semibold">Emaar Properties</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-card p-4 rounded-lg shadow-md text-center"
            >
              <p className="font-semibold">Nakheel</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-card p-4 rounded-lg shadow-md text-center"
            >
              <p className="font-semibold">Damac Properties</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-card p-4 rounded-lg shadow-md text-center"
            >
              <p className="font-semibold">Dubai Properties</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-card p-4 rounded-lg shadow-md text-center"
            >
              <p className="font-semibold">Meraas</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-card p-4 rounded-lg shadow-md text-center"
            >
              <p className="font-semibold">Sobha Realty</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="bg-card p-4 rounded-lg shadow-md text-center"
            >
              <p className="font-semibold">Azizi Developments</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="bg-card p-4 rounded-lg shadow-md text-center"
            >
              <p className="font-semibold">All Dubai Developers</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dubai Communities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Dubai Communities We Cover</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Our handover inspection services are available across all Dubai communities and developments
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Downtown Dubai</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Dubai Marina</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Palm Jumeirah</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Dubai Hills Estate</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Arabian Ranches</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Jumeirah Village Circle</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Business Bay</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Dubai Creek Harbour</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Bluewaters Island</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Dubai South</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">Meydan</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.55 }}
              className="p-3 bg-card/50 rounded-lg"
            >
              <p className="font-medium">All Dubai Areas</p>
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
            <h2 className="text-3xl font-bold">FAQs About Property Handover in Dubai</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Common questions about the property handover process in Dubai
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto divide-y">
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">When is the best time to conduct a handover inspection in Dubai?</h3>
              <p className="text-muted-foreground">
                The best time to conduct a handover inspection is immediately after receiving the completion notice from 
                your developer but before signing the final handover documents. This gives you leverage to ensure all 
                defects are rectified before you take possession and begin making payments.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">What happens if defects are found during the handover inspection?</h3>
              <p className="text-muted-foreground">
                If defects are found during the handover inspection, we document them with photographic evidence in a 
                comprehensive report. You can then submit this report to your developer who is obligated to rectify these 
                issues before you accept the property. In Dubai, this is a standard part of the handover process.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">Can I delay handover in Dubai if issues are found?</h3>
              <p className="text-muted-foreground">
                Yes, you can typically delay the final handover in Dubai if significant issues are found during the inspection. 
                Most Dubai developers allow a reasonable period for defect rectification before expecting you to complete 
                the handover process, especially when presented with a professional inspection report.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">How does the Dubai handover process differ from other regions?</h3>
              <p className="text-muted-foreground">
                The Dubai handover process involves specific legal frameworks and standards set by the Dubai Land Department. 
                Property handovers in Dubai often involve more documentation, specific timelines for defect rectification, 
                and particular attention to build quality due to the rapid construction pace and climate considerations.
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
            <h2 className="text-3xl font-bold mb-4">Ready for Your Dubai Property Handover?</h2>
            <p className="text-xl mb-8">
              Book our professional handover inspection service to ensure your new Dubai property meets quality standards.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/book-service">Book Handover Inspection</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent" asChild>
                <a href="tel:+971501231234">Call For Availability</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}