import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { ProductDetailContent } from "./product-detail-content";


interface Props {
  searchParams: Promise<{ id?: string }>;
}

const ProductDetailPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const productId = params.id;

  if (!productId) {
    return <div>Missing product ID.</div>;
  }

  const queryClient = getQueryClient();
  
  // Prefetch product data on the server
  void queryClient.prefetchQuery(
    trpc.product.byId.queryOptions(productId)
  );
  
  // Prefetch product stats
  void queryClient.prefetchQuery(
    trpc.products.getStats.queryOptions({ productIds: [productId] })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading product...</div>}>
        <ProductDetailContent productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProductDetailPage;
