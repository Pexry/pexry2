"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, User, Calendar, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useTRPC } from "@/trpc/client";
import { MessageComposer } from "@/modules/disputes/ui/components/message-composer";

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800";
    case "in-progress":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "product-not-received":
      return "Product Not Received";
    case "product-not-as-described":
      return "Product Not As Described";
    case "refund-request":
      return "Refund Request";
    case "delivery-issue":
      return "Delivery Issue";
    case "payment-issue":
      return "Payment Issue";
    default:
      return "Other";
  }
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params.id as string;
  const trpc = useTRPC();

  const { data: dispute, isLoading, error, refetch } = useQuery({
    ...trpc.disputes.getById.queryOptions(disputeId),
    enabled: !!disputeId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Dispute Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The dispute you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => router.push("/dashboard/disputes")}>
                Back to Disputes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentUserId = "current-user-id"; // This should come from user context
  const buyerId = typeof dispute.buyer === "string" ? dispute.buyer : dispute.buyer?.id;
  const sellerId = typeof dispute.seller === "string" ? dispute.seller : dispute.seller?.id;
  const isBuyer = buyerId === currentUserId;
  const otherParty = isBuyer ? dispute.seller : dispute.buyer;
  const order = typeof dispute.order === "string" ? null : dispute.order;
  const product = order && typeof order.product === "object" ? order.product : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/disputes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Disputes
          </Button>
        </div>

        {/* Dispute Overview */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-xl">{dispute.subject}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Dispute #{dispute.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(dispute.status)}>
                  {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(dispute.priority)}>
                  {dispute.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Product Info */}
            {product && (
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-200 border border-black flex-shrink-0">
                  {product.image && typeof product.image === "object" && product.image.url ? (
                    <img
                      src={product.image.url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Order #{typeof dispute.order === 'string' ? dispute.order.slice(-8).toUpperCase() : dispute.order?.id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            )}

            {/* Dispute Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="font-medium">{getCategoryLabel(dispute.category)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{isBuyer ? "Seller:" : "Buyer:"}</span>
                  <span className="font-medium">
                    {typeof otherParty === "string" ? "Unknown" : otherParty?.username || "Unknown"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {dispute.resolvedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Resolved:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(dispute.resolvedAt), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{dispute.description}</p>
            </div>

            {/* Resolution */}
            {dispute.resolution && (
              <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">Resolution</h4>
                <p className="text-sm text-green-700">{dispute.resolution}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dispute.messages && dispute.messages.length > 0 ? (
              dispute.messages.map((message: any, index: number) => (
                <div key={index} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.author?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {message.author?.username || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No messages yet. Start the conversation!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Message Composer */}
        <MessageComposer 
          disputeId={disputeId}
          disabled={dispute.status === "closed"}
          onMessageSent={() => refetch()}
        />
      </div>
    </div>
  );
}
