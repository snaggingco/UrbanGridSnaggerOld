import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { Calendar, Clipboard, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const steps = [
  {
    title: "Book Inspection",
    description: "Schedule online or call us directly. We'll confirm within 2 hours.",
    icon: Calendar,
    time: "5 minutes"
  },
  {
    title: "Property Inspection",
    description: "Our certified inspector conducts a thorough assessment of your property.",
    icon: Clipboard,
    time: "2-3 hours"
  },
  {
    title: "Report Delivery",
    description: "Receive a comprehensive digital report with photos and recommendations.",
    icon: FileText,
    time: "24 hours"
  },
  {
    title: "Follow-up Support",
    description: "Get expert guidance on addressing identified issues.",
    icon: MessageSquare,
    time: "Ongoing"
  }
];

export default function GetStarted() {
  return (
    <section className="py-24 bg-white">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-4xl font-normal mb-4">How to Get Started</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Simple, transparent process to ensure your property meets the highest standards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={fadeIn}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <step.icon className="h-8 w-8 text-primary" />
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-normal">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <div className="text-sm text-primary font-medium">
                    Estimated time: {step.time}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeIn} className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
            <h3 className="text-2xl font-medium text-center mb-6">What to Prepare</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#34A853] bg-opacity-10 flex items-center justify-center">
                    <span className="text-[#34A853] font-semibold">1</span>
                  </div>
                  <h4 className="font-medium">Access</h4>
                </div>
                <p className="text-sm text-muted-foreground">Arrange property access for our inspection team</p>
              </div>
              
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#34A853] bg-opacity-10 flex items-center justify-center">
                    <span className="text-[#34A853] font-semibold">2</span>
                  </div>
                  <h4 className="font-medium">Concerns</h4>
                </div>
                <p className="text-sm text-muted-foreground">Prepare a list of specific areas of concern (if any)</p>
              </div>
              
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#34A853] bg-opacity-10 flex items-center justify-center">
                    <span className="text-[#34A853] font-semibold">3</span>
                  </div>
                  <h4 className="font-medium">Documents</h4>
                </div>
                <p className="text-sm text-muted-foreground">Have property documentation ready for reference</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg rounded-full bg-[#34A853] hover:bg-[#34A853]/90 text-white" 
                asChild
              >
                <Link href="/book-service">Schedule Your Inspection</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
