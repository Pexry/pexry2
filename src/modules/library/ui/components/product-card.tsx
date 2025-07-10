import React, { memo } from "react";
import Link from "next/link";
import {  StarIcon } from "lucide-react";
import { OptimizedImage } from "@/components/optimized-image";

interface ProductCardProps {
    id: string;
    name: string;
    imageUrl?: string | null;
    tenantSlug: string;
    tenantImageUrl?: string | null;
    reviewRating: number;
    reviewCount: number;
};

const ProductCardComponent = ({
    id,
    name,
    imageUrl,
    tenantSlug,
    tenantImageUrl,
    reviewRating,
    reviewCount,
}: ProductCardProps) => {

    return (
    <Link prefetch href={`/library/${id}`}>
        <div className="hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow border rounded-md bg-white overflow-hidden h-full flex flex-col">
            <div className="relative aspect-square">
                <OptimizedImage 
                    alt={name}
                    src={imageUrl || "/placeholder.png"}
                    className="object-cover"
                    width={400}
                    height={400}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <div className="p-4 border-y flex flex-col gap-3 flex-1">
                <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
                <div className="flex items-center gap-2">
                    {tenantImageUrl && (
                        <OptimizedImage 
                            alt={tenantSlug}
                            src={tenantImageUrl}
                            width={16}
                            height={16}
                            className="rounded-full border shrink-0 size-[16px]"
                        />
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
            </div>
        </div>
    </Link>
)
};

export const ProductCard = memo(ProductCardComponent);

export const ProductCardSkeleton = () => {
    return (
        <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse"/>
    );
};

