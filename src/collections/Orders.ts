import type { CollectionConfig } from "payload";
import { createNotificationService } from "@/lib/notifications";
import { isSuperAdmin } from "@/lib/access";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "id",
    //hidden: ({ user }) => !isSuperAdmin(user),
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: ["pending", "paid", "delivered"],
      defaultValue: "pending",
      required: true,
    },
    {
      name: "amount",
      type: "number",
      required: true,
      admin: {
        description: "Price paid in USD",
      },
    },
    {
      name: "walletAddress",
      type: "text",
      admin: {
        description: "TRC20 / BNB address (for crypto payments)",
      },
    },
    {
      name: "transactionId",
      type: "text",
      admin: {
        description: "Used to confirm external (crypto) payment",
      },
    },
    {
      name: "stripeCheckoutSessionId",
      type: "text",
      admin: {
        description: "Used for testing Stripe flow",
      },
    },
    {
      name: "deliveryStatus",
      type: "select",
      options: ["auto", "waiting", "sent"],
      defaultValue: "auto",
      required: true,
      admin: {
        description: "Delivery status: all deliveries are automatic",
      },
    },
    {
      name: "nowPaymentsPaymentId",
      label: "NowPayments Payment ID",
      type: "text",
      required: false,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // Only run on update, and only if status changed to 'paid'
        if (operation === 'update' && previousDoc?.status !== 'paid' && doc.status === 'paid') {
          // Get product to find vendor
          const productId = typeof doc.product === 'string' ? doc.product : doc.product?.id;
          if (!productId) return;
          const product = await req.payload.findByID({ collection: 'products', id: productId });
          const vendorId = typeof product.vendor === 'string' ? product.vendor : product.vendor?.id;
          if (!vendorId) return;
          
          // Increment vendor's availableForWithdrawal by 90% of order amount
          const increment = typeof doc.amount === 'number' ? doc.amount * 0.9 : 0;
          if (increment > 0) {
            const vendor = await req.payload.findByID({ collection: 'users', id: vendorId });
            const current = typeof vendor.availableForWithdrawal === 'number' ? vendor.availableForWithdrawal : 0;
            await req.payload.update({
              collection: 'users',
              id: vendorId,
              data: { availableForWithdrawal: current + increment },
            });
          }

          // Send notification to seller about the sale
          try {
            const notificationService = createNotificationService(req.payload);
            const buyerId = typeof doc.user === 'string' ? doc.user : doc.user?.id;
            let buyerName = '';
            
            if (buyerId) {
              try {
                const buyer = await req.payload.findByID({ collection: 'users', id: buyerId });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                buyerName = (buyer as any).username || buyer.email || '';
              } catch (error) {
                console.error('Failed to fetch buyer info for notification:', error);
              }
            }

            await notificationService.notifySale({
              sellerId: vendorId,
              orderAmount: typeof doc.amount === 'number' ? doc.amount : 0,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              productName: (product as any).name || 'Product',
              orderId: doc.id,
              buyerName,
            });
          } catch (error) {
            console.error('Failed to send sale notification:', error);
          }
        }
      },
    ],
  },
};
