"use client";

import { InboxIcon } from "lucide-react";
import { useSuspenseInfiniteQuery, useQuery } from "@tanstack/react-query";
import { memo, useMemo } from "react";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { Button } from "@/components/ui/button";

import { ProductCard, ProductCardSkeleton } from "./product-card";
import { useProductFilters } from "../../hooks/use-product-filters";

interface Props {
    category?: string;
    tenantSlug?: string;
    narrowView?: boolean;
};

export const ProductList = ({ category, tenantSlug, narrowView }: Props) => {

    const [filters] = useProductFilters();

    const trpc = useTRPC();
    const { data, 
            hasNextPage, 
            isFetchingNextPage, 
            fetchNextPage 
          } = useSuspenseInfiniteQuery(trpc.products.getMany.infiniteQueryOptions(
        {
            ...filters,
            category,
            tenantSlug,
            limit: DEFAULT_LIMIT,
        },
        {
            getNextPageParam: (lastPage) => {
                return lastPage.docs.length >0 ? lastPage.nextPage: undefined;

            },
        }
    ));

    // Get all product IDs from all pages for stats
    const allProducts = useMemo(() => 
        data?.pages.flatMap((page) => page.docs) || [], 
        [data?.pages]
    );
    
    const productIds = useMemo(() => 
        allProducts.map((product) => product.id), 
        [allProducts]
    );

    // Fetch product stats
    const { data: productStats } = useQuery({
        ...trpc.products.getStats.queryOptions({ productIds }),
        enabled: productIds.length > 0,
    });

    if (data.pages?.[0]?.docs.length === 0) {
        return (
            <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
                <InboxIcon />
                <p className="text-base font-medium">No products found</p>
            </div>
        )
    }

    return(
        <>
        <div className={cn(
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
                narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
            )}>
            {data?.pages.flatMap((page) => page.docs).map((product) => (
                <ProductCard 
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    imageUrl={product.image?.url}
                    tenantSlug={product.tenant?.slug}
                    tenantImageUrl={product.tenant?.image?.url}
                    reviewRating={Number(product.reviewRating?.toFixed(2))}
                    reviewCount={product.reviewCount}
                    price={product.price}
                    salesCount={productStats?.[product.id]?.sales}
                />
            ))}
        </div>
        <div className="flex justify-center pt-8">
            {hasNextPage && (
                <Button
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    className="font-medium disabled:opacity-50 text-base bg-white"
                    variant="elevated"
                >
                    Load more
                </Button>
            )}
        </div>
        </>
    );
};

export const ProductListSkeleton = memo(function ProductListSkeleton({ narrowView }: Props) {
    const skeletonItems = useMemo(() => 
        Array.from({ length: DEFAULT_LIMIT }, (_, index) => (
            <ProductCardSkeleton key={index}/>
        )), 
        []
    );

    return (
        <div className={cn(
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
                narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
            )}>
            {skeletonItems}
        </div>
    );
});