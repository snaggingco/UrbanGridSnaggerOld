import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import InquiryForm from "@/components/forms/InquiryForm";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-gray-50">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get in touch with our team to schedule your property inspection
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div variants={fadeIn}>
            <Card>
              <CardContent className="p-6">
                <InquiryForm />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-primary" />
                  <p>+971 58 568 6852</p>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <p>info@snagging.me</p>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <p>Naema Ali Buamim Building - 306, Al Bada'a, Dubai, UAE</p>
                </div>
                <div className="mt-4">
                  <a 
                    href="https://www.google.com/maps/dir//Naema+Ali+Buamim+Building+-+306+-+Al+Bada'a+-+Dubai/@25.2291557,55.1909895,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3e5f43ca15e50e55:0x585d94451e112261!2m2!1d55.273391!2d25.2291785?entry=ttu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-1" /> Get Directions
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6">Our Location</h3>
              <div className="rounded-lg overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.6687550035135!2d55.27080397596687!3d25.229178530524467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43ca15e50e55%3A0x585d94451e112261!2sNaema%20Ali%20Buamim%20Building%20-%20306%20-%20Al%20Bada&#39;a%20-%20Dubai!5e0!3m2!1sen!2sae!4v1714259781076!5m2!1sen!2sae"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Location"
                ></iframe>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6">Why Choose Us</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>✓ Professional and certified inspectors</li>
                <li>✓ Comprehensive inspection reports</li>
                <li>✓ Quick turnaround time</li>
                <li>✓ Competitive pricing</li>
                <li>✓ Experience with all property types</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}