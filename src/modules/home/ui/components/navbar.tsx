"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

import { NavbarSidebar } from "./navbar-sidebar";

const GlobalCartButton = dynamic(
    () => import("@/modules/checkout/ui/components/global-cart-button").then(
        (mod) => mod.GlobalCartButton,
    ),
    {
        ssr: false,
        loading: () => null
    },
);




const LogoComponent = dynamic(
    () => Promise.resolve(() => (
        <span className={cn("text-5xl font-semibold", poppins.className)}>
            Pexry
        </span>
    )),
    {
        ssr: false,
        loading: () => (
            <span className="text-5xl font-semibold">
                Pexry
            </span>
        )
    }
);

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});

interface NavbarItemProps {
    href: string;
    children: React.ReactNode;
    isActive?: boolean;
};

const NavbarItem = ({
    href,
    children,
    isActive,
}: NavbarItemProps) => {
    return (
        <Button
        asChild
            variant="secondary"
            className={cn(
                "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg items-start",
                isActive && "bg-black text-white hover:bg-black hover:text-white",
            )}
        >
            <Link href={href}>
                 {children}
            </Link>
        </Button>  
    );
};

const navbarItems =[
    { href: "/", children: "Discover" },
    { href: "/features", children: "Feautures" },
    { href: "/pricing", children: "Pricing" },
    { href: "/faqs", children: "FAQs" },
    { href: "/about", children: "About" },   
];

export const Navbar = () => {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidbarOpen] = useState(false);

    const trpc = useTRPC();
    const session = useQuery(trpc.auth.session.queryOptions());

    return (
        <nav className="h-18 flex border-b justify-between font-medium bg-white" >
            <Link href="/" className="pl-6 flex items-center">
                <LogoComponent />
            </Link>

            <NavbarSidebar 
                items={navbarItems}
                open={isSidebarOpen}
                onOpenChange={setIsSidbarOpen}
            />

            <div className="items-center gap-4 hidden lg:flex">
                {navbarItems.map((item) => (
                   <NavbarItem
                       key={item.href} 
                       href={item.href}
                       isActive={pathname === item.href}
                    >
                        {item.children}
                    </NavbarItem>
                   
                ))}
            </div>

            {session.data?.user ? (
            <div className="hidden lg:flex items-center">
                <div className="mr-4">
                    <GlobalCartButton />
                </div>
                <Button
                asChild
                className="border-l border-t-0 border-b-0 border-r-0 px-5 h-full rounded-none bg-black text-white hover:bg-teal-300 hover:text-black transition-colors text-lg"
                >
                <Link href="/dashboard">Dashboard</Link>
                </Button>

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
            ) : (
 
            <div className="hidden lg:flex">
                <Button
                    asChild
                    variant="secondary"
                    className="border-l border-t-0 border-b-0 border-r-0 px-5 h-full rounded-none bg-white hover:bg-teal-300 transition-colors text-lg"
                >
                    <Link prefetch href="/sign-in">
                        Log in
                    </Link>
                    
                </Button>
                <Button
                    asChild
                    className="border-l border-t-0 border-b-0 border-r-0 px-5 h-full rounded-none bg-black text-white  hover:bg-teal-300 hover:text-black transition-colors text-lg"
                >
                    <Link prefetch href="/sign-up">
                        Start Selling
                    </Link>
                </Button>
            </div>  

            )}
            <div className="flex lg:hidden items-center justify-center gap-2">
                {session.data?.user && (
                    <GlobalCartButton />
                )}
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