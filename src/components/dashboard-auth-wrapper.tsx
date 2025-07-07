"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

interface Props {
    children: React.ReactNode;
}

export const DashboardAuthWrapper = ({ children }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const trpc = useTRPC();
    const { data: session, isLoading, error } = useQuery(trpc.auth.session.queryOptions());
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        // Only redirect after loading is complete and we haven't already redirected
        if (!isLoading && !session?.user && !hasRedirected) {
            setHasRedirected(true);
            // Preserve the current dashboard path for redirect after login
            const redirectPath = encodeURIComponent(pathname);
            router.replace(`/sign-in?redirect=${redirectPath}`);
        }
    }, [session, isLoading, router, pathname, hasRedirected]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Show error state if there's an error fetching session
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
                    <p className="text-gray-600 mb-4">Unable to verify your authentication status.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mr-2"
                    >
                        Retry
                    </button>
                    <button 
                        onClick={() => router.push('/sign-in')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    // Don't render children if user is not authenticated
    if (!session?.user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">You need to be logged in to access the dashboard.</p>
                    <button 
                        onClick={() => router.push('/sign-in?redirect=/dashboard')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    // User is authenticated, render the dashboard
    return <>{children}</>;
};
