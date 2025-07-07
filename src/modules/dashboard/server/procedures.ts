import { z } from "zod";
import { createTRPCRouter, protectedPrecedure } from "@/trpc/init";

function isSameDay(date: Date, now: Date) {
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}
function isSameWeek(date: Date, now: Date) {
  // Week starts on Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}
function isSameMonth(date: Date, now: Date) {
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth();
}

export const dashboardRouter = createTRPCRouter({
  salesAndEarnings: protectedPrecedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const tenantId = input.tenantId;
        const products = await ctx.db.find({
          collection: "products",
          where: {
            "tenant.id": { equals: tenantId },
          },
          pagination: false,
        });
        const productIds = products?.docs?.map((p: any) => p.id) || [];
        if (productIds.length === 0) return {
          sales: 0, earnings: 0,
          salesDay: 0, earningsDay: 0,
          salesWeek: 0, earningsWeek: 0,
          salesMonth: 0, earningsMonth: 0
        };
        const orders = await ctx.db.find({
          collection: "orders",
          where: {
            product: { in: productIds },
            status: { equals: "paid" },
          },
          pagination: false,
        });
        const now = new Date();
        let sales = 0, earnings = 0;
        let salesDay = 0, earningsDay = 0;
        let salesWeek = 0, earningsWeek = 0;
        let salesMonth = 0, earningsMonth = 0;
        for (const order of orders?.docs || []) {
          // Use only order.amount for earnings (since order.total does not exist on type Order)
          const value = typeof order.amount === "number" ? order.amount : 0;
          const createdAt = order.createdAt ? new Date(order.createdAt) : null;
          sales++;
          earnings += value;
          if (createdAt) {
            if (isSameDay(createdAt, now)) {
              salesDay++;
              earningsDay += value;
            }
            if (isSameWeek(createdAt, now)) {
              salesWeek++;
              earningsWeek += value;
            }
            if (isSameMonth(createdAt, now)) {
              salesMonth++;
              earningsMonth += value;
            }
          }
        }
        return {
          sales,
          earnings: earnings * 0.9,
          salesDay,
          earningsDay: earningsDay * 0.9,
          salesWeek,
          earningsWeek: earningsWeek * 0.9,
          salesMonth,
          earningsMonth: earningsMonth * 0.9
        };
      } catch (err) {
        console.error("[dashboardRouter] Error in salesAndEarnings:", err);
        return {
          sales: 0, earnings: 0,
          salesDay: 0, earningsDay: 0,
          salesWeek: 0, earningsWeek: 0,
          salesMonth: 0, earningsMonth: 0
        };
      }
    }),
  productStats: protectedPrecedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      // For each product, count paid orders
      const stats: Record<string, { sales: number }> = {};
      for (const id of input.productIds) {
        stats[id] = { sales: 0 };
      }
      // Get all paid orders for these products
      const orders = await ctx.db.find({
        collection: "orders",
        where: {
          product: { in: input.productIds },
          status: { equals: "paid" },
        },
        pagination: false,
      });
      for (const order of orders?.docs || []) {
        let productId = typeof order.product === 'string' ? order.product : order.product?.id;
        if (productId && stats[productId]) {
          stats[productId].sales++;
        }
      }
      return stats;
    }),
});
