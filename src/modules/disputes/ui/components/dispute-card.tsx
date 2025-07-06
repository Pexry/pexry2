"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispute } from "@/payload-types";

interface DisputeCardProps {
  dispute: Dispute & {
    order: any;
    buyer: any;
    seller: any;
  };
  currentUserId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "in-progress":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "resolved":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "closed":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
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

export const DisputeCard = ({ dispute, currentUserId }: DisputeCardProps) => {
  const createdAt = new Date(dispute.createdAt);
  const isBuyer = dispute.buyer?.id === currentUserId;
  const otherParty = isBuyer ? dispute.seller : dispute.buyer;
  const product = dispute.order?.product;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">{dispute.subject}</CardTitle>
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
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              {product.image?.url ? (
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
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                Order #{dispute.order?.id?.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
        )}

        {/* Dispute Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{getCategoryLabel(dispute.category)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{isBuyer ? "Seller:" : "Buyer:"}</span>
            <span className="font-medium">{otherParty?.username || "Unknown"}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>

          {dispute.messages && dispute.messages.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Messages:</span>
              <span className="font-medium">{dispute.messages.length}</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        <div className="border-t pt-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {dispute.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" asChild>
            <Link href={`/dashboard/disputes/${dispute.id}`}>
              View Details
            </Link>
          </Button>
          
          {dispute.status === "open" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/disputes/${dispute.id}#reply`}>
                Reply
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
