import z from "zod";
import { TRPCError } from "@trpc/server";

import { DEFAULT_LIMIT } from "@/constants";
import { Media, Tenant, Order } from "@/payload-types";
import { createTRPCRouter, protectedPrecedure } from "@/trpc/init";

export const ordersRouter = createTRPCRouter({
  // Get user's orders with product details
  getMyOrders: protectedPrecedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        status: z.enum(["pending", "paid", "delivered"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Build where clause
      const where: any = {
        user: {
          equals: ctx.session.user.id,
        },
      };

      if (input.status) {
        where.status = {
          equals: input.status,
        };
      }

      const ordersData = await ctx.db.find({
        collection: "orders",
        depth: 2,
        page: input.cursor,
        limit: input.limit,
        where,
        sort: "-createdAt",
      });

      // Transform data to include proper types
      const transformedOrders = ordersData.docs.map((order) => ({
        ...order,
        product: {
          ...(order.product as any),
          image: (order.product as any)?.image as Media | null,
          tenant: (order.product as any)?.tenant as Tenant & { image: Media | null },
        },
      }));

      return {
        docs: transformedOrders,
        totalDocs: ordersData.totalDocs,
        totalPages: ordersData.totalPages,
        page: ordersData.page,
        pagingCounter: ordersData.pagingCounter,
        hasPrevPage: ordersData.hasPrevPage,
        hasNextPage: ordersData.hasNextPage,
        prevPage: ordersData.prevPage,
        nextPage: ordersData.nextPage,
      };
    }),

  // Get single order details
  getOrderById: protectedPrecedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.findByID({
        collection: "orders",
        id: input.orderId,
        depth: 2,
      });

      // Check if order belongs to the user
      if (typeof order.user === "string" ? order.user : order.user.id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own orders",
        });
      }

      return {
        ...order,
        product: {
          ...(order.product as any),
          image: (order.product as any)?.image as Media | null,
          tenant: (order.product as any)?.tenant as Tenant & { image: Media | null },
        },
      };
    }),

  // Get order statistics
  getOrderStats: protectedPrecedure.query(async ({ ctx }) => {
    const allOrders = await ctx.db.find({
      collection: "orders",
      where: {
        user: {
          equals: ctx.session.user.id,
        },
      },
      pagination: false,
    });

    const stats = {
      total: allOrders.totalDocs,
      pending: 0,
      paid: 0,
      delivered: 0,
      totalSpent: 0,
    };

    allOrders.docs.forEach((order: any) => {
      stats[order.status as keyof typeof stats]++;
      if (order.status === "paid" || order.status === "delivered") {
        stats.totalSpent += order.amount || 0;
      }
    });

    return stats;
  }),

  // Get seller's orders (orders of products they sell)
  getMySellerOrders: protectedPrecedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        status: z.enum(["pending", "paid", "delivered"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First, get all products by the current user (seller)
      const sellerProducts = await ctx.db.find({
        collection: "products",
        where: {
          vendor: {
            equals: ctx.session.user.id,
          },
        },
        pagination: false,
      });

      const productIds = sellerProducts.docs.map((product) => product.id);

      if (productIds.length === 0) {
        return {
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page: 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        };
      }

      // Build where clause for orders
      const where: any = {
        product: {
          in: productIds,
        },
      };

      if (input.status) {
        where.status = {
          equals: input.status,
        };
      }

      const ordersData = await ctx.db.find({
        collection: "orders",
        depth: 3, // Include user details for the buyer
        page: input.cursor,
        limit: input.limit,
        where,
        sort: "-createdAt",
      });

      // Transform data to include proper types
      const transformedOrders = ordersData.docs.map((order) => ({
        ...order,
        product: {
          ...(order.product as any),
          image: (order.product as any)?.image as Media | null,
          tenant: (order.product as any)?.tenant as Tenant & { image: Media | null },
        },
        user: order.user, // This will include buyer information
      }));

      return {
        docs: transformedOrders,
        totalDocs: ordersData.totalDocs,
        totalPages: ordersData.totalPages,
        page: ordersData.page,
        pagingCounter: ordersData.pagingCounter,
        hasPrevPage: ordersData.hasPrevPage,
        hasNextPage: ordersData.hasNextPage,
        prevPage: ordersData.prevPage,
        nextPage: ordersData.nextPage,
      };
    }),
});
