import React, { memo } from "react";
import {  StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { OptimizedImage } from "@/components/optimized-image";
import { PreloadableLink } from "@/components/preloadable-link";

import { formatCurrency, generateTenantURL } from "@/lib/utils";

interface ProductCardProps {
    id: string;
    name: string;
    imageUrl?: string | null;
    tenantSlug: string;
    tenantImageUrl?: string | null;
    reviewRating: number;
    reviewCount: number;
    price: number;
    salesCount?: number;
};

export const ProductCard = memo(function ProductCard({
    id,
    name,
    imageUrl,
    tenantSlug,
    tenantImageUrl,
    reviewRating,
    reviewCount,
    price,
    salesCount,
}: ProductCardProps) {
    const router = useRouter();

    const handleUserClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        router.push(generateTenantURL(tenantSlug));
    };

    return (
    <PreloadableLink 
        href={`${generateTenantURL(tenantSlug)}/products/${id}`} 
        productId={id}
        prefetch
    >
        <div className="hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow border rounded-md bg-white overflow-hidden h-full flex flex-col">
            <div className="aspect-square overflow-hidden relative">
                <OptimizedImage 
                    alt={name}
                    fill
                    src={imageUrl || "/placeholder.png"}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                />
            </div>
            <div className="p-4 border-y flex flex-col gap-3 flex-1">
                <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
                <div className="flex items-center gap-2" onClick={handleUserClick}>
                    {tenantImageUrl && (
                        <div className="relative size-[16px] shrink-0">
                            <OptimizedImage 
                                alt={tenantSlug}
                                src={tenantImageUrl}
                                fill
                                className="rounded-full border"
                            />
                        </div>
                    )}
                    <p className="text-sm underline font-medium">{tenantSlug}</p>
                </div>
                {reviewCount > 0 && (
                    <div className="flex items-center gap-1">
                        <StarIcon className="size-3.5 fill-black"/>
                        <p className="text-sm font-medium">
                            {reviewRating} ({reviewCount})
                        </p>
                    </div>
                )}
                {salesCount !== undefined && (
                    <div className="flex items-center gap-1">
                        <p className="text-sm text-black">
                            {salesCount} sold
                        </p>
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="relative px-2 py-1 border bg-teal-300 w-fit">
                    <p className="text-sm font-medium">
                        {formatCurrency(price)}
                    </p>
                </div>
            </div>
        </div>
    </PreloadableLink>
)
});

export const ProductCardSkeleton = () => {
    return (
        <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse"/>
    );
};

