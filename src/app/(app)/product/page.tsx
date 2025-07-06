"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { MessageSellerButton } from "@/components/message-seller-button";
import Image from "next/image";

function ProductContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const trpc = useTRPC();

  const { data: product, isLoading, error } = useQuery(
    trpc.product.byId.queryOptions(productId ?? "")
  );

  // Fetch product stats for sales count
  const { data: productStats } = useQuery({
    ...trpc.products.getStats.queryOptions({ productIds: productId ? [productId] : [] }),
    enabled: !!productId,
  });

  if (!productId) return <div>Missing product ID.</div>;
  if (isLoading) return <div>Loading...</div>;
  if (error || !product) return <div>Product not found.</div>;

  let imageUrl = "/placeholder.png";
  if (product.image && typeof product.image === "object" && product.image.url) {
    imageUrl = product.image.url;
  } else if (typeof product.image === "string") {
    imageUrl = product.image;
  }

  // Get seller ID from product vendor field
  const sellerId = typeof product.vendor === 'string' ? product.vendor : product.vendor?.id;
  const salesCount = productStats?.[productId]?.sales || 0;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Image 
        src={imageUrl} 
        alt={product.name} 
        width={600}
        height={256}
        className="w-full h-64 object-cover rounded mb-4" 
        placeholder="empty"
      />
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="mb-2 text-gray-700">{product.description}</p>
      <div className="mb-2 text-lg font-semibold text-green-700">${product.price}</div>
      <div className="mb-4 text-sm text-gray-600">{salesCount} sold</div>
      
      {sellerId && (
        <div className="flex gap-2">
          <MessageSellerButton
            productId={product.id}
            sellerId={sellerId}
            productName={product.name}
            className="flex-1"
          />
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div>Loading product...</div>}>
      <ProductContent />
    </Suspense>
  );
}
