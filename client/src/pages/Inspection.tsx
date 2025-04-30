import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";

export default function InspectionDashboard() {
  const [, setLocation] = useLocation();
  
  // Redirect to dashboard page for a cleaner URL structure
  useEffect(() => {
    setLocation("/inspection/dashboard");
  }, [setLocation]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Helmet>
        <title>Redirecting... - Inspection System</title>
      </Helmet>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-500">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}