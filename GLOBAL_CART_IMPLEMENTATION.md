# Global Cart Implementation

This implementation adds a global cart button to the navbar that shows all tenant carts containing products.

## Features

- **Global Cart Button**: Shows a cart icon with a badge displaying the total number of items across all tenant carts
- **Cart Dropdown**: When clicked, shows a dropdown with all tenant carts that have products
- **Per-Tenant Cart Items**: Each tenant cart shows the store name and number of items
- **Direct Checkout**: Click "Checkout" button to go directly to that tenant's checkout page
- **Responsive Design**: Works on both desktop and mobile

## Files Created/Modified

### New Files:
- `src/modules/checkout/hooks/use-global-cart.ts` - Hook to get global cart state
- `src/modules/checkout/ui/components/global-cart-button.tsx` - Main global cart button component

### Modified Files:
- `src/modules/home/ui/components/navbar.tsx` - Added global cart button to main navbar
- `src/modules/home/ui/components/navbar-sidebar.tsx` - Added global cart button to mobile sidebar

## How It Works

1. **Cart Storage**: Each tenant has its own cart stored in localStorage using Zustand
2. **Global View**: The `useGlobalCart()` hook aggregates all tenant carts and filters those with products
3. **Display**: The global cart button only appears when there are items in any cart
4. **Navigation**: Clicking checkout for a specific tenant navigates to that tenant's checkout page

## Usage

The global cart button will automatically appear in the navbar when:
- User is authenticated (`session.data?.user` exists)
- At least one tenant cart has products

## Technical Details

- Uses React Query for tenant data fetching
- Implements loading and error states for tenant information
- Gracefully handles unavailable stores
- Uses dynamic imports for client-side only components
- Implements proper TypeScript types throughout

## UI Components Used

- DropdownMenu (shadcn/ui)
- Badge (shadcn/ui) 
- Card (shadcn/ui)
- Button (shadcn/ui)
- Separator (shadcn/ui)

The implementation is fully responsive and follows the existing design patterns in the application.
