'use client';

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function QueryErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-red-600">Query Error</h2>
        <p className="mt-2 text-sm text-gray-600">
          {error.message}
        </p>
        <button 
          onClick={resetErrorBoundary}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={QueryErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Query Error:', error);
        console.error('Error Info:', errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
