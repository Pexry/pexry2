import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const Disputes: CollectionConfig = {
  slug: "disputes",
  admin: {
    useAsTitle: "subject",
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  access: {
    read: ({ req }) => {
      // Users can see disputes they are involved in
      if (req.user) {
        return true; // Simplified for now - can be refined later
      }
      return false;
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user?.roles?.includes("super-admin")),
  },
  fields: [
    {
      name: "order",
      type: "relationship",
      relationTo: "orders",
      required: true,
    },
    {
      name: "buyer",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "seller",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "subject",
      type: "text",
      required: true,
      maxLength: 200,
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: ["open", "in-progress", "resolved", "closed"],
      defaultValue: "open",
      required: true,
    },
    {
      name: "priority",
      type: "select",
      options: ["low", "medium", "high", "urgent"],
      defaultValue: "medium",
      required: true,
    },
    {
      name: "category",
      type: "select",
      options: [
        "product-not-received",
        "product-not-as-described",
        "refund-request",
        "delivery-issue",
        "payment-issue",
        "other",
      ],
      required: true,
    },
    {
      name: "evidence",
      type: "array",
      fields: [
        {
          name: "file",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "description",
          type: "text",
        },
      ],
    },
    {
      name: "messages",
      type: "array",
      fields: [
        {
          name: "author",
          type: "relationship",
          relationTo: "users",
          required: true,
        },
        {
          name: "message",
          type: "textarea",
          required: true,
        },
        {
          name: "timestamp",
          type: "date",
          defaultValue: () => new Date(),
          required: true,
        },
        {
          name: "isInternal",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Internal messages visible only to admin",
          },
        },
      ],
    },
    {
      name: "resolution",
      type: "textarea",
      admin: {
        condition: (data) => data.status === "resolved" || data.status === "closed",
      },
    },
    {
      name: "resolvedBy",
      type: "relationship",
      relationTo: "users",
      admin: {
        condition: (data) => data.status === "resolved" || data.status === "closed",
      },
    },
    {
      name: "resolvedAt",
      type: "date",
      admin: {
        condition: (data) => data.status === "resolved" || data.status === "closed",
      },
    },
    {
      name: "orderAmount",
      type: "number",
      required: true,
      admin: {
        description: "Order amount to be held during dispute",
        readOnly: true,
      },
    },
    {
      name: "holdAmount",
      type: "number",
      required: true,
      admin: {
        description: "Amount put on hold (90% of order amount)",
        readOnly: true,
      },
    },
    {
      name: "fundsReleased",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether funds have been released after dispute resolution",
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === "create") {
          data.createdAt = new Date();
        }
        if (data.status === "resolved" || data.status === "closed") {
          if (!data.resolvedAt) {
            data.resolvedAt = new Date();
          }
          // Auto-set resolvedBy to current user if not already set
          if (!data.resolvedBy && req.user) {
            data.resolvedBy = req.user.id;
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // Handle fund release when dispute status changes to resolved/closed
        if (operation === "update" && doc.status && previousDoc) {
          const statusChanged = doc.status !== previousDoc.status;
          const isResolutionStatus = doc.status === "resolved" || doc.status === "closed";
          
          if (statusChanged && isResolutionStatus && !doc.fundsReleased) {
            try {
              const holdAmount = doc.holdAmount || 0;
              const buyerId = typeof doc.buyer === "string" ? doc.buyer : doc.buyer?.id;
              const sellerId = typeof doc.seller === "string" ? doc.seller : doc.seller?.id;

              if (holdAmount > 0 && buyerId && sellerId) {
                // Get current user balances
                const seller = await req.payload.findByID({ collection: "users", id: sellerId });
                const buyer = await req.payload.findByID({ collection: "users", id: buyerId });

                const sellerOnHold = typeof seller.balanceOnHold === 'number' ? seller.balanceOnHold : 0;
                const sellerAvailable = typeof seller.availableForWithdrawal === 'number' ? seller.availableForWithdrawal : 0;
                const buyerAvailable = typeof buyer.availableForWithdrawal === 'number' ? buyer.availableForWithdrawal : 0;

                // Determine who gets the funds based on resolution
                // Default to seller favor for "resolved", check resolution text for "closed"
                const inFavorOfSeller = doc.status === "resolved" || 
                  (doc.resolution && doc.resolution.toLowerCase().includes("seller"));

                if (inFavorOfSeller) {
                  // Release funds back to seller's available balance
                  await req.payload.update({
                    collection: "users",
                    id: sellerId,
                    data: {
                      balanceOnHold: Math.max(0, sellerOnHold - holdAmount),
                      availableForWithdrawal: sellerAvailable + holdAmount,
                    },
                  });
                } else {
                  // Transfer funds to buyer's available balance
                  await req.payload.update({
                    collection: "users",
                    id: sellerId,
                    data: {
                      balanceOnHold: Math.max(0, sellerOnHold - holdAmount),
                    },
                  });

                  await req.payload.update({
                    collection: "users",
                    id: buyerId,
                    data: {
                      availableForWithdrawal: buyerAvailable + holdAmount,
                    },
                  });
                }

                // Mark funds as released using a separate API call to avoid write conflict
                // This completely avoids the MongoDB write conflict issue
                setImmediate(async () => {
                  try {
                    // Call our API endpoint to mark funds as released
                    const response = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/disputes/mark-funds-released`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ disputeId: doc.id }),
                    });

                    if (!response.ok) {
                      console.error(`API call failed to mark funds as released for dispute ${doc.id}:`, response.status);
                    }
                  } catch (error) {
                    console.error(`Error marking funds as released for dispute ${doc.id}:`, error);
                    // Don't throw here as the fund transfer was successful
                  }
                });
              }
            } catch (error) {
              console.error(`Error releasing funds for dispute ${doc.id}:`, error);
              console.error(`Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
              // Re-throw the error so it's visible to the admin
              throw new Error(`Failed to release funds: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      },
    ],
  },
};
