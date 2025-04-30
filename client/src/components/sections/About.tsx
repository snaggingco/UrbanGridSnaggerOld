import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeIn} className="relative">
            {/* Use ResponsiveImage component for proper lazy loading and size optimization */}
            <div className="rounded-lg shadow-xl overflow-hidden aspect-video">
              <OptimizedImage
                src="/images/dubai-skyline.svg" 
                alt="Dubai Skyline - UrbanGrid Property Inspections in Dubai's Most Prestigious Developments"
                className="w-full h-full object-cover rounded-lg"
                width={600}
                height={400}
                loading="eager"
                decoding="sync"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-[#2D7E45]/10 rounded-lg" />
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-6">
            <h2 className="text-3xl font-bold">The Most Trusted Snagging Company in Dubai and across UAE</h2>
            <p className="text-muted-foreground">
              As a leading property inspection specialist in Dubai, Snagging By UrbanGrid brings unmatched expertise in 
              property handover inspection, warranty checks, and resale property assessment across Dubai's most prestigious developments.
              Our InterNACHI-certified inspectors ensure your property meets the highest standards before handover.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold">UAE Expertise</h3>
                <p className="text-muted-foreground">
                  10+ years in Dubai, Abu Dhabi, Sharjah & across UAE in property inspection
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold">Handover Success</h3>
                <p className="text-muted-foreground">
                  10000+ properties inspected
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold">Snagging Specialists</h3>
                <p className="text-muted-foreground">
                  InterNACHI certified professionals
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold">Dubai, Abu Dhabi, Sharjah & across UAE Coverage</h3>
                <p className="text-muted-foreground">
                  All neighborhoods and developments
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}