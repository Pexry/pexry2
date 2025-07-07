"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { NotificationIndicator } from "@/components/notification-indicator";
import { MessageIndicator } from "@/components/message-indicator";

const navbarItems = [
    { href: "/dashboard", children: "Overview" },  
    { href: "/dashboard/products", children: "Products" },
    { href: "/dashboard/purchases", children: "Purchases" },
    { href: "/dashboard/seller-orders", children: "Seller Orders" },
    { href: "/dashboard/disputes", children: "Disputes" },
    { href: "/dashboard/messages", children: "Messages" },
    { href: "/dashboard/notifications", children: "Notifications" },
    { href: "/dashboard/payout", children: "Payout" },
    { href: "/dashboard/account", children: "Account" },  
];

const agentNavbarItems = [
    { href: "/dashboard/agent-support", children: "Support Center" },
];

interface SidebarItemProps {
    href: string;
    children: React.ReactNode;
    isActive?: boolean;
}

const SidebarItem = ({ href, children, isActive }: SidebarItemProps) => {
    // Special handling for notifications and messages
    if (href === "/dashboard/notifications") {
        return (
            <NotificationIndicator
                href={href}
                asButton={false}
                className={cn(
                    "flex flex-col items-center bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg w-full justify-center py-2",
                    isActive && "bg-black text-white hover:bg-black hover:text-white",
                )}
            >
                <span>{children}</span>
            </NotificationIndicator>
        );
    }
    
    if (href === "/dashboard/messages") {
        return (
            <MessageIndicator
                href={href}
                className={cn(
                    "flex flex-col items-center bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg w-full justify-center py-2",
                    isActive && "bg-black text-white hover:bg-black hover:text-white",
                )}
            >
                <span>{children}</span>
            </MessageIndicator>
        );
    }

    return (
        <Button
        asChild
            variant="secondary"
            className={cn(
                "flex flex-col items-center bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg",
                isActive && "bg-black text-white hover:bg-black hover:text-white",
            )}
        >
            <Link href={href}>
                 {children}
            </Link>
        </Button>  
    );
};

export const DashboardSidebarDesktop = () => {
    const pathname = usePathname();
    const trpc = useTRPC();
    const session = useQuery(trpc.auth.session.queryOptions());

    // Determine which navigation items to show based on user role
    const isAgent = session.data?.user?.roles?.includes('user-agent');
    const isSuperAdmin = session.data?.user?.roles?.includes('super-admin');
    
    // If user is only an agent (not super admin), show agent-only navigation
    const navigationItems = (isAgent && !isSuperAdmin) ? agentNavbarItems : navbarItems;

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* User info section */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                            {session.data?.user?.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {session.data?.user?.email || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {isAgent && !isSuperAdmin ? 'Support Agent' : 'Dashboard'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation items */}
            <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1">
                    {navigationItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            isActive={pathname === item.href}
                        >
                            {item.children}
                        </SidebarItem>
                    ))}
                </nav>
            </ScrollArea>

            {/* Logout button */}
            <div className="p-4 border-t border-gray-200">
                <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        window.location.href = "/";
                    }}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
};
