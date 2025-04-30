import React, { lazy, Suspense, ComponentType } from 'react';

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  errorBoundary?: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
}

/**
 * createLazyComponent - Creates a properly typed lazy-loaded component with Suspense
 * 
 * This utility makes it easy to code-split React components to reduce initial JavaScript payload.
 * It handles loading states and error boundaries automatically.
 * 
 * @example
 * // Instead of: import HeavyComponent from './HeavyComponent'
 * const HeavyComponent = createLazyComponent(() => import('./HeavyComponent'))
 */
export function createLazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(factory);
  
  // Default loading fallback
  const defaultFallback = (
    <div className="flex items-center justify-center p-4 min-h-[200px]">
      <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
    </div>
  );
  
  // Default error boundary
  const DefaultErrorBoundary: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    children: React.ReactNode;
  }> = ({ error, resetErrorBoundary, children }) => {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-red-800 font-medium mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-4 text-sm">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  };
  
  // Return wrapped component with Suspense and optional error boundary
  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    // If custom error boundary is provided
    if (options.errorBoundary) {
      const ErrorBoundary = options.errorBoundary;
      
      return (
        <ErrorBoundary
          error={new Error('Component failed to load')}
          resetErrorBoundary={() => window.location.reload()}
        >
          <Suspense fallback={options.fallback || defaultFallback}>
            <LazyComponent {...props} />
          </Suspense>
        </ErrorBoundary>
      );
    }
    
    // Otherwise just use Suspense
    return (
      <Suspense fallback={options.fallback || defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Example usage of the lazy loading utility:
 * 
 * // In your component imports:
 * const HeavyChartComponent = createLazyComponent(
 *   () => import('@/components/HeavyChartComponent'),
 *   { 
 *     fallback: <div>Loading chart...</div> 
 *   }
 * );
 * 
 * // In your JSX:
 * return (
 *   <div>
 *     <h1>Dashboard</h1>
 *     {showChart && <HeavyChartComponent data={chartData} />}
 *   </div>
 * );
 */