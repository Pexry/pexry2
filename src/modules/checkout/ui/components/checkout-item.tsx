import Link from "next/link";
import { memo } from "react";
import { OptimizedImage } from "@/components/optimized-image";

import { cn, formatCurrency } from "@/lib/utils";

interface CheckoutItemProps {
    isLast?: boolean;
    imageUrl?: string | null;
    name: string;
    productUrl: string;
    tenantUrl: string;
    tenantName: string;
    price: number;
    onRemove: () => void;
}

const CheckoutItemComponent = ({
    isLast,
    imageUrl,
    name,
    productUrl,
    tenantUrl,
    tenantName,
    price,
    onRemove,
}: CheckoutItemProps) => {
    return (
        <div
         className={cn(
           "grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 border-b",
           isLast && "border-b-0",
         )}
        >
          <div className="overflow-hidden border-r ">
            <div className="relative aspect-square h-full">
              <OptimizedImage 
                src={imageUrl || "/placeholder.png"}
                alt={name}
                width={120}
                height={120}
                className="object-cover"
                sizes="120px"
              />    
            </div>  
          </div>  

          <div className="py-4 flex flex-col justify-between">
            <div>
              <Link href={productUrl}>
                <h4 className="font-bold underline">{name}</h4>
              </Link>
              <Link href={tenantUrl}>
                <p className="font-medium underline">{tenantName}</p>
              </Link>
            </div>
          </div>
          
          <div className=" py-4 flex flex-col justify-between">
            <p className="font-medium">
              {formatCurrency(price)}
            </p>
            <button className="underline font-medium cursor-pointer" onClick={onRemove} type="button">
              Remove
            </button>
          </div>
        
        </div>
    );
};

export const CheckoutItem = memo(CheckoutItemComponent);