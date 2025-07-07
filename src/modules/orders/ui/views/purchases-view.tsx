"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EnhancedOrderCard } from "../components/enhanced-order-card";

import { DEFAULT_LIMIT } from "@/constants";
import { LoaderIcon } from "lucide-react";
import { OrderStats } from "../components/order-stats";

export const PurchasesView = () => {
  const [statusFilter, setStatusFilter] = useState<"paid" | "delivered">("paid");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Get order statistics
  const { data: stats, isLoading: statsLoading } = useQuery(
    trpc.orders.getOrderStats.queryOptions()
  );

  // Get orders with infinite loading
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery(
    trpc.orders.getMyOrders.infiniteQueryOptions({
      limit: DEFAULT_LIMIT,
      status: statusFilter,
    }, {
      getNextPageParam: (lastPage) => {
        return lastPage.hasNextPage ? lastPage.nextPage : undefined;
      },
    })
  );

  const orders = data?.pages.flatMap((page) => page.docs) ?? [];

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value as "paid" | "delivered");
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading purchases: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Purchases</h1>
          <p className="text-muted-foreground">
            View and manage your purchase history
          </p>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Order Statistics */}
      {!statsLoading && stats && (
        <OrderStats stats={stats} hidePending={true} />
      )}

      <Separator />

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No purchases found</h3>
              <p className="text-muted-foreground">
                No {statusFilter} orders found.
              </p>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Start Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <EnhancedOrderCard key={order.id} order={order} />
          ))}
          
          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
