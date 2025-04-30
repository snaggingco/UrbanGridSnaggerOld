import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { CalendarDays, CheckCircle, Building, FileText, ArrowRight, BarChart2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import UnifiedForm from '@/components/forms/UnifiedForm';
import TestimonialSection from '@/components/sections/TestimonialSection';
import FAQSection from '@/components/sections/FAQSection';
import CTASection from '@/components/sections/CTASection';

export default function RERAaudits() {
  const { t } = useTranslation();

  const benefitsList = [
    "Accurate assessment of property condition and value",
    "Detailed analysis based on RICS NRM3 classification of assets",
    "Industry-standard reserve fund studies for communities",
    "Comprehensive reports for property management decisions",
    "Professional documentation for RERA compliance",
    "Independent assessment from certified building inspectors"
  ];

  return (
    <>
      <Helmet>
        <title>RERA Audits | Condition Survey & Reserve Fund Analysis | UrbanGrid</title>
        <meta name="description" content="Professional RERA audits, condition surveys and reserve fund analysis in Dubai. Expert assessments based on RICS NRM3 classification for properties." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">
                Professional Building Assessment
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                RERA Audits & Building Condition Surveys
              </h1>
              <p className="text-xl mb-8 text-gray-700">
                Comprehensive building condition assessments and reserve fund studies compliant with RERA standards and RICS NRM3 classification methodology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/book-service">Book an Audit</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/#contact">Contact Us</Link>
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex -space-x-2">
                  <img src="/assets/testimonials/avatar-1.jpg" alt="Client" className="w-10 h-10 rounded-full border-2 border-white" />
                  <img src="/assets/testimonials/avatar-2.jpg" alt="Client" className="w-10 h-10 rounded-full border-2 border-white" />
                  <img src="/assets/testimonials/avatar-3.jpg" alt="Client" className="w-10 h-10 rounded-full border-2 border-white" />
                </div>
                <div className="text-sm">
                  <span className="font-medium">Rated 4.9/5</span> by property owners & community managers
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-center">Request an Audit</h2>
              <UnifiedForm formType="booking" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our RERA Audit Services</h2>
            <p className="text-xl text-gray-600">
              Comprehensive building assessment solutions to help property owners and community managers make informed decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Condition Survey</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive assessment of your property's structural and non-structural elements, identifying defects, maintenance issues, and recommended repairs.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span>Structural assessment and integrity verification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span>MEP systems evaluation and performance testing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span>Detailed photographic documentation of issues</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span>Prioritized repair recommendations with cost estimates</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/book-service?service=condition-survey">
                  Book a Condition Survey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Reserve Fund Analysis</h3>
              <p className="text-gray-600 mb-6">
                Strategic planning for future capital expenditures based on RICS NRM3 classification methodology, ensuring adequate financial reserves for property maintenance.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span>Detailed asset inventory with RICS NRM3 classification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span>Remaining useful life assessment for each component</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span>30-year capital expenditure projection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span>Multiple funding scenarios with cash flow analysis</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/book-service?service=reserve-fund-analysis">
                  Book a Reserve Fund Study <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Benefits of Professional RERA Audits</h2>
            <p className="text-xl text-gray-600">
              Our comprehensive audits provide valuable insights for property owners, managers, and community associations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefitsList.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium text-gray-800">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Audit Process</h2>
            <p className="text-xl text-gray-600">
              We follow a systematic approach to deliver accurate and thorough property assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="h-8 w-8 text-primary" />
                <div className="absolute -right-1 -top-1 w-8 h-8 bg-primary rounded-full text-white flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Initial Consultation</h3>
              <p className="text-gray-600">
                We discuss your specific needs and objectives to customize our assessment approach.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Building className="h-8 w-8 text-primary" />
                <div className="absolute -right-1 -top-1 w-8 h-8 bg-primary rounded-full text-white flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">On-Site Assessment</h3>
              <p className="text-gray-600">
                Our certified inspectors conduct a thorough examination of your property's components.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <BarChart2 className="h-8 w-8 text-primary" />
                <div className="absolute -right-1 -top-1 w-8 h-8 bg-primary rounded-full text-white flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Data Analysis</h3>
              <p className="text-gray-600">
                We analyze findings using RICS NRM3 methodology and industry best practices.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <FileText className="h-8 w-8 text-primary" />
                <div className="absolute -right-1 -top-1 w-8 h-8 bg-primary rounded-full text-white flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Report Delivery</h3>
              <p className="text-gray-600">
                We provide a comprehensive, actionable report with detailed recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection
        title="Frequently Asked Questions About RERA Audits"
        subtitle="Get answers to common questions about our RERA audit services and process."
        faqs={[
          {
            question: "What is a condition survey?",
            answer: "A condition survey is a comprehensive assessment of a property's physical condition, including structural elements, building systems, and finishes. It identifies defects, maintenance issues, and needed repairs, providing a detailed report with recommendations and cost estimates."
          },
          {
            question: "What is a reserve fund study?",
            answer: "A reserve fund study is a financial planning tool that analyzes a property's components, estimates their remaining useful life, and projects future replacement costs. Based on RICS NRM3 classification, it helps communities plan for future capital expenditures and determine appropriate reserve funding levels."
          },
          {
            question: "How often should RERA audits be conducted?",
            answer: "RERA recommends conducting condition surveys every 3-5 years and updating reserve fund studies every 3 years. However, the frequency may vary based on property age, condition, and local regulations for community associations."
          },
          {
            question: "What is RICS NRM3 classification?",
            answer: "RICS NRM3 (New Rules of Measurement 3) is an industry-standard classification system developed by the Royal Institution of Chartered Surveyors for categorizing building maintenance and renewal costs. It provides a standardized framework for asset classification, cost planning, and procurement."
          },
          {
            question: "How long does the audit process take?",
            answer: "The duration varies based on property size and complexity. Typically, a condition survey may take 1-3 days for on-site assessment, with reports delivered within 2 weeks. Reserve fund studies may require 3-4 weeks for completion including data collection, analysis, and report preparation."
          }
        ]}
      />

      {/* CTA Section */}
      <CTASection 
        title="Ready to get started with a professional RERA audit?"
        subtitle="Our team of certified inspectors is ready to help you assess your property."
        primaryButtonText="Book an Audit"
        primaryButtonLink="/book-service"
        secondaryButtonText="Contact Us"
        secondaryButtonLink="/#contact"
      />

      {/* Testimonials */}
      <TestimonialSection />
    </>
  );
}