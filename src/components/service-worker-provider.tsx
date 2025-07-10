"use client";

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    // Only register service worker in production
    if (
      typeof window !== 'undefined' && 
      'serviceWorker' in navigator && 
      process.env.NODE_ENV === 'production'
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);
            
            // Update found
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available
                    console.log('New content available, please refresh.');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);
}

export const ServiceWorkerProvider = () => {
  useServiceWorker();
  return null;
};
