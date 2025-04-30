import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, ArrowUp, MessageCircle, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UnifiedActionButtons() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Initial notification count
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  
  // When button is clicked, reset notifications
  const handleMenuOpen = (open: boolean) => {
    setShowActionMenu(open);
    
    if (open) {
      setNotificationCount(0);
      setLastInteraction(Date.now());
    }
  };

  // Handle scroll behavior and notifications
  useEffect(() => {
    // Function to handle scroll behavior
    const handleScroll = () => {
      // Show scroll-to-top button when page is scrolled more than 300px
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    // After user has been on page for 60 seconds, add a notification if they haven't interacted
    const notificationTimer = setTimeout(() => {
      if (Date.now() - lastInteraction > 60000 && notificationCount < 3) {
        setNotificationCount(prev => Math.min(prev + 1, 3));
      }
    }, 60000);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(notificationTimer);
    };
  }, [lastInteraction, notificationCount]);

  // Reset notification state and track interaction
  const trackInteraction = () => {
    setNotificationCount(0);
    setLastInteraction(Date.now());
  };
  
  const handleCallClick = () => {
    trackInteraction();
    window.open("tel:+971585686852");
  };

  const handleWhatsAppClick = () => {
    trackInteraction();
    const message = encodeURIComponent(
      "Hi, I'm interested in getting my property inspected. Could you provide more information about your services?"
    );
    window.open(
      `https://wa.me/971585686852?text=${message}`,
      "_blank"
    );
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
      {/* On mobile: Show a hint and a single menu button that expands to reveal all options */}
      <div className="md:hidden">
        <div className="flex flex-row items-center justify-end gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-sm font-medium bold">
            Book Now by Call/WhatsApp
          </div>
          <DropdownMenu open={showActionMenu} onOpenChange={handleMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 relative"
              >
                <Menu className="h-7 w-7" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mr-2 mb-2">
              <DropdownMenuItem asChild className="py-3">
                <Link href="/book-service" className="flex items-center cursor-pointer">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Book Inspection</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer" onClick={handleWhatsAppClick}>
                <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                <span>WhatsApp Chat</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer" onClick={handleCallClick}>
                <Phone className="h-5 w-5 mr-2 text-blue-500" />
                <span>Call Us</span>
              </DropdownMenuItem>
              {showScrollToTop && (
                <DropdownMenuItem className="py-3 cursor-pointer" onClick={handleScrollToTop}>
                  <ArrowUp className="h-5 w-5 mr-2 text-gray-700" />
                  <span>Back to Top</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* On desktop: Show all buttons separately with spacing */}
      <div className="hidden md:flex md:flex-col md:items-end md:gap-3">
        {/* Book Now Button */}
        <Button
          asChild
          className="rounded-full px-4 py-2 h-auto shadow-lg bg-primary hover:bg-primary/90 text-white"
        >
          <Link href="/book-service">
            <Calendar className="h-5 w-5 mr-2" />
            Book Inspection
          </Link>
        </Button>

        {/* WhatsApp Button */}
        <div className="flex items-center gap-3">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-bounce">
            Chat with us!
          </div>
          <Button
            onClick={handleWhatsAppClick}
            className="rounded-full h-12 w-12 shadow-md bg-green-500 hover:bg-green-600"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Contact us on WhatsApp</span>
          </Button>
        </div>

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