"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { LoaderIcon, Plus, Copy, Store } from "lucide-react";
import { generateTenantURL } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { CardLoadingSkeleton } from "@/components/optimized-loading";
import { usePerformanceMonitor } from "@/lib/performance";
import { memo, useMemo } from "react";

// Memoized product card component for better performance
const ProductCard = memo(({ product }: { product: any }) => {
  const imageUrl = useMemo(() => {
    if (product.image && typeof product.image === "object" && product.image.url) {
      return product.image.url;
    } else if (typeof product.image === "string") {
      return product.image;
    }
    return "/placeholder.png";
  }, [product.image]);

  const copyProductLink = async () => {
    if (!product.tenant || !product.tenant.slug) {
      toast.error("Unable to copy link: Product tenant information is missing");
      return;
    }
    
    const productUrl = `${window.location.origin}${generateTenantURL(product.tenant.slug)}/products/${product.id}`;
    
    try {
      await navigator.clipboard.writeText(productUrl);
      toast.success("Product link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  return (
    <Card key={product.id}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-gray-100 border border-black flex-shrink-0">
              <Image
                src={imageUrl}
                alt={product.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                sizes="64px"
              />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg truncate">{product.name}</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600">${product.price}</p>
              {/* Category and Subcategory display */}
              <div className="flex flex-wrap gap-1 text-xs">
                {product.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800">
                    {typeof product.category === 'object' ? product.category.name : 'Category'}
                  </span>
                )}
                {product.subcategory && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800">
                    {typeof product.subcategory === 'object' ? product.subcategory.name : 'Subcategory'}
                  </span>
                )}
              </div>
              {product.description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <Button 
              variant="elevated" 
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
              onClick={copyProductLink}
            >
              <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Copy Link
            </Button>
            <Button variant="elevated" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
              <a href={`/admin/collections/products/${product.id}`}>
                Edit Product
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default function ProductsDashboardPage() {
  // Performance monitoring (non-visual)
  usePerformanceMonitor('ProductsDashboard');
  
  const trpc = useTRPC();
  const { data: products, isLoading, error } = useQuery(trpc.product.mine.queryOptions());

  const copyStoreLink = async (tenantSlug: string) => {
    const storeUrl = `${window.location.origin}${generateTenantURL(tenantSlug)}`;
    
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast.success("Store link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy store link to clipboard");
    }
  };

  // Memoize the first product's tenant for store link
  const firstProductTenant = useMemo(() => {
    if (products && products.length > 0 && products[0]?.tenant && 
        typeof products[0].tenant === 'object' && 'slug' in products[0].tenant) {
      return products[0].tenant.slug;
    }
    return null;
  }, [products]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10">
        <CardLoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading products: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Products</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and track your product listings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {firstProductTenant && (
            <Button 
              variant="elevated"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => copyStoreLink(firstProductTenant)}
            >
              <Store className="h-4 w-4 mr-2" />
              Copy Store Link
            </Button>
          )}
          <Button variant="elevated" size="sm" className="w-full sm:w-auto" asChild>
            <a
              href="/admin/collections/products/create"
              className="flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Product
            </a>
          </Button>
        </div>
      </div>

      {/* Products List */}
      {!products || !products.length ? (
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                <svg
                  className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium">No products found</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get started by creating your first product listing.
              </p>
              <Button variant="elevated" size="sm" className="w-full sm:w-auto" asChild>
                <a
                  href="/admin/collections/products/create"
                  className="flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Product
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
