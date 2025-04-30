import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { 
  Award, 
  Clock, 
  FileCheck, 
  Wrench, 
  Star, 
  FileText 
} from "lucide-react";

const features = [
  {
    title: "InterNACHI Certified Inspectors",
    description: "Our team consists of certified professional inspectors with international recognition",
    icon: Award
  },
  {
    title: "Dubai and UAE Market Experience",
    description: "Years of specialized experience in Dubai's unique property market",
    icon: Clock
  },
  {
    title: "Comprehensive Process",
    description: "Thorough inspection covering 150+ checkpoints across all property aspects",
    icon: FileCheck
  },
  {
    title: "Modern Technology",
    description: "Latest inspection tools and technology for accurate assessments",
    icon: Wrench
  },
  {
    title: "100% Customer Satisfaction",
    description: "Consistently high ratings from satisfied property owners",
    icon: Star
  },
  {
    title: "Professional Reports",
    description: "Detailed, easy-to-understand reports delivered within 24 hours",
    icon: FileText
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-gray-50">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-4xl font-normal mb-4">Why Choose Us</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Dubai's trusted property inspection service with a proven track record
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeIn}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-normal">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}