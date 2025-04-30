import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import OptimizedImage from "@/components/ui/OptimizedImage";
import QuickResponseForm from "@/components/sections/QuickResponseForm";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { generateSingleServiceSchema } from "@/lib/structuredData";
import SEO from "@/components/SEO";

export default function PropertyInspection() {
  // JSON-LD structured data for this service
  const structuredData = generateSingleServiceSchema({
    name: "Professional Property Inspection Services in Dubai",
    description: "Expert property inspection and snagging services in Dubai by InterNACHI-certified inspectors. Comprehensive handover inspections, warranty checks, and detailed property assessments.",
    provider: "UrbanGrid Property Inspection Services",
    serviceType: "Property Inspection",
    areaServed: "Dubai, UAE",
    offers: [
      {
        name: "Handover Property Inspection",
        description: "Comprehensive inspection for new properties before handover from the developer",
        price: "Starting from AED 1,500"
      },
      {
        name: "Warranty Property Inspection",
        description: "Detailed inspection before warranty period expires to identify defects covered by the developer",
        price: "Starting from AED 1,700"
      },
      {
        name: "Resale Property Inspection",
        description: "Complete assessment of resale properties to identify existing and potential issues",
        price: "Starting from AED 1,800"
      }
    ]
  });

  return (
    <>
      <SEO
        title="Professional Property Inspection Services in Dubai | UrbanGrid"
        description="Expert property inspection services in Dubai by InterNACHI-certified inspectors. Comprehensive handover inspections, warranty checks, detailed assessments and reports. Book now!"
        keywords={[
          "property inspection",
          "property inspection company dubai",
          "property inspection dubai",
          "property inspection abu dhabi",
          "dubai property inspection",
          "dubai building inspection", 
          "handover inspection dubai",
          "villa inspection dubai",
          "apartment inspection dubai",
          "real estate inspection dubai",
          "home inspection dubai",
          "professional property inspector dubai",
          "UAE property inspection services",
          "certified property inspectors dubai"
        ]}
        canonicalUrl="https://www.snagging.me/property-inspection"
        jsonLd={structuredData}
        reviewData={{
          rating: 4.9,
          reviewCount: 214
        }}
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
                Professional Property Inspection Services in Dubai
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Protect your investment with Dubai's leading property inspection specialists. 
                Our InterNACHI certified inspectors deliver thorough assessments and detailed reports.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/book-service">Book Inspection</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#inspection-services">Explore Services</a>
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
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
                  alt="Dubai Property Inspection Expert examining a luxury property"
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
              <h2 className="text-3xl font-bold">Why Choose Our Dubai Property Inspection Services</h2>
              
              <p className="text-muted-foreground">
                At Snagging By UrbanGrid, we're committed to protecting Dubai homebuyers and investors with 
                thorough property inspections that leave no detail unchecked. Our team of InterNACHI certified 
                inspectors brings over a decade of experience specific to Dubai's unique property market.
              </p>
              
              <p className="text-muted-foreground">
                Whether you're accepting handover of a brand new property, assessing warranty issues, or 
                considering a resale purchase, our comprehensive inspection services identify problems that 
                might otherwise cost you significantly in the future.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Certified Inspectors</h3>
                  <p className="text-muted-foreground">InterNACHI trained professionals with Dubai expertise</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Comprehensive Reports</h3>
                  <p className="text-muted-foreground">Detailed digital reports with photographic evidence</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Fast Turnaround</h3>
                  <p className="text-muted-foreground">Reports delivered within 24-48 hours</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">Developer Liaison</h3>
                  <p className="text-muted-foreground">We communicate with developers on your behalf</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <div className="bg-card shadow-lg rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-4">Get a Property Inspection Quote</h3>
                <QuickResponseForm />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Details */}
      <section id="inspection-services" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Our Dubai Property Inspection Services</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Comprehensive inspection services for every stage of property ownership in Dubai
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
              <div className="h-48 overflow-hidden">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa"
                  alt="Dubai Property Handover Inspection"
                  width={400}
                  height={200}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Handover Inspection</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive inspection before accepting your new Dubai property from the developer. 
                  We identify all defects and issues that need to be addressed before you move in.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Complete property examination</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>MEP systems testing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Finishing quality assessment</span>
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/book-service?service=handover">Book Now</Link>
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
              <div className="h-48 overflow-hidden">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
                  alt="Dubai Property Warranty Inspection"
                  width={400}
                  height={200}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Warranty Inspection</h3>
                <p className="text-muted-foreground mb-4">
                  Thorough inspection before your developer warranty expires. We document all defects 
                  that should be fixed under warranty by your Dubai property developer.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Defect documentation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Developer communication support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Follow-up verification</span>
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/book-service?service=warranty">Book Now</Link>
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
              <div className="h-48 overflow-hidden">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
                  alt="Dubai Property Resale Inspection"
                  width={400}
                  height={200}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Resale Inspection</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed inspection of a resale property in Dubai before you purchase. We help you 
                  make an informed decision and potentially negotiate a better price.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Condition assessment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Hidden defect identification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Maintenance recommendations</span>
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/book-service?service=resale">Book Now</Link>
                </Button>
              </div>
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
            <h2 className="text-3xl font-bold">Frequently Asked Questions About Property Inspection in Dubai</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Common questions about our Dubai property inspection services
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto divide-y">
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">How much does a property inspection cost in Dubai?</h3>
              <p className="text-muted-foreground">
                Property inspection costs in Dubai typically range from AED 1,500 to AED 3,500 depending on the property size, 
                type, and inspection scope. Contact us for a personalized quote based on your specific needs.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">How long does a Dubai property inspection take?</h3>
              <p className="text-muted-foreground">
                A thorough property inspection in Dubai usually takes 2-4 hours depending on the property size and complexity. 
                Our detailed report is then delivered within 24-48 hours after the inspection.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">What areas of Dubai do you cover for property inspections?</h3>
              <p className="text-muted-foreground">
                We provide property inspection services throughout all areas of Dubai, including Downtown Dubai, 
                Dubai Marina, Palm Jumeirah, Arabian Ranches, Jumeirah Village Circle, Dubai Hills Estate, and all other developments.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-xl font-bold mb-2">Why is property inspection important in Dubai?</h3>
              <p className="text-muted-foreground">
                Property inspection is crucial in Dubai to protect your investment, ensure quality standards are met, 
                identify defects before they become costly problems, and provide leverage in negotiations with developers 
                or sellers. Dubai's rapid construction and unique environmental conditions make professional inspection particularly important.
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
            <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Dubai Property Investment?</h2>
            <p className="text-xl mb-8">
              Book your professional property inspection with Dubai's trusted specialists.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/book-service">Book an Inspection</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent" asChild>
                <a href="tel:+971501231234">Call Us Now</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}