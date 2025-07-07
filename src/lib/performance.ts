// Performance monitoring utilities
export const performanceLogger = {
  // Time function execution
  time: <T>(name: string, fn: () => T): T => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return fn();
  },

  // Time async function execution
  timeAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const start = performance.now();
      const result = await fn();
      const end = performance.now();
      console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return fn();
  },

  // Log memory usage
  logMemory: (label: string) => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`🧠 ${label}:`, {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`,
      });
    }
  },

  // Mark performance milestones
  mark: (name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name);
    }
  },

  // Measure between marks
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name);
      if (measures.length > 0) {
        const measure = measures[0] as PerformanceMeasure;
        console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
      }
    }
  },
};

// React hook for performance monitoring
import { useEffect } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    performanceLogger.mark(`${componentName}-mount-start`);
    
    return () => {
      performanceLogger.mark(`${componentName}-mount-end`);
      performanceLogger.measure(
        `${componentName}-mount-duration`,
        `${componentName}-mount-start`,
        `${componentName}-mount-end`
      );
    };
  }, [componentName]);
};

// Report Web Vitals
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', metric);
  }
  
  // Send to analytics in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Example: send to Google Analytics
    // gtag('event', metric.name, {
    //   metric_value: Math.round(metric.value),
    //   metric_id: metric.id,
    //   metric_delta: metric.delta,
    // });
  }
};
