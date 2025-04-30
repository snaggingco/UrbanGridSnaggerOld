import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { Star, Quote } from "lucide-react";
import { useEffect } from "react";

// Helper function to generate review schema
const generateReviewsSchema = (testimonials: any[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Snagging By UrbanGrid",
    "url": "https://www.snagging.me",
    "review": testimonials.map(testimonial => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": testimonial.name
      },
      "reviewBody": testimonial.content
    })),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": testimonials.length.toString(),
      "bestRating": "5"
    }
  };
};

const testimonials = [
  {
    name: "Sarah A.",
    role: "Property Owner",
    content: "The team's attention to detail was exceptional. They caught issues I would have never noticed. Highly recommended!",
    rating: 5,
    location: "Dubai Marina"
  },
  {
    name: "Mohammed R.",
    role: "Real Estate Investor",
    content: "Professional service from start to finish. Their report helped me negotiate better terms with the developer.",
    rating: 5,
    location: "Downtown Dubai"
  },
  {
    name: "John D.",
    role: "Property Manager",
    content: "Used their services for multiple properties. Consistent quality and thorough inspections every time.",
    rating: 5,
    location: "Palm Jumeirah"
  }
];

const stats = [
  { value: "10000+", label: "Properties Inspected" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "24h", label: "Report Delivery" },
  { value: "150+", label: "Inspection Points" }
];

export default function Testimonials() {
  useEffect(() => {
    // Generate and inject schema markup
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(generateReviewsSchema(testimonials));
    document.head.appendChild(script);
    
    return () => {
      // Clean up the script when component unmounts
      document.head.removeChild(script);
    };
  }, []); // Empty dependency array means this runs once on mount

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
          <h2 className="text-4xl font-normal mb-4">What Our Clients Say</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of satisfied property owners who trust our inspection services
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={fadeIn}
              className="group"
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <div className="flex items-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-primary">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
