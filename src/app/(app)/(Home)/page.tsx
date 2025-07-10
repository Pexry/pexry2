
import type { SearchParams } from "nuqs/server";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/constants";
import { getQueryClient, trpc } from "@/trpc/server";

import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";

interface Props {
    searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) =>{
    const filters = await loadProductFilters(searchParams)

    const queryClient = getQueryClient();
    
    // Prefetch product list
    const productsQuery = trpc.products.getMany.infiniteQueryOptions({
        ...filters,
        limit: DEFAULT_LIMIT,
    });
    
    void queryClient.prefetchInfiniteQuery(productsQuery);
    
    // Get the first page of products to prefetch their stats
    try {
        const firstPage = await queryClient.fetchInfiniteQuery(productsQuery);
        const firstPageProducts = firstPage.pages[0]?.docs || [];
        
        if (firstPageProducts.length > 0) {
            const productIds = firstPageProducts.map(p => p.id);
            void queryClient.prefetchQuery(
                trpc.products.getStats.queryOptions({ productIds })
            );
        }
    } catch (error) {
        // Silently fail if prefetching stats fails
        console.warn('Failed to prefetch product stats:', error);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductListView />
        </HydrationBoundary>
    );
};

export default Page;