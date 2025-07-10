"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { CheckIcon, LinkIcon, StarIcon } from "lucide-react";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StarRating } from "@/components/star-rating";
import { OptimizedImage } from "@/components/optimized-image";
import { formatCurrency, generateTenantURL } from "@/lib/utils";

const CartButton = dynamic(
  () => import("../components/cart-button").then(
    (mod) => mod.CartButton,
  ),

  {
    ssr: false,
    loading: () => <Button disabled className="flex-1 bg-teal-300">Add to cart</Button>
  },
);


interface ProductViewProps {
    productId: string;
    tenantSlug: string;
}

export const ProductView = ({ productId, tenantSlug }: ProductViewProps) => {
    const trpc= useTRPC();
    const { data } = useSuspenseQuery(trpc.products.getOne.queryOptions({id: productId}));

    // Fetch product stats for sales count
    const { data: productStats } = useQuery({
        ...trpc.products.getStats.queryOptions({ productIds: [productId] }),
    });

    const salesCount = productStats?.[productId]?.sales || 0;

    const [isCopied, setIsCopied] = useState(false);

    return (
        <div className="px-4 lg:px-12 py-10">
         <div className="border rounded-sm bg-white overflow-hidden">
            <div className="relative aspect-[3.9] border-b">
             <OptimizedImage 
              src={data.coverImage?.url || "/placeholder.png"}
              alt={data.name}
              width={800}
              height={205}
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
             />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-6">
             <div className="col-span-4">
              <div className="p-6">
               <h1 className="text-4xl font-medium">{data.name}</h1>
              </div>

              <div className="border-y flex">
               <div className="px-6 py-4 flex items-center justify-center border-r">
                <div className="px-2 py-1 border bg-teal-300 w-fit">
                 <p className="text-base font-medium">{formatCurrency(data.price)}</p>
                </div>
               </div>
               
               <div className="px-6 py-4 flex items-center justify-center lg:border-r">
                 <Link href={generateTenantURL(tenantSlug)} className="flex items-center gap-2">
                   {data.tenant.image?.url && (
                     <OptimizedImage 
                       src={data.tenant.image.url}
                       alt={data.tenant.name}
                       width={30}
                       height={30}
                       className="rounded-full border shrink-0 size-[30px]"
                     />
                   )}
                   <p className="text-base underline font-medium">
                    {data.tenant.name}
                   </p>
                 </Link>
               </div>

               <div className="hidden lg:flex px-6 py-4 items-center justify-center">
                <div className="flex items-center gap-2">
                 <StarRating 
                    rating={data.reviewRating}
                    iconclassName="size-4"
                 />   
                 <p className="text-base font-medium">
                   {data.reviewCount} ratings  
                 </p>
                 <span className="text-black">•</span>
                 <p className="text-base font-medium text-black">
                   {salesCount} sold
                 </p>  
                </div>
               </div>
              </div>
               <div className="block lg:hidden px-6 py-4 items-center justify-center border-b">
                <div className="flex items-center gap-2">
                <StarRating 
                  rating={data.reviewRating}
                  iconclassName="size-4"
                />
                <p className="text-base font-medium">
                 {data.reviewCount} ratings  
                </p>
                <span className="text-black">•</span>
                <p className="font-medium text-black">
                  {salesCount} sold
                </p>   
                </div>
               </div>

               <div className="p-6">
                {data.description ? (
                  <p>{data.description}</p>
                ) : (
                  <p className="font-medium text-muted-foreground italic">
                    No description Provided
                  </p>
                )}
               </div>
             </div>

             <div className="col-span-2">
              <div className="border-t lg:border-t-0 lg:border-l h-full">
               <div className="flex flex-col gap-4 p-6 border-b">
                <div className="flex flex-row items-center gap-2">
                 <CartButton 
                   productId={productId}
                   tenantSlug={tenantSlug}
                 /> 
                 <Button 
                  className="size-12"
                  variant="elevated"
                  onClick={() => {
                    setIsCopied(true);
                    navigator.clipboard.writeText(window.location.href)
                    toast.success("Link Copied to clipboard")
                    setTimeout(() =>{
                      setIsCopied(false);
                    }, 1000);
                  }}
                  disabled={isCopied}
                 >
                  {isCopied ? <CheckIcon /> : <LinkIcon /> }
                  
                 </Button>
                </div> 

                <p className="text-center font-medium">
                 {data.refundPolicy === "no-refunds"
                  ? "No refunds"
                  : `${data.refundPolicy} money back guarantee`
                 } 
                </p>
               </div>

               <div className="p-6">
                <div className="flex items-center justify-between">
                 <h3 className="text-xl font-medium">Ratings</h3>
                 <div className="flex items-center gap-x-1 font-medium">
                  <StarIcon className="size-4 fill-black"/>
                  <p>({data.reviewRating})</p>
                  <p className="text-base">{data.reviewCount} ratings</p>
                 </div>
                </div>
                <div
                 className="grid grid-cols-[auto_1fr_auto] gap-3 mt-4"
                >
                 {[5, 4, 3, 2, 1].map((stars) => (
                  <Fragment key={stars}>
                   <div className="font-medium">{stars} {stars === 1 ? "star" : "stars"}</div>
                   <Progress 
                    value={data.ratingDistribution[stars]}
                    className="h-[1lh]"
                   />
                   <div className="font-medium">
                    {data.ratingDistribution[stars]}%
                   </div>
                  </Fragment>
                 ))} 
                </div>
               </div> 
              </div>  
             </div>
            </div>
         </div>
        </div>
    );
};

export const ProductViewSkeleton = () => {
 return (
    <div className="px-4 lg:px-12 py-10">
         <div className="border rounded-sm bg-white overflow-hidden">
            <div className="relative aspect-[3.9] border-b">
             <OptimizedImage 
              src={"/placeholder.png"}
              alt="Placeholder"
              width={800}
              height={205}
              className="object-cover"
             />
            </div>
          </div>
    </div>  
  )     
}