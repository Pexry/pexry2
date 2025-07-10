import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import Link from "next/link";
import { ReactNode, useCallback } from "react";

interface PreloadableLinkProps {
  href: string;
  children: ReactNode;
  productId?: string;
  className?: string;
  prefetch?: boolean;
}

export function PreloadableLink({
  href,
  children,
  productId,
  className,
  prefetch = true,
  ...props
}: PreloadableLinkProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const handleMouseEnter = useCallback(() => {
    if (productId && !queryClient.getQueryData(['products', 'getOne', { id: productId }])) {
      // Preload product data on hover - using the correct procedure
      queryClient.prefetchQuery(
        trpc.products.getOne.queryOptions({ id: productId })
      );
      
      // Also preload product stats
      queryClient.prefetchQuery(
        trpc.products.getStats.queryOptions({ productIds: [productId] })
      );
    }
  }, [productId, queryClient, trpc]);

  return (
    <Link 
      href={href} 
      prefetch={prefetch}
      onMouseEnter={handleMouseEnter}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}
