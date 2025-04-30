import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Download, FileText, Building, FileCog, CheckCircle, Clipboard, LineChart, BadgeCheck } from "lucide-react";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Downloads() {
  return (
    <>
      <Helmet>
        <title>Resources & Downloads | UrbanGrid - Leading Property Inspection Services Dubai</title>
        <meta
          name="description"
          content="Access premium resources, company profiles, whitepapers, and technical brochures from UrbanGrid - Dubai's leading property inspection and real estate consultancy."
        />
        <meta
          name="keywords"
          content="UrbanGrid downloads, property inspection resources, Dubai property services, snagging company profile, real estate technical services, professional resources"
        />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/90 to-primary/70 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="container max-w-7xl mx-auto px-6 relative z-10"
        >
          <motion.div variants={fadeIn} className="text-white max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Resources & Downloads</h1>
            <p className="text-xl text-white/90 mb-8">
              Exclusive access to professional publications, technical documentation, and corporate materials from Dubai's premier property inspection authority.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Professional Grade
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2 text-sm">
                <Clipboard className="h-4 w-4 mr-2" />
                Technical Excellence
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2 text-sm">
                <BadgeCheck className="h-4 w-4 mr-2" />
                Industry Standard
              </Badge>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="py-16 container max-w-7xl mx-auto px-6"
      >
        <motion.div variants={fadeIn} className="flex flex-col md:flex-row gap-10 mb-16">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Corporate Publications</h2>
            <p className="text-lg text-gray-600 mb-6">
              Our professionally designed publications showcase UrbanGrid's industry leadership, technical capabilities, and extensive portfolio of services in the UAE real estate sector.
            </p>
            <div className="border-l-4 border-primary pl-4 py-2 bg-primary/5 mb-6">
              <p className="italic text-gray-700">
                "UrbanGrid maintains the highest standards of quality and professional excellence in all our documentation and technical materials."
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3">Premium Quality</Badge>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3">Professional Grade</Badge>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3">Expert Analysis</Badge>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <motion.div
              variants={fadeIn}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
            >
              {/* Company Profile */}
              <Card className="group bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-primary to-primary/80 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
                    <img 
                      src="/company/assets/urbangrid-logo.svg" 
                      alt="UrbanGrid Logo" 
                      className="h-12 w-auto object-contain transform group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <Badge className="bg-white/30 hover:bg-white/40 text-white border-none">
                      <FileText className="h-3 w-3 mr-1" /> Corporate
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">Corporate Profile</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">2025 Edition</Badge>
                  </div>
                  <CardDescription className="text-gray-600">Comprehensive corporate overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-6">
                    UrbanGrid's flagship corporate publication showcasing our industry leadership, technical expertise, comprehensive service offerings, and commitment to excellence in Dubai's property sector.
                  </p>
                  <div className="flex gap-3">
                    <Button className="w-1/2 gap-2 bg-primary hover:bg-primary/90" asChild>
                      <a href="/downloads/urbangrid-company-profile.html" target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                        View
                      </a>
                    </Button>
                    <Button className="w-1/2 gap-2 bg-primary/90 hover:bg-primary" asChild>
                      <a href="/api/generate-company-profile-pdf" download>
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Snagging Services Guide */}
              <Card className="group bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-6">
                    <FileCog className="h-16 w-16 text-white/90" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <Badge className="bg-white/30 hover:bg-white/40 text-white border-none">
                      <CheckCircle className="h-3 w-3 mr-1" /> Technical
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">Snagging Services Guide</CardTitle>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">New</Badge>
                  </div>
                  <CardDescription className="text-gray-600">Comprehensive technical guide</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-6">
                    Detailed technical documentation on our industry-leading property snagging services, inspection methodologies, quality assurance processes, and success metrics.
                  </p>
                  <div className="flex gap-3">
                    <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" disabled>
                      <Download className="h-4 w-4" />
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeIn} className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Technical Resources</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Industry-leading technical materials and specialized resources for property professionals, investors, and stakeholders in Dubai's real estate market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Technical Services Guide */}
            <Card className="group bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <div className="h-36 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Building className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Technical Services Portfolio</CardTitle>
                <CardDescription>Professional technical documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-6">
                  Comprehensive overview of UrbanGrid's technical consulting services including building audits, technical assessments, and property evaluations.
                </p>
                <Button className="w-full gap-2" variant="outline" disabled>
                  <Download className="h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
            
            {/* Property Inspection Guide */}
            <Card className="group bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <div className="h-36 bg-gradient-to-r from-amber-500 to-orange-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Clipboard className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Property Inspection Guide</CardTitle>
                <CardDescription>Expert inspection methodologies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-6">
                  Expert guidance on property inspection standards, methodologies, and best practices for residential and commercial properties in Dubai.
                </p>
                <Button className="w-full gap-2" variant="outline" disabled>
                  <Download className="h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
            
            {/* Market Analysis */}
            <Card className="group bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <div className="h-36 bg-gradient-to-r from-emerald-500 to-teal-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <LineChart className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Dubai Property Market Analysis</CardTitle>
                <CardDescription>Market insights and forecasts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-6">
                  Comprehensive analysis of Dubai's property market trends, investment opportunities, and sector forecasts by UrbanGrid's research division.
                </p>
                <Button className="w-full gap-2" variant="outline" disabled>
                  <Download className="h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
        
        <motion.div variants={fadeIn} className="mt-20 bg-gray-50 p-8 rounded-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/3">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <BadgeCheck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Need Custom Materials?</h3>
              <p className="text-gray-600">
                Contact our team for tailored technical documentation, project-specific analyses, or specialized property evaluation reports.
              </p>
            </div>
            <div className="md:w-2/3 bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Request Custom Documentation</h4>
              <p className="text-gray-600 mb-4">
                UrbanGrid's professional documentation team can develop customized technical materials tailored to your specific property or project requirements.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Request Custom Materials
                </Button>
                <Button variant="outline" asChild>
                  <a href="/#contact">Contact Our Team</a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}