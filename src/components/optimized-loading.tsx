import { Suspense } from 'react';
import { LoaderIcon } from 'lucide-react';

interface OptimizedSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

// Optimized loading component
export const LoadingSpinner = ({ className = '' }) => (
  <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
    <LoaderIcon className="animate-spin size-8 text-muted-foreground" />
  </div>
);

// Optimized Suspense wrapper
export const OptimizedSuspense = ({ 
  children, 
  fallback, 
  className = '' 
}: OptimizedSuspenseProps) => (
  <Suspense fallback={fallback || <LoadingSpinner className={className} />}>
    {children}
  </Suspense>
);

// Loading states for different components
export const CardLoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-4 border rounded-lg animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="border rounded-lg p-4 animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);
