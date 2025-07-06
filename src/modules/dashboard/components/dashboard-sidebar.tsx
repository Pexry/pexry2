import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { NotificationIndicator } from "@/components/notification-indicator";
import { MessageIndicator } from "@/components/message-indicator";

interface NavbarItem {
    href: string;
    children: React.ReactNode
}

interface Props {
    items: NavbarItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}



export const DashboardSidebar = ({
    items,
    open,
    onOpenChange,
}: Props) => {
    
    const trpc = useTRPC();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="p-0 transition-none"
            >
                <SheetHeader className="p-4 border-b">
                    <div className="flex items-center">
                        <SheetTitle>
                            Menu
                        </SheetTitle>
                    </div>
                </SheetHeader>
                <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
                    {items.map((item) => {
                        // Special handling for notifications and messages
                        if (item.href === "/dashboard/notifications") {
                            return (
                                <NotificationIndicator
                                    key={item.href}
                                    href={item.href}
                                    asButton={false}
                                    className="w-full text-right p-4 hover:bg-black hover:text-white flex items-center justify-end text-base font-medium"
                                >
                                    <span onClick={() => onOpenChange(false)}>{item.children}</span>
                                </NotificationIndicator>
                            );
                        }
                        
                        if (item.href === "/dashboard/messages") {
                            return (
                                <MessageIndicator
                                    key={item.href}
                                    href={item.href}
                                    className="w-full text-right p-4 hover:bg-black hover:text-white flex items-center justify-end text-base font-medium"
                                >
                                    <span onClick={() => onOpenChange(false)}>{item.children}</span>
                                </MessageIndicator>
                            );
                        }
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="w-full text-right p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                                onClick={() => onOpenChange(false)}
                            >
                                {item.children}
                            </Link>
                        );
                    })}
                    <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/"; // or "/"
                }}
                className="w-full text-right p-4 hover:bg-teal-300 text-red-700 hover:text-black flex items-center text-base font-medium"
              >
                Logout
              </button>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};