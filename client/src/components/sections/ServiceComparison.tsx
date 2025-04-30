import * as React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Property Inspection Services",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "AED",
      "offerCount": "3",
      "offers": [
        {
          "@type": "Offer",
          "name": "Handover Inspection",
          "price": "1500",
          "priceCurrency": "AED"
        },
        {
          "@type": "Offer",
          "name": "Warranty Inspection",
          "price": "1200",
          "priceCurrency": "AED"
        },
        {
          "@type": "Offer",
          "name": "Resale Inspection",
          "price": "1800",
          "priceCurrency": "AED"
        }
      ]
    }
  };

  return (
    <section id="service-comparison" className="py-16 bg-gray-50">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(pricingSchema)}
        </script>
      </Helmet>

} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ServiceFeature {
  name: string;
  handover: boolean | "partial" | null;
  warranty: boolean | "partial" | null;
  resale: boolean | "partial" | null;
  tooltip?: string;
}

const serviceFeatures: ServiceFeature[] = [
  {
    name: "Comprehensive Structural Inspection",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Electrical Systems",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Plumbing & Water Systems",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "HVAC & Cooling Systems",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Windows & Doors",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Wall & Floor Finishes",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Kitchen Inspection",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Bathroom Inspection",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Exterior Inspection",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Developer Compliance Verification",
    handover: true,
    warranty: "partial",
    resale: false,
    tooltip: "For resale properties, we verify condition but not developer compliance"
  },
  {
    name: "Warranty Period Documentation",
    handover: false,
    warranty: true,
    resale: false,
  },
  {
    name: "Valuation Assessment",
    handover: false,
    warranty: false,
    resale: true,
    tooltip: "Only for resale inspections to help with purchase negotiations"
  },
  {
    name: "Detailed Photography",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Comprehensive Digital Report",
    handover: true,
    warranty: true,
    resale: true,
  },
  {
    name: "Corrective Action Recommendations",
    handover: true,
    warranty: true,
    resale: true,
  }
];

export default function ServiceComparison() {
  const renderServiceStatus = (status: boolean | "partial" | null) => {
    if (status === true) {
      return <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />;
    } else if (status === "partial") {
      return <HelpCircle className="h-5 w-5 text-amber-500 mx-auto" />;
    } else {
      return <XCircle className="h-5 w-5 text-gray-300 mx-auto" />;
    }
  };

  return (
    <section id="service-comparison" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Compare Our Inspection Services
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the right inspection service for your property needs. All our inspections are conducted by InterNACHI certified inspectors.
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4 text-left pl-4">Features</TableHead>
                <TableHead className="w-1/4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-primary font-semibold">Handover Inspection</span>
                    <span className="text-sm text-gray-500">New Properties</span>
                  </div>
                </TableHead>
                <TableHead className="w-1/4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-primary font-semibold">Warranty Inspection</span>
                    <span className="text-sm text-gray-500">Before Warranty Expires</span>
                  </div>
                </TableHead>
                <TableHead className="w-1/4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-primary font-semibold">Resale Inspection</span>
                    <span className="text-sm text-gray-500">Before Purchasing</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceFeatures.map((feature, index) => (
                <TableRow key={index} className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                  <TableCell className="relative pl-4 py-4">
                    {feature.name}
                    {feature.tooltip && (
                      <div className="group relative">
                        <HelpCircle className="inline h-4 w-4 text-gray-400 ml-1 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                          {feature.tooltip}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{renderServiceStatus(feature.handover)}</TableCell>
                  <TableCell>{renderServiceStatus(feature.warranty)}</TableCell>
                  <TableCell>{renderServiceStatus(feature.resale)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-100">
                <TableCell className="pl-4 py-6 font-medium">
                  <span className="text-lg font-semibold text-gray-900">Book This Service</span>
                </TableCell>
                <TableCell className="text-center">
                  <Button asChild className="bg-primary hover:bg-primary/90 rounded-full px-4">
                    <Link href="/book-service">Book Handover</Link>
                  </Button>
                </TableCell>
                <TableCell className="text-center">
                  <Button asChild className="bg-primary hover:bg-primary/90 rounded-full px-4">
                    <Link href="/book-service">Book Warranty</Link>
                  </Button>
                </TableCell>
                <TableCell className="text-center">
                  <Button asChild className="bg-primary hover:bg-primary/90 rounded-full px-4">
                    <Link href="/book-service">Book Resale</Link>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> Included</span>
            <span className="flex items-center"><HelpCircle className="h-4 w-4 text-amber-500 mr-1" /> Partially Included</span>
            <span className="flex items-center"><XCircle className="h-4 w-4 text-gray-300 mr-1" /> Not Included</span>
          </p>
        </div>
      </div>
    </section>
  );
}