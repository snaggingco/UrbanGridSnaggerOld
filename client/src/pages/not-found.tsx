import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SEO from "@/components/SEO";

export default function NotFound() {
  // Set the HTTP status code to 404 for search engines
  useEffect(() => {
    // This will work when using SSR, and helps search engines understand this is a 404 page
    if (typeof document !== "undefined") {
      const meta = document.createElement("meta");
      meta.name = "prerender-status-code";
      meta.content = "404";
      document.head.appendChild(meta);
      
      return () => {
        document.head.removeChild(meta);
      };
    }
  }, []);

  return (
    <>
      <SEO 
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        canonicalUrl="https://www.snagging.me/404"
        keywords={["404", "page not found", "error"]}
        noIndex={true}
      />
      
      <div className="min-h-[70vh] w-full flex items-center justify-center bg-gray-50 py-16">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2 items-center">
              <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
              <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
            </div>

            <p className="mt-4 text-gray-600">
              Sorry, the page you were looking for doesn't exist or has been moved.
            </p>
            
            <div className="mt-8 space-y-3">
              <Button variant="default" className="w-full flex items-center justify-center gap-2" asChild>
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Return to Homepage
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" asChild>
                <Link href="/snagging-services">
                  <Search className="h-4 w-4" />
                  Explore Our Services
                </Link>
              </Button>
              
              <Button variant="ghost" className="w-full flex items-center justify-center gap-2" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
