import { useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import {
  Info,
  Loader2,
  Menu,
  BellRing,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import EnhancedSidebar from "./EnhancedSidebar";

interface InspectionLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  actionButton?: React.ReactNode;
}

export default function InspectionLayout({ 
  children,
  title,
  description,
  showBackButton = false,
  backUrl = "/inspection",
  actionButton
}: InspectionLayoutProps) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      setLocation("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      setLoading(false);
    } catch (error) {
      setLocation("/login");
    }
  }, [setLocation]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setLocation("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-muted/20">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <EnhancedSidebar
          userName={user.name || user.username}
          userRole="Surveyor"
          onLogout={handleLogout}
        />
      </div>
      
      {/* Mobile Sidebar Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden absolute top-3 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px]">
          <EnhancedSidebar
            userName={user.name || user.username}
            userRole="Surveyor"
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-background border-b sticky top-0 z-30 py-3 px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Space for mobile menu button */}
              <div className="w-10 lg:hidden"></div>
              <div className="flex items-center">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    onClick={() => setLocation(backUrl)}
                  >
                    Back
                  </Button>
                )}
                <div>
                  <h1 className="text-xl font-bold">{title || "Inspection System"}</h1>
                  {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search in header for larger screens */}
              <div className="hidden md:flex relative max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9 bg-muted/60 w-[180px] lg:w-[240px]"
                />
              </div>
              
              {actionButton}
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground"
              >
                <BellRing className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/inspection/help")}
                className="rounded-full text-muted-foreground"
              >
                <Info className="h-5 w-5" />
              </Button>
              
              <div 
                onClick={() => setLocation("/inspection/profile")}
                className="hover:ring-2 hover:ring-primary/10 rounded-full cursor-pointer"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="container mx-auto px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}