"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Package, Search, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTRPC } from "@/trpc/client";
import { formatCurrency, cn } from "@/lib/utils";
import { MessageOrderUserButton } from "@/components/message-order-user-button";
import type { Order } from "@/payload-types";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "paid":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "delivered":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getDeliveryStatusColor = (status: string) => {
  switch (status) {
    case "auto":
      return "bg-green-100 text-green-800";
    case "waiting":
      return "bg-yellow-100 text-yellow-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function SellerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "delivered">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const trpc = useTRPC();

  // Load seller's orders
  const { data: sellerOrders, isLoading, error } = useQuery(
    trpc.orders.getMySellerOrders.queryOptions({
      cursor: 1,
      limit: 50,
      status: statusFilter === "all" ? undefined : statusFilter
    })
  );

  // Filter orders based on search term
  const filteredOrders = sellerOrders?.docs?.filter((order) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const product = order.product as any;
    const buyer = order.user as any;
    
    return (
      product?.name?.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower) ||
      buyer?.name?.toLowerCase().includes(searchLower) ||
      buyer?.email?.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-500">Failed to load orders. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Seller Orders</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage orders for your products and communicate with buyers
          </p>
        </div>
        
        {/* Search and Filter - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders, products, or buyers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-40 cursor-pointer">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">All Orders</SelectItem>
              <SelectItem className="cursor-pointer" value="pending">Pending</SelectItem>
              <SelectItem className="cursor-pointer" value="paid">Paid</SelectItem>
              <SelectItem className="cursor-pointer" value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Stats - Mobile Optimized Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{sellerOrders?.totalDocs || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {sellerOrders?.docs?.filter(o => o.status === "pending").length || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  {sellerOrders?.docs?.filter(o => o.status === "paid").length || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {sellerOrders?.docs?.filter(o => o.status === "delivered").length || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List - Mobile Optimized */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Your products haven't been ordered yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const product = order.product as any;
            const buyer = order.user as any;
            const createdAt = new Date(order.createdAt);
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-lg overflow-hidden bg-gray-100 border border-black mx-auto lg:mx-0">
                        {product?.image?.url ? (
                          <img
                            src={product.image.url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg leading-tight">{product?.name || "Unknown Product"}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-start lg:items-end space-y-2 mt-2 lg:mt-0">
                          <div className="text-lg font-semibold">
                            {formatCurrency(order.amount)}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <Badge variant="outline" className={getDeliveryStatusColor(order.deliveryStatus)}>
                              {order.deliveryStatus === "auto" ? "Instant" : 
                               order.deliveryStatus === "waiting" ? "Pending" : "Sent"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Buyer Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium">Buyer:</span>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span>{buyer?.name || buyer?.email || 'Unknown Buyer'}</span>
                          {buyer?.email && buyer?.name && (
                            <span className="text-gray-400 text-xs">({buyer.email})</span>
                          )}
                        </div>
                      </div>

                      {/* Transaction ID */}
                      {order.transactionId && (
                        <div className="text-sm text-muted-foreground">
                          <span>Transaction: </span>
                          <code className="bg-gray-100 px-1 rounded text-xs break-all">
                            {order.transactionId}
                          </code>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2">
                        {buyer?.id && (
                          <MessageOrderUserButton
                            orderId={order.id}
                            recipientId={buyer.id}
                            orderReference={`#${order.id.slice(-8).toUpperCase()}`}
                            buttonText="Message Buyer"
                            className="w-full sm:w-auto"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
