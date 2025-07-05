import type { CollectionConfig } from "payload";
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
};
