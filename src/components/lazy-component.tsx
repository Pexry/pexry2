import React, { Suspense, ComponentType } from 'react';
import { LoadingSpinner } from './optimized-loading';

interface LazyComponentProps {
  fallback?: React.ComponentType;
  delay?: number;
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: LazyComponentProps = {}
) {
  const { fallback: Fallback = LoadingSpinner, delay = 0 } = options;

  const LazyComponent = React.lazy(() => {
    return new Promise<{ default: ComponentType<P> }>((resolve) => {
      setTimeout(() => {
        resolve({ default: Component });
      }, delay);
    });
  });

  return function WithLazyLoading(props: P) {
    return (
      <Suspense fallback={<Fallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Prebuilt lazy components for common use cases
export const LazyChart = React.lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);

export const LazyDataTable = React.lazy(() => 
  import('@/components/optimized-data-table').then(module => ({ default: module.OptimizedDataTable }))
);

// Memory optimization: Preload lazy components when needed
export function preloadComponent<P>(LazyComponent: React.LazyExoticComponent<ComponentType<P>>) {
  // Trigger the lazy component to start loading
  const componentImport = LazyComponent as any;
  if (componentImport._payload && componentImport._payload._status === 'unresolved') {
    componentImport._payload._result();
  }
}
