import { useEffect } from 'react';

interface PerformanceMonitorProps {
  route?: string;
}

export const PerformanceMonitor = ({ route }: PerformanceMonitorProps) => {
  useEffect(() => {
    // Monitor performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log performance metrics in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
          }
        }
      });

      observer.observe({ entryTypes: ['measure', 'navigation'] });

      // Cleanup
      return () => observer.disconnect();
    }
  }, [route]);

  return null;
};

// Resource preloader utility
export const preloadResources = (resources: string[]) => {
  if (typeof window !== 'undefined') {
    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      // Determine resource type
      if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        link.as = 'image';
      } else if (resource.endsWith('.woff2')) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }
};

// Memory cleanup utility
export const cleanupResources = () => {
  if (typeof window !== 'undefined') {
    // Clean up unused preload links
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    preloadLinks.forEach((link) => {
      const href = (link as HTMLLinkElement).href;
      // Remove if resource is likely cached/loaded
      if (href && !document.querySelector(`script[src="${href}"], link[href="${href}"][rel="stylesheet"]`)) {
        link.remove();
      }
    });
  }
};