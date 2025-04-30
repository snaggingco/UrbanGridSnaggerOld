import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { Facebook, Instagram, Linkedin, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextLogo from "@/components/ui/TextLogo";
import { useEffect, useState } from "react";

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", name: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", name: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", name: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer 
      className="bg-gray-50 border-t flex flex-col w-full"
      // Set fixed dimensions with CSS to prevent layout shifts
      style={{
        minHeight: '600px',
        height: 'auto',
        // Use content-visibility to improve performance
        contentVisibility: 'auto',
        // Reserve space for the footer
        containIntrinsicSize: '0 600px',
        // Pre-allocate fixed space to prevent layout shifts
        contain: 'layout paint style'
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 w-full">
        {/* Using grid with pre-defined heights to prevent shifts */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Company Info - fixed height */}
          <div className="md:col-span-4 space-y-6 min-h-[200px]">
            <div className="h-[52px] mb-6 flex items-center"> {/* Fixed height for logo with vertical centering */}
              <TextLogo size="md" />
            </div>
            <p className="text-sm text-muted-foreground h-[60px]">
              Professional property inspection services in Dubai. 
              InterNACHI certified inspectors delivering excellence in property snagging and inspection.
            </p>
            <div className="flex space-x-4 h-[40px]">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary"
                  asChild
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`Follow us on ${social.name}`}>
                    <social.icon className="h-5 w-5" />
                    <span className="sr-only">Follow us on {social.name}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links - fixed height */}
          <div className="md:col-span-2 min-h-[200px]">
            <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/property-inspection" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Property Inspection
                </a>
              </li>
              <li>
                <a href="/snagging-services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Snagging Services
                </a>
              </li>
              <li>
                <a href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/book-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Book Inspection
                </a>
              </li>
            </ul>
          </div>

          {/* Services - fixed height */}
          <div className="md:col-span-3 min-h-[200px]">
            <h3 className="text-sm font-semibold mb-4">Our Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="/snagging-dubai" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Property Snagging
                </a>
              </li>
              <li>
                <a href="/property-handover" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Handover Inspection
                </a>
              </li>
              <li>
                <a href="/property-inspection-dubai" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Warranty Inspection
                </a>
              </li>
              <li>
                <a href="/rera-audits" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Technical Reports
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info - fixed height */}
          <div className="md:col-span-3 min-h-[200px]">
            <h3 className="text-sm font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">+971 58 568 6852</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">info@urbangrid.ae</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Dubai, United Arab Emirates</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright section - fixed height */}
        <div className="mt-12 pt-8 border-t min-h-[80px]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Snagging By UrbanGrid. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors" aria-label="Read our Privacy Policy">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors" aria-label="Read our Terms of Service">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}