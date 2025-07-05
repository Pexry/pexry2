import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "../store/use-cart-store";

export const useGlobalCart = () => {
    const tenantCarts = useCartStore(useShallow((state) => state.tenantCarts));
    
    // Get tenant slugs that have products in cart
    const tenantsWithProducts = Object.entries(tenantCarts)
        .filter(([, cart]) => cart.productIds.length > 0)
        .map(([tenantSlug, cart]) => ({
            tenantSlug,
            productCount: cart.productIds.length,
            productIds: cart.productIds
        }));

    const totalCartsWithProducts = tenantsWithProducts.length;
    const totalItemsGlobal = tenantsWithProducts.reduce((sum, tenant) => sum + tenant.productCount, 0);

    return {
        tenantsWithProducts,
        totalCartsWithProducts,
        totalItemsGlobal,
        hasItemsInAnyCart: totalItemsGlobal > 0
    };
};
