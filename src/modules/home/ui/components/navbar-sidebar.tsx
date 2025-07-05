"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const GlobalCartButton = dynamic(
    () => import("@/modules/checkout/ui/components/global-cart-button").then(
        (mod) => mod.GlobalCartButton,
    ),
    {
        ssr: false,
        loading: () => null
    },
);

interface NavbarItem {
  href: string;
  children: React.ReactNode;
}

interface Props {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NavbarSidebar = ({ items, open, onOpenChange }: Props) => {
  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 transition-none">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Menu</SheetTitle>
            {session.data?.user && (
              <GlobalCartButton />
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full text-right p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              onClick={() => onOpenChange(false)}
            >
              {item.children}
            </Link>
          ))}

          {session.data?.user ? (
            <div className="border-t">
              <Link
                onClick={() => onOpenChange(false)}
                href="/admin"
                className="w-full text-right p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              >
                Dashboard
              </Link>

              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/"; // or "/"
                }}
                className="w-full text-right p-4 hover:bg-teal-300 text-red-700 hover:text-black flex items-center text-base font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t">
              <Link
                onClick={() => onOpenChange(false)}
                href="/sign-in"
                className="w-full text-right p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              >
                Log In
              </Link>
              <Link
                onClick={() => onOpenChange(false)}
                href="/sign-up"
                className="w-full text-right p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              >
                Start Selling
              </Link>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
