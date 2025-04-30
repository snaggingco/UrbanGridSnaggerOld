import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Hero from "@/components/sections/Hero";
import QuickResponseForm from "@/components/sections/QuickResponseForm";
import Services from "@/components/sections/Services";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import GetStarted from "@/components/sections/GetStarted";
import About from "@/components/sections/About";
import Blog from "@/components/sections/Blog";
import Contact from "@/components/sections/Contact";
import ExitForm from "@/components/forms/ExitForm";
import InspectionScope from "@/components/sections/InspectionScope";
import Testimonials from "@/components/sections/Testimonials";
import Certifications from "@/components/sections/Certifications";
import FAQ, { generateFAQSchema } from "@/components/sections/FAQ";
import SEO from "@/components/SEO";

export default function Home() {
  const [showExitForm, setShowExitForm] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 &&
        !localStorage.getItem("exitFormShown") &&
        !showExitForm
      ) {
        timeout = setTimeout(() => {
          setShowExitForm(true);
          localStorage.setItem("exitFormShown", "true");
        }, 500);
      }
    };

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage >= 25 && !localStorage.getItem("scrollFormShown") && !showExitForm) {
        setShowExitForm(true);
        localStorage.setItem("scrollFormShown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [showExitForm]);

  return (
    <>
      <SEO 
        title="Top-Rated Property Snagging & Inspection Services in Dubai | UrbanGrid"
        description="Expert property inspection and snagging services in Dubai. Professional handover inspections, defect identification, and comprehensive reports by UrbanGrid's certified property inspectors."
        keywords={[
          "property inspection",
          "property snagging",
          "property inspection company dubai",
          "property inspection dubai",
          "property inspection abu dhabi",
          "snagging dubai",
          "property snagging dubai",
          "snagging companies in dubai",
          "snagging company dubai",
          "snagging inspection dubai",
          "building inspection uae",
          "snagging service in dubai",
          "property handover inspection",
          "dubai property inspector",
          "real estate inspection dubai",
          "villa inspection dubai",
          "apartment inspection dubai",
          "commercial property inspection"
        ]}
        canonicalUrl="https://www.snagging.me"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "UrbanGrid Property Inspection Services",
            "description": "Professional property inspection and snagging services in Dubai, UAE. Comprehensive handover inspections, defect identification, and detailed reports.",
            "image": "https://www.snagging.me/images/urbangrid-logo.png",
            "url": "https://www.snagging.me",
            "telephone": "+971-58-5686852",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Naema Ali Buamim Building - 306 - Al Bada'a",
              "addressLocality": "Dubai",
              "addressRegion": "Dubai",
              "postalCode": "00000",
              "addressCountry": "AE"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 25.2289235,
              "longitude": 55.2731844
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday"
                ],
                "opens": "09:00",
                "closes": "18:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Saturday"],
                "opens": "10:00",
                "closes": "16:00"
              }
            ],
            "sameAs": [
              "https://www.snagging.me",
              "https://www.urbangrid.ae",
              "https://www.facebook.com/snagginginspection/",
              "https://www.instagram.com/snagginginspection/"
            ],
            "priceRange": "$$",
            "areaServed": ["Dubai", "Abu Dhabi", "Sharjah", "United Arab Emirates"],
            "award": "InterNACHI Certified Professional Inspector",
            "makesOffer": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Property Handover Inspection",
                  "description": "Comprehensive inspection of newly built properties before handover"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Property Snagging",
                  "description": "Detailed inspection to identify defects in residential and commercial properties"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "RERA Compliance Inspection",
                  "description": "Property inspections that comply with Dubai Real Estate Regulatory Agency standards"
                }
              }
            ]
          },
          // Add FAQPage schema using the existing data to avoid duplication
          generateFAQSchema([
            {
              question: "What is property snagging and why is it important in Dubai?",
              answer: "Property snagging is a thorough inspection of a newly built or renovated property to identify any defects, issues, or incomplete work that needs to be rectified by the developer or contractor before you accept the handover. In Dubai's competitive real estate market, professional property inspection is essential to ensure your investment meets all quality standards and complies with local regulations."
            },
            {
              question: "When should I schedule a property inspection in Dubai?",
              answer: "Ideally, you should schedule a property inspection before you take possession of a new property, usually a few days before the official handover. For warranty inspections, schedule before your warranty period expires. In Dubai's real estate market, timely inspections are crucial as developers typically offer a limited window for reporting defects after handover."
            },
            {
              question: "How long does a property inspection take in Dubai?",
              answer: "The duration of a property inspection in Dubai depends on the size and type of property. On average, a thorough inspection of a 2-bedroom apartment takes 2-3 hours, while larger villas may require 4-6 hours. Our certified inspectors take the time needed to ensure every aspect of your property is thoroughly examined."
            },
            {
              question: "What's the difference between property snagging and property inspection?",
              answer: "While often used interchangeably, property snagging typically refers specifically to identifying minor defects in newly built properties, whereas property inspection is a broader term covering evaluations of both new and existing properties, including structural assessments, systems checks, and compliance with building codes. At UrbanGrid, we provide comprehensive services that include both detailed snagging and thorough property inspections."
            },
            {
              question: "Do I need to be present during the property inspection in Dubai?",
              answer: "While it's not mandatory, we recommend that you be present during at least part of the inspection. This allows our inspector to show you any critical issues directly and explain technical aspects of the findings. For overseas investors, we offer remote inspection services with real-time video calls and comprehensive digital reports."
            },
            {
              question: "What does your property inspection report include?",
              answer: "Our detailed property inspection report includes photographic evidence of all issues found, clear descriptions of each defect, references to applicable Dubai standards or regulations, recommendations for rectification, and a summary of critical issues requiring immediate attention. All reports are delivered digitally within 24-48 hours of the inspection."
            },
            {
              question: "Why should I choose UrbanGrid for property inspection in Dubai?",
              answer: "UrbanGrid offers InterNACHI-certified professional inspectors with specific expertise in Dubai's real estate market. We provide comprehensive inspections, detailed reports with photographic evidence, and practical recommendations. Our team is familiar with local building codes, RERA requirements, and common issues in Dubai properties, ensuring you receive the most relevant and actionable inspection service."
            },
            {
              question: "How much does a property inspection cost in Dubai?",
              answer: "Property inspection costs in Dubai vary based on the property size, type, and the scope of inspection required. For standard residential units, our services start from AED 1,000. We provide transparent pricing with no hidden fees, and our detailed reports offer tremendous value by potentially saving you significant repair costs and helping negotiate with developers."
            }
          ])
        ]}
      />
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-[0%] z-50"
        style={{ scaleX }}
      />
      <Hero />
      <QuickResponseForm />
      <Services />
      <Testimonials />
      <WhyChooseUs />
      <InspectionScope />
      <GetStarted />
      <Certifications />
      <FAQ />
      <About />
      <Blog />
      <Contact />
      <ExitForm open={showExitForm} onOpenChange={setShowExitForm} />
    </>
  );
}