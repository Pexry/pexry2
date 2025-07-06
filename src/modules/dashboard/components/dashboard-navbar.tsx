"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./dashboard-sidebar";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});

const navbarItems =[
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

export const DashboardNavbar = () => {
    const [isSidebarOpen, setIsSidbarOpen] = useState(false);

    const trpc = useTRPC();
    const { data: session } = useQuery(trpc.auth.session.queryOptions());

    // Determine which navigation items to show based on user role
    const isAgent = session?.user?.roles?.includes('user-agent');
    const isSuperAdmin = session?.user?.roles?.includes('super-admin');
    
    // If user is only an agent (not super admin), show agent-only navigation
    const navigationItems = (isAgent && !isSuperAdmin) ? agentNavbarItems : navbarItems;

    return (
        <nav className="h-18 flex border-b justify-between font-medium bg-white shadow-sm" >
            <Link href="/" className="pl-6 flex items-center">
                <span className={cn("text-5xl font-semibold", poppins.className)}>
                    Pexry
                </span>
            </Link>

            <DashboardSidebar 
                items={navigationItems}
                open={isSidebarOpen}
                onOpenChange={setIsSidbarOpen}
            />

            {/* Desktop navigation removed - now in sidebar */}
            <div className="hidden lg:flex items-center">
                <Button
                className="h-full rounded-none border-l border-t-0 border-b-0 border-r-0 bg-white text-black hover:bg-teal-300 hover:text-black transition-colors text-lg"
                onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/"; // redirect after logout
                }}
                >
                Logout
                </Button>
            </div>

            <div className="flex lg:hidden items-center justify-center">
                <Button
                    variant="ghost"
                    className="size-12 border-transparent bg-white"
                    onClick={() => setIsSidbarOpen(true) }
                >
                    <MenuIcon />
                </Button>
            </div>

        </nav>
    );
};