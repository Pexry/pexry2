import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";

interface MessageIndicatorProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const MessageIndicator = ({ href, children, className }: MessageIndicatorProps) => {
  const trpc = useTRPC();
  
  const { data: unreadData } = useQuery({
    ...trpc.conversations.getUnreadMessagesCount.queryOptions(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
  
  const unreadCount = unreadData?.count || 0;

  return (
    <Link href={href} className={className}>
      <div className="relative flex items-center">
        {children}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>
    </Link>
  );
};
