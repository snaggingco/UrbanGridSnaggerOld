import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

// Helper function to generate FAQ schema
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export default function FAQ() {
  const faqs = [
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
      question: "Do you handle both residential and commercial property inspections?",
      answer: "Yes, our certified inspectors are trained to handle both residential properties (apartments, villas, townhouses) and commercial properties (offices, retail spaces, warehouses) throughout Dubai and Abu Dhabi. We tailor our inspection approach based on the property type and its specific requirements."
    },
    {
      question: "Why should I choose UrbanGrid for property inspection in Dubai?",
      answer: "UrbanGrid offers InterNACHI-certified professional inspectors with specific expertise in Dubai's real estate market. We provide comprehensive inspections, detailed reports with photographic evidence, and practical recommendations. Our team is familiar with local building codes, RERA requirements, and common issues in Dubai properties, ensuring you receive the most relevant and actionable inspection service."
    },
    {
      question: "How much does a property inspection cost in Dubai?",
      answer: "Property inspection costs in Dubai vary based on the property size, type, and the scope of inspection required. For standard residential units, our services start from AED 1,000. We provide transparent pricing with no hidden fees, and our detailed reports offer tremendous value by potentially saving you significant repair costs and helping negotiate with developers."
    },
    {
      question: "What areas of Dubai and Abu Dhabi do you cover for property inspections?",
      answer: "We provide property inspection services throughout all areas of Dubai, including Dubai Marina, Downtown Dubai, Palm Jumeirah, Arabian Ranches, Jumeirah Village Circle, Dubai Hills, and all other communities. We also offer property inspection services in Abu Dhabi, including Yas Island, Al Reem Island, Saadiyat Island, and other major residential and commercial areas."
    }
  ];

  // FAQ schema is now handled via the SEO component
  // This prevents duplicate schema markup which causes Google Search Console errors

  return (
    <section id="faq" className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">PROPERTY INSPECTION FAQ</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Property Inspection & Snagging Services in Dubai & across UAE</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our professional property inspection services in Dubai and Abu Dhabi. Learn how our certified property inspectors can help protect your real estate investment.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}