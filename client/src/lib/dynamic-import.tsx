import { lazy, Suspense } from 'react';

// Type definition for the component props
type ComponentProps = Record<string, any>;

/**
 * Creates a dynamic import wrapper for React components
 * This helps with code splitting and reducing initial bundle size
 * 
 * @param importFn - A function that returns a dynamic import (e.g., () => import('./Component'))
 * @param LoadingComponent - A component to show while loading
 * @returns A lazy-loaded component
 */
export function createDynamicImport<T extends ComponentProps>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  LoadingComponent: React.ComponentType<{ height?: string | number }> = DefaultLoader
) {
  // Create a lazy component
  const LazyComponent = lazy(importFn);
  
  // Return a wrapper component that handles the Suspense logic
  return function DynamicComponent(props: T) {
    return (
      <Suspense fallback={<LoadingComponent height={props.height || 200} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// A simple default loader component
const DefaultLoader: React.FC<{ height?: string | number }> = ({ height = 200 }) => (
  <div
    style={{
      height: typeof height === 'number' ? `${height}px` : height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: '24px',
        height: '24px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  </div>
);

// Add the spin animation to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}