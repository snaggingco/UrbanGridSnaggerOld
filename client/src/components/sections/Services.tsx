import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ClipboardCheck, Home as HomeIcon, Shield, Sparkles, Bug, Wrench, Hammer, Wind, Truck } from "lucide-react";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const inspectionServices = [
  {
    title: "Handover Snagging",
    description: "Expert defect inspection before you take possession",
    icon: HomeIcon,
    href: "/property-handover"
  },
  {
    title: "DLP Warranty Inspection",
    description: "Catch defects before your warranty expires",
    icon: Shield,
    href: "/snagging-services"
  },
  {
    title: "Resale Inspections",
    description: "Make informed decisions on resale properties",
    icon: Building2,
    href: "/property-inspection"
  }
];

const moveInServices = [
  {
    title: "Deep Cleaning",
    icon: Sparkles,
    description: "Professional deep cleaning for a spotless home",
    features: [
      "Deep cleaning of all rooms",
      "Kitchen & bathroom sanitization",
      "Window & balcony cleaning",
      "Professional equipment & products"
    ]
  },
  {
    title: "Pest Control",
    icon: Bug,
    description: "Complete pest control treatment with 30-day guarantee",
    features: [
      "Full property treatment",
      "Safe & certified products",
      "Preventive measures",
      "30-day guarantee"
    ]
  },
  {
    title: "Fit-out Services",
    icon: Wrench,
    description: "Custom renovation and fit-out solutions",
    features: [
      "Custom design consultation",
      "Material selection assistance",
      "Project management",
      "Quality workmanship"
    ]
  },
  {
    title: "Handyman & Maintenance",
    icon: Hammer,
    description: "Professional handyman services for your property",
    features: [
      "General repairs & fixes",
      "Furniture assembly",
      "Painting & touch-ups",
      "Preventive maintenance"
    ]
  },
  {
    title: "AC Cleaning",
    icon: Wind,
    description: "Professional AC cleaning and maintenance service",
    features: [
      "Deep cleaning of AC units",
      "Filter replacement",
      "Performance check",
      "Sanitization & maintenance"
    ]
  },
  {
    title: "Packers & Movers",
    icon: Truck,
    description: "Professional packing and moving services",
    features: [
      "Professional packing",
      "Safe transportation",
      "Unpacking assistance",
      "Furniture assembly"
    ]
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Premier Snagging Company in Dubai</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive property inspection solutions for Dubai's most discerning property owners
          </p>
        </motion.div>

        {/* Inspection Services */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold mb-8 text-center">Dubai Property Inspection Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {inspectionServices.map((service) => (
              <motion.div
                key={service.title}
                variants={fadeIn}
                className="group h-full"
              >
                <Card className="w-full h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-white">
                  <CardContent className="pt-6 pb-6 flex flex-col h-full">
                    {/* Fixed height header */}
                    <div className="flex items-center gap-4 mb-4 min-h-[60px]">
                      <service.icon className="h-8 w-8 flex-shrink-0 text-[#2D7E45]" />
                      <h4 className="text-xl font-normal">{service.title}</h4>
                    </div>
                    {/* Fixed height description container */}
                    <div className="flex-1 mb-6 min-h-[60px]">
                      <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>
                    {/* Fixed position buttons at the bottom */}
                    <div className="mt-auto">
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          className="w-full rounded-full border-[#2D7E45] text-[#2D7E45] bg-white hover:bg-white hover:text-[#2D7E45] hover:border-[#2D7E45] transition-colors"
                          asChild
                          aria-label={`Learn more about ${service.title}`}
                        >
                          <Link href={service.href}>Learn More About {service.title}</Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full rounded-full text-gray-600 hover:text-[#2D7E45] transition-colors"
                          asChild
                          aria-label={`Book ${service.title} inspection`}
                        >
                          <Link href="/book-service">Book Inspection</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Professional Reporting */}
        <motion.div variants={fadeIn} className="mb-20">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <ClipboardCheck className="h-8 w-8 text-[#2D7E45]" />
                <h3 className="text-2xl font-normal">Professional Reporting</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Comprehensive digital reports delivered within 24 hours, including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-gray-900">Detailed Documentation</h4>
                  <p className="text-muted-foreground">High-resolution photos and detailed descriptions of all findings</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-900">Expert Analysis</h4>
                  <p className="text-muted-foreground">Professional assessment and recommendations for each issue</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-900">Follow-up Support</h4>
                  <p className="text-muted-foreground">Ongoing guidance and clarification for implementing fixes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Move-in Services */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-center">Move-in Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {moveInServices.map((service) => (
              <motion.div
                key={service.title}
                variants={fadeIn}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group-hover:scale-105 bg-white">
                  <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full relative z-10">
                    <service.icon className="h-8 w-8 text-[#2D7E45] mb-3" />
                    <h4 className="font-normal text-sm mb-2">{service.title}</h4>

                    

                    <Button 
                      variant="ghost" 
                      className="absolute inset-0 h-full w-full p-0 hover:bg-transparent"
                      asChild
                      aria-label={`Book ${service.title} service`}
                    >
                      <Link href="/book-service">
                        <span className="sr-only">Book {service.title} service</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div variants={fadeIn} className="text-center mt-16">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg rounded-full bg-[#2D7E45] hover:bg-[#2D7E45]/90 text-white" 
            asChild
            aria-label="Book property inspection and move-in services"
          >
            <Link href="/book-service">Book Services Now</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}