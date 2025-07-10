"use client";

import { useEffect } from 'react';

// Performance monitoring utilities
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Monitor Core Web Vitals manually
    if (typeof window !== 'undefined') {
      const reportWebVitals = (name: string, value: number, id?: string) => {
        // Send to analytics service
        console.log('Web Vital:', { name, value, id });
        
        // Example: Send to Google Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', name, {
            value: Math.round(name === 'CLS' ? value * 1000 : value),
            event_label: id,
            non_interaction: true,
          });
        }
      };

      // Monitor LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            reportWebVitals('LCP', lastEntry.startTime, lastEntry.id);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // Monitor FCP (First Contentful Paint)
      if ('PerformanceObserver' in window) {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              reportWebVitals('FCP', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      }
    }

    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const nav = entry as PerformanceNavigationTiming;
            console.log('Navigation timing:', {
              dns: nav.domainLookupEnd - nav.domainLookupStart,
              connect: nav.connectEnd - nav.connectStart,
              response: nav.responseEnd - nav.responseStart,
              dom: nav.domContentLoadedEventEnd - nav.responseEnd,
              load: nav.loadEventEnd - nav.loadEventStart,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });

      return () => observer.disconnect();
    }
  }, []);
}

// Component to automatically monitor performance
export const PerformanceMonitor = () => {
  usePerformanceMonitoring();
  return null;
};

// Resource loading optimization
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload critical CSS
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = '/_next/static/css/app.css';
  document.head.appendChild(link);

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.href = '/fonts/dm-sans-400.woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
}

// Memory optimization utilities
export function cleanupUnusedResources() {
  if (typeof window === 'undefined') return;
  
  // Clean up unused images
  const images = document.querySelectorAll('img[data-loaded="true"]');
  images.forEach((img) => {
    const rect = img.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (!isVisible && img.getAttribute('data-cleanup') !== 'false') {
      // Remove image from DOM if not visible and marked for cleanup
      (img as HTMLImageElement).src = '';
    }
  });
}

// TypeScript declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Make gtag optional
const gtag = typeof window !== 'undefined' ? window.gtag : undefined;
