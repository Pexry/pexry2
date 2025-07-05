"use client";

import { useState } from "react";
import { ShoppingCartIcon, Store, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/trpc/client";
import { generateTenantURL } from "@/lib/utils";
import { useGlobalCart } from "../../hooks/use-global-cart";

export const GlobalCartButton = () => {
    const { tenantsWithProducts, totalItemsGlobal, hasItemsInAnyCart } = useGlobalCart();
    const [isOpen, setIsOpen] = useState(false);

    if (!hasItemsInAnyCart) {
        return null; // Don't show button if no items in any cart
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="elevated"
                    size="default"
                    className="relative bg-white border-black hover:bg-gray-50"
                >
                    <ShoppingCartIcon className="h-4 w-4" />
                    {totalItemsGlobal > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {totalItemsGlobal > 99 ? "99+" : totalItemsGlobal}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
                align="end" 
                className="w-80 p-0"
                side="bottom"
                sideOffset={8}
            >
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Your Carts</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {tenantsWithProducts.length} store{tenantsWithProducts.length !== 1 ? 's' : ''} • {totalItemsGlobal} item{totalItemsGlobal !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {tenantsWithProducts.map(({ tenantSlug, productCount }, index) => (
                        <TenantCartItem
                            key={tenantSlug}
                            tenantSlug={tenantSlug}
                            productCount={productCount}
                            onCheckout={() => setIsOpen(false)}
                            showSeparator={index < tenantsWithProducts.length - 1}
                        />
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

interface TenantCartItemProps {
    tenantSlug: string;
    productCount: number;
    onCheckout: () => void;
    showSeparator: boolean;
}

const TenantCartItem = ({ tenantSlug, productCount, onCheckout, showSeparator }: TenantCartItemProps) => {
    const trpc = useTRPC();
    
    // Use regular query instead of suspense query to handle errors gracefully
    const { data: tenant, isLoading, error } = useQuery(
        trpc.tenants.getOne.queryOptions({ slug: tenantSlug })
    );

    const handleCheckout = () => {
        onCheckout();
        window.location.href = `${generateTenantURL(tenantSlug)}/checkout`;
    };

    if (isLoading) {
        return (
            <>
                <Card className="border-0 shadow-none">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                                <div>
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mt-1"></div>
                                </div>
                            </div>
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </CardContent>
                </Card>
                {showSeparator && <Separator />}
            </>
        );
    }

    if (error || !tenant) {
        return (
            <>
                <Card className="border-0 shadow-none">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                    <Store className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-red-600">Store unavailable</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {productCount} item{productCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="text-gray-400"
                            >
                                Unavailable
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                {showSeparator && <Separator />}
            </>
        );
    }

    return (
        <>
            <Card className="border-0 shadow-none">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                                <Store className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">{tenant.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {productCount} item{productCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleCheckout}
                            className="bg-black text-white hover:bg-gray-800"
                        >
                            Checkout
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {showSeparator && <Separator />}
        </>
    );
};
