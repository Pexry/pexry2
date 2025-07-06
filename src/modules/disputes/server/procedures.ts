import { z } from "zod";
import { createTRPCRouter, protectedPrecedure } from "@/trpc/init";
import { createNotificationService } from "@/lib/notifications";

export const disputesRouter = createTRPCRouter({
  // Get all disputes for the current user
  getMyDisputes: protectedPrecedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(1).default(1),
        status: z.enum(["open", "in-progress", "resolved", "closed"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, status } = input;
      const offset = (page - 1) * limit;

      const where: any = {
        or: [
          { buyer: { equals: ctx.session.user.id } },
          { seller: { equals: ctx.session.user.id } },
        ],
      };

      if (status) {
        where.status = { equals: status };
      }

      const disputes = await ctx.db.find({
        collection: "disputes",
        where,
        limit,
        sort: "-createdAt",
        depth: 2,
      });

      return {
        docs: disputes.docs,
        totalDocs: disputes.totalDocs,
        page,
        totalPages: disputes.totalPages,
        hasNextPage: disputes.hasNextPage,
        hasPrevPage: disputes.hasPrevPage,
      };
    }),

  // Get a specific dispute by ID
  getById: protectedPrecedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const dispute = await ctx.db.findByID({
        collection: "disputes",
        id: input,
        depth: 2,
      });

      if (!dispute) {
        throw new Error("Dispute not found");
      }

      // Check if user is involved in this dispute
      const buyerId = typeof dispute.buyer === "string" ? dispute.buyer : dispute.buyer?.id;
      const sellerId = typeof dispute.seller === "string" ? dispute.seller : dispute.seller?.id;

      if (buyerId !== ctx.session.user.id && sellerId !== ctx.session.user.id) {
        throw new Error("Not authorized to view this dispute");
      }

      return dispute;
    }),

  // Create a new dispute
  create: protectedPrecedure
    .input(
      z.object({
        orderId: z.string(),
        subject: z.string().min(5).max(200),
        description: z.string().min(10),
        category: z.enum([
          "product-not-received",
          "product-not-as-described",
          "refund-request",
          "delivery-issue",
          "payment-issue",
          "other",
        ]),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orderId, subject, description, category, priority } = input;

      // Get the order to find seller
      const order = await ctx.db.findByID({
        collection: "orders",
        id: orderId,
        depth: 1,
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Verify the user is the buyer of this order
      const orderUserId = typeof order.user === "string" ? order.user : order.user?.id;
      if (orderUserId !== ctx.session.user.id) {
        throw new Error("You can only create disputes for your own orders");
      }

      // Get the product to find seller
      const product = await ctx.db.findByID({
        collection: "products",
        id: typeof order.product === "string" ? order.product : order.product?.id,
        depth: 1,
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const sellerId = typeof product.vendor === "string" ? product.vendor : product.vendor?.id;

      if (!sellerId) {
        throw new Error("Product vendor not found");
      }

      // Check if a dispute already exists for this order
      const existingDispute = await ctx.db.find({
        collection: "disputes",
        where: {
          order: { equals: orderId },
        },
        limit: 1,
      });

      if (existingDispute.docs.length > 0) {
        throw new Error("A dispute already exists for this order");
      }

      // Create the dispute
      const dispute = await ctx.db.create({
        collection: "disputes",
        data: {
          order: orderId,
          buyer: ctx.session.user.id,
          seller: sellerId,
          subject,
          description,
          category,
          priority,
          status: "open",
          orderAmount: order.amount,
          holdAmount: order.amount * 0.9, // 90% of order amount
          fundsReleased: false,
          messages: [
            {
              author: ctx.session.user.id,
              message: description,
              timestamp: new Date().toISOString(),
              isInternal: false,
            },
          ],
        } as any,
      });

      // Move funds from available to hold for the seller
      const holdAmount = order.amount * 0.9;
      const seller = await ctx.db.findByID({
        collection: "users",
        id: sellerId,
      });

      const currentAvailable = typeof seller.availableForWithdrawal === 'number' ? seller.availableForWithdrawal : 0;
      const currentOnHold = typeof (seller as any).balanceOnHold === 'number' ? (seller as any).balanceOnHold : 0;

      // Only move funds if seller has sufficient available balance
      if (currentAvailable >= holdAmount) {
        await ctx.db.update({
          collection: "users",
          id: sellerId,
          data: {
            availableForWithdrawal: currentAvailable - holdAmount,
            balanceOnHold: currentOnHold + holdAmount,
          } as any,
        });
      }

      // Send notifications about the dispute
      try {
        const notificationService = createNotificationService(ctx.db);
        await notificationService.notifyDisputeOpened({
          sellerId,
          buyerId: ctx.session.user.id,
          disputeId: dispute.id,
          orderId,
          productName: (product as any).name || 'Product',
          disputeSubject: subject,
        });
      } catch (error) {
        console.error('Failed to send dispute notifications:', error);
      }

      return dispute;
    }),

  // Add a message to a dispute
  addMessage: protectedPrecedure
    .input(
      z.object({
        disputeId: z.string(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { disputeId, message } = input;

      // Get the dispute
      const dispute = await ctx.db.findByID({
        collection: "disputes",
        id: disputeId,
        depth: 1,
      });

      if (!dispute) {
        throw new Error("Dispute not found");
      }

      // Check if user is involved in this dispute
      const buyerId = typeof dispute.buyer === "string" ? dispute.buyer : dispute.buyer?.id;
      const sellerId = typeof dispute.seller === "string" ? dispute.seller : dispute.seller?.id;

      if (buyerId !== ctx.session.user.id && sellerId !== ctx.session.user.id) {
        throw new Error("Not authorized to add messages to this dispute");
      }

      // Add the message
      const newMessage = {
        author: ctx.session.user.id,
        message,
        timestamp: new Date().toISOString(),
        isInternal: false,
      };

      const updatedDispute = await ctx.db.update({
        collection: "disputes",
        id: disputeId,
        data: {
          messages: [...(dispute.messages || []), newMessage],
          status: dispute.status === "open" ? "in-progress" : dispute.status,
        },
      });

      return updatedDispute;
    }),

  // Update dispute status (admin only)
  updateStatus: protectedPrecedure
    .input(
      z.object({
        disputeId: z.string(),
        status: z.enum(["open", "in-progress", "resolved", "closed"]),
        resolution: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { disputeId, status, resolution } = input;

      // Check if user is admin
      if (!ctx.session.user.roles?.includes("super-admin")) {
        throw new Error("Only administrators can update dispute status");
      }

      // Get the dispute
      const dispute = await ctx.db.findByID({
        collection: "disputes",
        id: disputeId,
        depth: 1,
      });

      if (!dispute) {
        throw new Error("Dispute not found");
      }

      const updateData: any = { status };

      if (status === "resolved" || status === "closed") {
        updateData.resolution = resolution;
        updateData.resolvedBy = ctx.session.user.id;
        updateData.resolvedAt = new Date();
      }

      const updatedDispute = await ctx.db.update({
        collection: "disputes",
        id: disputeId,
        data: updateData,
      });

      // Handle fund release when dispute is resolved/closed
      if ((status === "resolved" || status === "closed") && !(dispute as any).fundsReleased) {
        console.log(`[Disputes TRPC] Processing fund release for dispute ${disputeId}, status: ${status}`);
        
        const holdAmount = (dispute as any).holdAmount || 0;
        const buyerId = typeof dispute.buyer === "string" ? dispute.buyer : dispute.buyer?.id;
        const sellerId = typeof dispute.seller === "string" ? dispute.seller : dispute.seller?.id;

        if (holdAmount > 0 && buyerId && sellerId) {
          try {
            // Get current user balances
            const seller = await ctx.db.findByID({ collection: "users", id: sellerId });
            const buyer = await ctx.db.findByID({ collection: "users", id: buyerId });

            const sellerOnHold = typeof (seller as any).balanceOnHold === 'number' ? (seller as any).balanceOnHold : 0;
            const sellerAvailable = typeof seller.availableForWithdrawal === 'number' ? seller.availableForWithdrawal : 0;
            const buyerAvailable = typeof buyer.availableForWithdrawal === 'number' ? buyer.availableForWithdrawal : 0;

            // Determine who gets the funds based on resolution
            // For now, we'll assume "resolved" means in favor of seller, "closed" could be either
            // In a real implementation, you might want an additional field to specify who wins
            const inFavorOfSeller = status === "resolved" || (resolution && resolution.toLowerCase().includes("seller"));

            console.log(`[Disputes TRPC] Releasing ${holdAmount} funds in favor of ${inFavorOfSeller ? 'seller' : 'buyer'}`);

            if (inFavorOfSeller) {
              // Release funds back to seller's available balance
              await ctx.db.update({
                collection: "users",
                id: sellerId,
                data: {
                  balanceOnHold: Math.max(0, sellerOnHold - holdAmount),
                  availableForWithdrawal: sellerAvailable + holdAmount,
                } as any,
              });
              console.log(`[Disputes TRPC] Funds released to seller. Available: ${sellerAvailable} -> ${sellerAvailable + holdAmount}, OnHold: ${sellerOnHold} -> ${Math.max(0, sellerOnHold - holdAmount)}`);
            } else {
              // Transfer funds to buyer's available balance
              await ctx.db.update({
                collection: "users",
                id: sellerId,
                data: {
                  balanceOnHold: Math.max(0, sellerOnHold - holdAmount),
                } as any,
              });

              await ctx.db.update({
                collection: "users",
                id: buyerId,
                data: {
                  availableForWithdrawal: buyerAvailable + holdAmount,
                } as any,
              });
              console.log(`[Disputes TRPC] Funds transferred to buyer. Buyer available: ${buyerAvailable} -> ${buyerAvailable + holdAmount}, Seller onHold: ${sellerOnHold} -> ${Math.max(0, sellerOnHold - holdAmount)}`);
            }

            // Mark funds as released
            await ctx.db.update({
              collection: "disputes",
              id: disputeId,
              data: {
                fundsReleased: true,
              } as any,
            });

            console.log(`[Disputes TRPC] Successfully processed fund release for dispute ${disputeId}`);

            // Send notifications about the dispute resolution
            try {
              const notificationService = createNotificationService(ctx.db);
              
              // Get the product info for the notification
              const order = await ctx.db.findByID({
                collection: "orders",
                id: typeof dispute.order === "string" ? dispute.order : dispute.order?.id,
                depth: 1,
              });
              
              let productName = 'Product';
              if (order && order.product) {
                const product = typeof order.product === 'string' 
                  ? await ctx.db.findByID({ collection: "products", id: order.product })
                  : order.product;
                productName = (product as any)?.name || 'Product';
              }

              await notificationService.notifyDisputeResolved({
                sellerId,
                buyerId,
                disputeId,
                resolution: resolution || 'Dispute resolved',
                inFavorOfSeller: !!inFavorOfSeller,
                orderAmount: holdAmount,
                productName,
              });
            } catch (error) {
              console.error('[Disputes TRPC] Failed to send dispute resolution notifications:', error);
            }
          } catch (error) {
            console.error(`[Disputes TRPC] Error releasing funds for dispute ${disputeId}:`, error);
            throw error; // Re-throw to ensure the transaction fails if fund release fails
          }
        } else {
          console.log(`[Disputes TRPC] Skipping fund release - insufficient data. holdAmount: ${holdAmount}, buyerId: ${buyerId}, sellerId: ${sellerId}`);
        }
      }

      return updatedDispute;
    }),
});
