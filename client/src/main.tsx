import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import "./critical.css"; // Load critical CSS first
import { queryClient } from "./lib/queryClient";

// Import i18n configuration
import "./i18n";

// Create a component that will load non-critical CSS
const CssLoader = () => {
  useEffect(() => {
    // Dynamically import the full CSS after the initial render
    import('./index.css').then(() => {
      console.log('Full CSS loaded');
    });
  }, []);
  
  return null;
};

// Use lazy loading for the main App component
const App = lazy(() => import("./App"));

// Add a simple loading state component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Create a lightweight bootstrap function
const startApp = () => {
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <CssLoader />
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </QueryClientProvider>
  );
};

// Use requestIdleCallback for non-critical initialization
if ('requestIdleCallback' in window) {
  // Wait for browser idle time to initialize non-critical parts
  window.requestIdleCallback(() => {
    // Any non-critical initialization can go here
    console.log('Non-critical initialization complete');
  });
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(() => {
    console.log('Non-critical initialization complete');
  }, 1);
}

// Start the application
startApp();
