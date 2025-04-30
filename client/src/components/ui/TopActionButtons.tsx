import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, ArrowUp } from "lucide-react";

export default function TopActionButtons() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll-to-top button when page is scrolled more than 300px
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCallClick = () => {
    window.open("tel:+971585686852");
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed right-6 flex flex-col items-end gap-3 z-50">
      {/* Sticky Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
        {/* Book Now Button (always visible) */}
        <Button
          asChild
          className="rounded-full px-4 py-2 h-auto shadow-lg bg-primary hover:bg-primary/90 text-white"
        >
          <Link href="/book-service">
            <Calendar className="h-5 w-5 mr-2" />
            Book Inspection
          </Link>
        </Button>

        {/* Call Button */}
        <Button
          onClick={handleCallClick}
          className="rounded-full h-12 w-12 shadow-md bg-blue-500 hover:bg-blue-600"
        >
          <Phone className="h-6 w-6" />
          <span className="sr-only">Call us</span>
        </Button>

        {/* Scroll to Top Button (conditionally visible) */}
        {showScrollToTop && (
          <Button
            onClick={handleScrollToTop}
            className="rounded-full h-10 w-10 shadow-md bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-300 ease-in-out"
            size="icon"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}