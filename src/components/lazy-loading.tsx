import { lazy, ComponentType } from 'react';
import { OptimizedSuspense, LoadingSpinner } from './optimized-loading';

// Generic lazy loading wrapper
export function createLazyComponent<T extends Record<string, any> = {}>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: T) {
    return (
      <OptimizedSuspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...(props as any)} />
      </OptimizedSuspense>
    );
  };
}

// Higher-order component for adding lazy loading to any component
export function withLazyLoading<T extends Record<string, any> = {}>(
  Component: ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <OptimizedSuspense fallback={fallback}>
        <Component {...(props as any)} />
      </OptimizedSuspense>
    );
  };
}
