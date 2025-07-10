"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { generateTenantURL } from "@/lib/utils";
import { OptimizedImage } from "@/components/optimized-image";
import { memo, useMemo, Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/optimized-loading";

// Lazy load heavy components
const LazyTenantStats = lazy(() => Promise.resolve({ default: TenantStats }));

function TenantStats({ tenant }: { tenant: any }) {
  const trpc = useTRPC();
  
  // Always resolve tenantId to a string
  const tenantId = useMemo((): string | undefined => {
    if (typeof tenant === "string") {
      return tenant;
    } else if (typeof tenant.tenant === "string") {
      return tenant.tenant;
    } else if (tenant.tenant?.id) {
      return tenant.tenant.id;
    } else if (tenant.id) {
      return tenant.id;
    }
    return undefined;
  }, [tenant]);
  
  // Extract tenant name properly
  const tenantDisplayName = useMemo((): string => {
    // First, try to get the name from the tenant object
    if (typeof tenant === "object" && tenant.tenant?.name) {
      return tenant.tenant.name;
    }
    
    // If no name, try to generate a readable name from the slug (which is now just the username)
    if (typeof tenant === "object" && tenant.tenant?.slug) {
      return `${tenant.tenant.slug}'s Store`;
    }
    
    // Fallback to a generic name
    return "My Store";
  }, [tenant]);

  const { data: stats, isLoading } = useQuery({
    ...trpc.dashboard.salesAndEarnings.queryOptions({ tenantId: tenantId || '' }),
    enabled: !!tenantId,
  });
  
  if (!tenantId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{tenantDisplayName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading stats...</p>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold">{stats.sales ?? 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Sales</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">${Number(stats.earnings ?? 0).toFixed(2)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Earnings</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">${Number(stats.earningsMonth ?? 0).toFixed(2)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Month Earnings</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">${Number(stats.earningsWeek ?? 0).toFixed(2)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Week Earnings</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl font-bold text-green-600">${Number(stats.earningsDay ?? 0).toFixed(2)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Day Earnings</div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No stats available.</p>
        )}
        
        <Separator />
        
        {/* Products list for this tenant */}
        <ProductsList tenantId={tenantId} />
      </CardContent>
    </Card>
  );
}

// List products created by this tenant
const ProductsList = memo(function ProductsList({ tenantId }: { tenantId: string }) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.product.byTenant.queryOptions({ tenantId }));
  
  const productIds = useMemo(() => 
    Array.isArray(data) ? data.map((p: any) => p.id) : [], 
    [data]
  );
  
  const productStatsQueryOptions = trpc.dashboard.productStats.queryOptions({ productIds });
  const { data: salesStats = {} } = useQuery({
    ...productStatsQueryOptions,
    enabled: productIds.length > 0,
  });
  
  if (isLoading) return <p className="text-muted-foreground">Loading products...</p>;
  if (!Array.isArray(data) || !data.length) return <p className="text-muted-foreground">No products found for this store.</p>;
  
  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold">Products</h3>
      <div className="space-y-2 sm:space-y-3">
        {data.map((product: any) => {
          const stats = (salesStats && salesStats[product.id]) || { sales: 0 };
          // Get product image or fallback
          let imageUrl = "/placeholder.png";
          if (product.image && typeof product.image === "object" && product.image.url) {
            imageUrl = product.image.url;
          } else if (typeof product.image === "string") {
            imageUrl = product.image;
          }
          return (
            <Card key={product.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <OptimizedImage 
                      src={imageUrl} 
                      alt={product.name} 
                      width={48}
                      height={48}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border border-black flex-shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{product.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">${product.price}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <div className="text-xs sm:text-sm text-muted-foreground">Sales</div>
                      <div className="font-semibold text-sm sm:text-base">{stats.sales}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

export default function DashboardPage() {
  const trpc = useTRPC();
  const { data: session, isLoading: loadingSession } = useQuery(trpc.auth.session.queryOptions());

  if (loadingSession) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10">
        <div className="flex items-center justify-center min-h-[200px] sm:min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!session?.user?.tenants?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">No stores found</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            You need to create a store to start selling products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your sales, earnings, and product performance
          </p>
        </div>
        {session.user.tenants && session.user.tenants.length > 0 && (
          <div className="flex gap-2">
            {session.user.tenants.map((tenant: any) => {
              const tenantSlug = typeof tenant === "object" && tenant.tenant?.slug 
                ? tenant.tenant.slug 
                : typeof tenant === "string" 
                ? tenant 
                : null;
              
              if (!tenantSlug) return null;
              
              return (
                <Button 
                  key={tenantSlug}
                  variant="elevated" 
                  asChild
                >
                  <a
                    href={generateTenantURL(tenantSlug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Store className="h-4 w-4" />
                    Go to My Store
                  </a>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-6 sm:space-y-8">
        {session.user.tenants.map((tenant: any) => {
          // Always use a string for the key
          const tenantId = typeof tenant === "string"
            ? tenant
            : typeof tenant.tenant === "string"
              ? tenant.tenant
              : tenant.tenant?.id || tenant.id;
          return (
            tenantId ? (
              <TenantStats key={tenantId} tenant={tenant} />
            ) : null
          );
        })}
      </div>
    </div>
  );
}
