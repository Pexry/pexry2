"use client";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

export const NotificationIndicator = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Simulate some notifications for demo purposes
  useEffect(() => {
    // You can replace this with actual API call later
    setUnreadCount(3);
  }, []);

  return (
    <Link href="/dashboard/notifications">
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
};
