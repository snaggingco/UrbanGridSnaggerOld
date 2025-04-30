import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clipboard, FileText, MessageSquare } from "lucide-react";
import BookingForm from "@/components/forms/BookingForm";

const steps = [
  {
    title: "Book Service",
    description: "Choose your property type and desired services",
    icon: Calendar,
    time: "2 minutes"
  },
  {
    title: "Confirmation",
    description: "We'll confirm your booking within 2 hours",
    icon: Clipboard,
    time: "2 hours"
  },
  {
    title: "Service Delivery",
    description: "Our professionals will visit as scheduled",
    icon: FileText,
    time: "As booked"
  },
  {
    title: "Follow-up",
    description: "We ensure your complete satisfaction",
    icon: MessageSquare,
    time: "24 hours"
  }
];

export default function BookService() {
  return (
    <div className="min-h-screen pt-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-12"
      >
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h1 className="text-4xl font-normal mb-4">Book Your Service</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose your service and schedule a convenient time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <motion.div variants={fadeIn} className="md:col-span-7">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                <BookingForm />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} className="md:col-span-5">
            <div className="sticky top-24">
              <Card className="border-0 shadow-lg bg-white mb-8">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-normal mb-6">How it works</h2>
                  <div className="space-y-8">
                    {steps.map((step, index) => (
                      <div key={step.title} className="flex gap-4">
                        <div className="text-[#34A853]">
                          <step.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{step.title}</h3>
                            <span className="text-sm text-muted-foreground">
                              ({step.time})
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-[#34A853]/5 to-white">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-normal mb-4">Need Help?</h2>
                  <p className="text-muted-foreground mb-6">
                    Our team is here to assist you in choosing the right services
                    for your property.
                  </p>
                  <Button 
                    className="w-full rounded-full bg-[#34A853] hover:bg-[#34A853]/90 text-white"
                    asChild
                    onClick={() => {
                      const message = encodeURIComponent(
                        "Hi, I'm interested in booking your services. Could you help me choose the right option for my property?"
                      );
                      window.open(`https://wa.me/971585686852?text=${message}`, "_blank");
                    }}
                  >
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      Chat on WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}