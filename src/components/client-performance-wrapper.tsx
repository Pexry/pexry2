"use client";

import { useEffect } from "react";
import { PerformanceMonitor, cleanupResources } from "./performance-monitor-simple";

// Memory management component
export const ClientPerformanceWrapper = () => {
  useEffect(() => {
    // Clean up resources periodically
    const interval = setInterval(() => {
      cleanupResources();
    }, 60000); // Every minute

    // Clean up on page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupResources();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <PerformanceMonitor />;
};
