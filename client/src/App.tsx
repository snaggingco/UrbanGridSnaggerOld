import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy, useEffect } from "react";
import { lazyLoad, preloadModule } from "./lib/lazyLoad";
import ResourceHints from "@/components/ResourceHints";
import { loadScriptOnIdle } from "@/lib/defer-scripts";
import VisitorTracker from "@/components/utils/VisitorTracker";

// Defer loading non-critical components until after page load
const Header = lazy(() => import("@/components/layout/Header"));
const Footer = lazy(() => import("@/components/layout/Footer"));
const UnifiedActionButtons = lazy(() => import("@/components/ui/UnifiedActionButtons"));

// Preload Home module as soon as possible
preloadModule(() => import("@/pages/Home"));

// Use enhanced lazy loading for all pages to improve performance and handle edge cases
const Home = lazyLoad(() => import("@/pages/Home"), 3, 8000);
const BookService = lazyLoad(() => import("@/pages/BookService"));
const BlogPage = lazyLoad(() => import("@/pages/Blog"));
const BlogPost = lazyLoad(() => import("@/pages/BlogPost"));
const Location = lazyLoad(() => import("@/pages/Location"));
const PropertyInspection = lazyLoad(() => import("@/pages/PropertyInspection"));
const SnaggingServices = lazyLoad(() => import("@/pages/SnaggingServices"));
const SnaggingDubai = lazyLoad(() => import("@/pages/SnaggingDubai"));
const PropertyInspectionDubai = lazyLoad(() => import("@/pages/PropertyInspectionDubai"));
const PropertyHandover = lazyLoad(() => import("@/pages/PropertyHandover"));
const RERAaudits = lazyLoad(() => import("@/pages/RERAaudits"));
const Downloads = lazyLoad(() => import("@/pages/Downloads"));
const NotFound = lazyLoad(() => import("@/pages/not-found"));

// Inspection Portal Pages
const Login = lazyLoad(() => import("@/pages/Login"));
const InspectionDashboard = lazyLoad(() => import("@/pages/Inspection"));
const DashboardPage = lazyLoad(() => import("@/pages/inspection/Dashboard"));
const ProjectDetails = lazyLoad(() => import("@/pages/ProjectDetails"));
const ProjectsPage = lazyLoad(() => import("@/pages/inspection/Projects"));
const DefectsPage = lazyLoad(() => import("@/pages/inspection/Defects"));
const ReportsPage = lazyLoad(() => import("@/pages/inspection/Reports"));
const ReportSettingsPage = lazyLoad(() => import("@/pages/inspection/ReportSettings"));
const SettingsPage = lazyLoad(() => import("@/pages/inspection/Settings"));
const ReportBuilderRoutes = lazyLoad(() => import("@/pages/inspection/report-builder"));

// RERA Audit specific pages
const RERAInspection = lazyLoad(() => import("@/pages/inspection/RERAInspection"));

// AMC Cost Allocation pages
const AmcAllocation = lazyLoad(() => import("@/pages/inspection/AmcAllocation"));

// SEO Intelligence pages
const SeoIntelligence = lazyLoad(() => import("@/pages/seo/SeoIntelligence"));

// Admin Portal Pages
const LeadManagement = lazyLoad(() => import("@/pages/Admin/LeadManagement"));
const VisitorTracking = lazyLoad(() => import("@/pages/Admin/VisitorTracking"));
const AdminAnalytics = lazyLoad(() => import("@/pages/Admin/AdminAnalytics"));
const AdminCalendar = lazyLoad(() => import("@/pages/Admin/AdminCalendar"));
const AdminSettings = lazyLoad(() => import("@/pages/Admin/AdminSettings"));
const ReraProjectsAdmin = lazyLoad(() => import("@/pages/Admin/ReraProjectsAdmin"));

// Loading component for suspense fallback
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function Router() {
  const [location] = useLocation();
  
  // Check if we're in the inspection or admin portal section
  const isInspectionPortal = location.startsWith("/login") || location.startsWith("/inspection") || location.startsWith("/admin");
  
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        {/* Public website routes */}
        <Route path="/" component={Home} />
        <Route path="/book-service" component={BookService} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/category/:categoryId" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/location" component={Location} />
        <Route path="/property-inspection" component={PropertyInspection} />
        <Route path="/property-inspection-dubai" component={PropertyInspectionDubai} />
        <Route path="/snagging-services" component={SnaggingServices} />
        <Route path="/snagging-dubai" component={SnaggingDubai} />
        <Route path="/property-handover" component={PropertyHandover} />
        <Route path="/rera-audits" component={RERAaudits} />
        <Route path="/downloads" component={Downloads} />
        
        {/* Inspection portal routes */}
        <Route path="/login" component={Login} />
        <Route path="/inspection" component={InspectionDashboard} />
        <Route path="/inspection/dashboard" component={DashboardPage} />
        <Route path="/inspection/projects" component={ProjectsPage} />
        <Route path="/inspection/defects" component={DefectsPage} />
        <Route path="/inspection/reports" component={ReportsPage} />
        <Route path="/inspection/report-settings" component={ReportSettingsPage} />
        <Route path="/inspection/settings" component={SettingsPage} />
        <Route path="/inspection/project/:id" component={ProjectDetails} />
        <Route path="/inspection/report-builder/*" component={ReportBuilderRoutes} />
        
        {/* RERA Audit specific routes */}
        <Route path="/inspection/rera-project/:id" component={RERAInspection} />
        
        {/* AMC Allocation routes */}
        <Route path="/inspection/amc-allocation" component={AmcAllocation} />
        <Route path="/inspection/amc-allocation/:id" component={AmcAllocation} />
        
        {/* Admin portal routes */}
        <Route path="/admin/seo-intelligence" component={SeoIntelligence} />
        <Route path="/admin/leads" component={LeadManagement} />
        <Route path="/admin/visitors" component={VisitorTracking} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/calendar" component={AdminCalendar} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/rera-projects" component={ReraProjectsAdmin} />
        
        {/* 404 route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [location] = useLocation();
  
  // Check if we're in the inspection or admin portal section
  const isInspectionPortal = location.startsWith("/login") || location.startsWith("/inspection") || location.startsWith("/admin");
  
  // Use defer loading for non-critical scripts 
  useEffect(() => {
    // Load Google Tag Manager in idle time
    loadScriptOnIdle('https://www.googletagmanager.com/gtm.js?id=GTM-KHFS29FM', {
      id: 'google-tag-manager',
      async: true
    });
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        {/* Add resource hints to improve performance */}
        <ResourceHints />
        
        {/* Don't show header/footer/action buttons in inspection portal pages */}
        <Suspense fallback={<div className="h-16 bg-white shadow-sm"></div>}>
          {!isInspectionPortal && <Header />}
        </Suspense>
        
        <main className={`flex-1 ${isInspectionPortal ? 'p-0' : ''}`}>
          <Router />
        </main>
        
        <Suspense fallback={<div className="h-40 bg-gray-50"></div>}>
          {!isInspectionPortal && <Footer />}
        </Suspense>
        
        <Suspense fallback={null}>
          {!isInspectionPortal && <UnifiedActionButtons />}
        </Suspense>
        
        <Toaster />
        {/* Silently track visitor data in the background */}
        <VisitorTracker />
      </div>
    </QueryClientProvider>
  );
}

export default App;