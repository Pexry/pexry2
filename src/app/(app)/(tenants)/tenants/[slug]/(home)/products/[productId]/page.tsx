import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";

import { ProductView, ProductViewSkeleton } from "@/modules/products/ui/views/product-view";

interface Props {
    params: Promise<{ productId: string; slug: string }>;
};

const Page = async ({ params }: Props) => {
    const { productId, slug } = await params;

    const queryClient = getQueryClient();
    
    // Prefetch tenant data
    void queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({
        slug
    }));
    
    // Prefetch product data for faster loading - using the correct procedure that ProductView expects
    void queryClient.prefetchQuery(
        trpc.products.getOne.queryOptions({ id: productId })
    );
    
    // Prefetch product stats
    void queryClient.prefetchQuery(
        trpc.products.getStats.queryOptions({ productIds: [productId] })
    );

    return(
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<ProductViewSkeleton/>}>
                <ProductView productId={productId} tenantSlug={slug}/>
            </Suspense>
        </HydrationBoundary>
    );
}

export default Page;