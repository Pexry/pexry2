"use client";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface NotificationIndicatorProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  asButton?: boolean;
}

export const NotificationIndicator = ({ 
  href = "/dashboard/notifications", 
  children, 
  className,
  asButton = true 
}: NotificationIndicatorProps) => {
  const trpc = useTRPC();
  
  const { data: unreadData } = useQuery({
    ...trpc.notifications.getUnreadCount.queryOptions(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const unreadCount = unreadData?.count || 0;

  const content = (
    <div className="relative flex items-center">
      {children || <Bell className="h-5 w-5" />}
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs flex items-center justify-center px-1"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );

  if (asButton) {
    return (
      <Link href={href}>
        <Button variant="ghost" size="sm" className={className}>
          {content}
        </Button>
      </Link>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
};
