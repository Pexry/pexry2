"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { 
  LoaderIcon, 
  Bell, 
  BellOff, 
  CheckCheck, 
  Trash2, 
  Filter,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'sale':
      return <ShoppingCart className="h-4 w-4 text-green-600" />;
    case 'dispute_opened':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'dispute_resolved':
      return <CheckCircle className="h-4 w-4 text-blue-600" />;
    case 'withdrawal_paid':
      return <DollarSign className="h-4 w-4 text-green-600" />;
    case 'withdrawal_rejected':
      return <X className="h-4 w-4 text-red-600" />;
    default:
      return <Bell className="h-4 w-4 text-gray-600" />;
  }
};

const getNotificationColor = (type: string, read: boolean) => {
  if (read) return "bg-gray-50 border-gray-200";
  
  switch (type) {
    case 'sale':
      return "bg-green-50 border-green-200";
    case 'dispute_opened':
      return "bg-red-50 border-red-200";
    case 'dispute_resolved':
      return "bg-blue-50 border-blue-200";
    case 'withdrawal_paid':
      return "bg-green-50 border-green-200";
    case 'withdrawal_rejected':
      return "bg-red-50 border-red-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return "bg-red-100 text-red-800";
    case 'high':
      return "bg-orange-100 text-orange-800";
    case 'normal':
      return "bg-blue-100 text-blue-800";
    case 'low':
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const NotificationsPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Create query options based on current filters
  const notificationsQueryOptions = trpc.notifications.getMyNotifications.queryOptions({
    limit: 50,
    unreadOnly: showUnreadOnly,
    type: filter === 'all' ? undefined : filter as any,
  });

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery(notificationsQueryOptions);

  // Fetch unread count
  const { data: unreadData } = useQuery({
    ...trpc.notifications.getUnreadCount.queryOptions(),
  });
  const unreadCount = unreadData?.count || 0;

  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [filter, showUnreadOnly, refetch]);

  // Mutations
  const markAsReadMutation = useMutation({
    ...trpc.notifications.markAsRead.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.notifications.getMyNotifications.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.notifications.getUnreadCount.queryKey() });
    },
  });

  const markAllAsReadMutation = useMutation({
    ...trpc.notifications.markAllAsRead.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.notifications.getMyNotifications.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.notifications.getUnreadCount.queryKey() });
      toast.success("All notifications marked as read");
    },
  });

  const deleteNotificationMutation = useMutation({
    ...trpc.notifications.deleteNotification.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.notifications.getMyNotifications.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.notifications.getUnreadCount.queryKey() });
      toast.success("Notification deleted");
    },
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error: any) {
      toast.error(error?.message || "Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error: any) {
      toast.error(error?.message || "Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete notification");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoaderIcon className="animate-spin size-8 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Stay updated with your marketplace activity
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className="flex items-center gap-2"
          >
            {showUnreadOnly ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-2"
            >
              {markAllAsReadMutation.isPending ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
            {['all', 'sale', 'dispute_opened', 'dispute_resolved', 'withdrawal_paid', 'withdrawal_rejected'].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType)}
              >
                {filterType === 'all' ? 'All' : 
                 filterType === 'sale' ? 'Sales' :
                 filterType === 'dispute_opened' ? 'Disputes' :
                 filterType === 'dispute_resolved' ? 'Resolutions' :
                 filterType === 'withdrawal_paid' ? 'Withdrawals' :
                 'Rejections'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {!notifications?.docs || notifications.docs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {showUnreadOnly 
                ? "You have no unread notifications" 
                : "You'll see notifications here when there's activity on your account"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.docs.map((notification: any) => (
            <Card 
              key={notification.id} 
              className={`transition-colors cursor-pointer hover:shadow-md ${getNotificationColor(notification.type, notification.read)}`}
              onClick={() => {
                if (!notification.read) {
                  handleMarkAsRead(notification.id);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                        <Badge className={getPriorityColor(notification.priority)} variant="secondary">
                          {notification.priority}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm mb-2 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.actionUrl && (
                          <Link 
                            href={notification.actionUrl}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!notification.read) {
                                handleMarkAsRead(notification.id);
                              }
                            }}
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        disabled={markAsReadMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      disabled={deleteNotificationMutation.isPending}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination could be added here if needed */}
      {notifications && notifications.totalPages > 1 && (
        <Card>
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Showing {notifications.docs.length} of {notifications.totalDocs} notifications
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
