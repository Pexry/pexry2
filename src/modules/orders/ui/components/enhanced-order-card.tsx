"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Download, Eye, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/payload-types";
import { CreateDisputeDialog } from "@/modules/disputes/ui/components/create-dispute-dialog";
import { MessageOrderUserButton } from "@/components/message-order-user-button";
import { StarRating } from "@/components/star-rating";
import { StarPicker } from "@/components/star-picker";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

interface EnhancedOrderCardProps {
  order: Order & {
    product: any;
  };
}

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

export const EnhancedOrderCard = ({ order }: EnhancedOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewDescription, setReviewDescription] = useState("");
  const [isEditingReview, setIsEditingReview] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const product = order.product;
  const createdAt = new Date(order.createdAt);

  // Check if user has reviewed this product
  const { data: existingReview } = useQuery({
    ...trpc.reviews.getOne.queryOptions({ productId: product?.id }),
    enabled: !!product?.id && (order.status === "paid" || order.status === "delivered")
  });

  // Create review mutation
  const createReviewMutation = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: () => {
        toast.success("Review submitted successfully!");
        setIsReviewDialogOpen(false);
        setReviewDescription("");
        setReviewRating(5);
        queryClient.invalidateQueries({ queryKey: trpc.reviews.getOne.queryKey({ productId: product.id }) });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to submit review");
      }
    })
  );

  // Update review mutation
  const updateReviewMutation = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: () => {
        toast.success("Review updated successfully!");
        setIsReviewDialogOpen(false);
        setIsEditingReview(false);
        queryClient.invalidateQueries({ queryKey: trpc.reviews.getOne.queryKey({ productId: product.id }) });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update review");
      }
    })
  );

  const handleSubmitReview = () => {
    if (!reviewDescription.trim()) {
      toast.error("Please provide a review description");
      return;
    }

    if (existingReview && isEditingReview) {
      updateReviewMutation.mutate({
        reviewId: existingReview.id,
        rating: reviewRating,
        description: reviewDescription.trim()
      });
    } else {
      createReviewMutation.mutate({
        productId: product.id,
        rating: reviewRating,
        description: reviewDescription.trim()
      });
    }
  };

  const openReviewDialog = () => {
    if (existingReview) {
      setIsEditingReview(true);
      setReviewRating(existingReview.rating);
      setReviewDescription(existingReview.description);
    } else {
      setIsEditingReview(false);
      setReviewRating(5);
      setReviewDescription("");
    }
    setIsReviewDialogOpen(true);
  };

  const canReview = (order.status === "paid" || order.status === "delivered") && product?.id;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 lg:h-32 lg:w-32 rounded-lg overflow-hidden bg-gray-100 border border-black">
              {product?.image?.url ? (
                <img
                  src={product.image.url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{product?.name || "Unknown Product"}</h3>
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

            {/* Vendor Info */}
            {product?.tenant && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Sold by:</span>
                <span className="font-medium">{product.tenant.name}</span>
              </div>
            )}

            {/* Existing Review Display */}
            {existingReview && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Your Review:</span>
                  <StarRating rating={existingReview.rating} />
                </div>
                <p className="text-sm text-gray-700">{existingReview.description}</p>
              </div>
            )}

            {/* Transaction ID */}
            {order.transactionId && (
              <div className="text-sm text-muted-foreground">
                <span>Transaction: </span>
                <code className="bg-gray-100 px-1 rounded text-xs">
                  {order.transactionId}
                </code>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {/* Expand/Collapse Button */}
              <Button 
                variant="elevated" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {isExpanded ? "Hide Details" : "View Details"}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </Button>

              {order.status === "paid" || order.status === "delivered" ? (
                <>
                  {/* Review Button */}
                  {canReview && (
                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="elevated" size="sm" onClick={openReviewDialog}>
                          <Star className="h-4 w-4 mr-1" />
                          {existingReview ? "Edit Review" : "Write Review"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {existingReview ? "Edit Your Review" : "Write a Review"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Rating</Label>
                            <StarPicker
                              value={reviewRating}
                              onChange={setReviewRating}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="review-description">Review</Label>
                            <Textarea
                              id="review-description"
                              placeholder="Share your experience with this product..."
                              value={reviewDescription}
                              onChange={(e) => setReviewDescription(e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="elevated"
                              onClick={() => setIsReviewDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSubmitReview}
                              disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
                            >
                              {createReviewMutation.isPending || updateReviewMutation.isPending
                                ? "Submitting..." 
                                : existingReview ? "Update Review" : "Submit Review"
                              }
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {/* Message Seller Button */}
                  {product?.vendor && (
                    <MessageOrderUserButton
                      orderId={order.id}
                      recipientId={typeof product.vendor === 'string' ? product.vendor : product.vendor.id}
                      orderReference={`#${order.id.slice(-8).toUpperCase()}`}
                      buttonText="Message Seller"
                    />
                  )}
                  
                  <CreateDisputeDialog 
                    orderId={order.id} 
                    productName={product?.name}
                  >
                    <Button variant="elevated" size="sm">
                      Create Dispute
                    </Button>
                  </CreateDisputeDialog>
                </>
              ) : null}
              
              {order.status === "pending" && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Payment Pending
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Product Details */}
        {isExpanded && product && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Product Details</h4>
              
              {/* Product Description */}
              {product.description && (
                <div>
                  <h5 className="font-medium mb-2">Description</h5>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Category */}
              {product.category && (
                <div>
                  <h5 className="font-medium mb-2">Category</h5>
                  <Badge variant="secondary">
                    {typeof product.category === 'string' ? product.category : product.category.name}
                  </Badge>
                </div>
              )}

              {/* Product Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((tag: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {typeof tag === 'string' ? tag : tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Download/Access Section for Digital Products */}
              {(order.status === "paid" || order.status === "delivered") && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2 text-blue-900">Access Your Purchase</h5>
                  <p className="text-sm text-blue-700 mb-3">
                    Your purchase is ready! You can access your digital content.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" variant="elevated" size="sm" asChild>
                    <a href={`/library/${product.id}`} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" />
                      Access Product
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
