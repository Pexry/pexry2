"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

interface Props {
    children: React.ReactNode;
}

export const AgentRedirectWrapper = ({ children }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const trpc = useTRPC();
    const { data: session } = useQuery(trpc.auth.session.queryOptions());

    useEffect(() => {
        if (session?.user) {
            const isAgent = session.user.roles?.includes('user-agent');
            const isSuperAdmin = session.user.roles?.includes('super-admin');
            
            // If user is only an agent (not super admin) and not on agent-support or account page
            if (isAgent && !isSuperAdmin && 
                !pathname.includes('/agent-support') && 
                !pathname.includes('/account')) {
                // Redirect to agent support page
                router.replace('/dashboard/agent-support');
            }
        }
    }, [session, pathname, router]);

    return <>{children}</>;
};
