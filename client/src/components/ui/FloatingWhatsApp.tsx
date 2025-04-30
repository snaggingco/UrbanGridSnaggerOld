import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  const handleClick = () => {
    const message = encodeURIComponent(
      "Hi, I'm interested in getting my property inspected. Could you provide more information about your services?"
    );
    window.open(
      `https://wa.me/971585686852?text=${message}`,
      "_blank"
    );
  };

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-bounce">
        Chat with us now!
      </div>
      <Button
        onClick={handleClick}
        className="rounded-full h-16 w-16 shadow-lg bg-green-500 hover:bg-green-600 animate-pulse hover:animate-none"
      >
        <MessageCircle className="h-8 w-8" />
        <span className="sr-only">Contact us on WhatsApp</span>
      </Button>
    </div>
  );
}