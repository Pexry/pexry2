import z from "zod";

import { createTRPCRouter, protectedPrecedure } from "@/trpc/init";

export const productRouter = createTRPCRouter({
  // get vendor’s own products
mine: protectedPrecedure.query(async ({ ctx }) => {
    return ctx.db.find({
      collection: "products",
      depth: 2,
      where: {
        vendor: { equals: ctx.session.user.id }, // only their products
      },
      sort: "-createdAt",
      limit: 100,
    }).then(res => res.docs);
  }),
  byId: protectedPrecedure
  .input(z.string())
  .query(async ({ input, ctx }) => {
    return ctx.db.findByID({ collection: "products", id: input, depth: 1 });
  }),

update: protectedPrecedure
  .input(z.object({
    id: z.string(),
    data: z.any(), // or use schema
  }))
  .mutation(async ({ input, ctx }) => {
    return ctx.db.update({
      collection: "products",
      id: input.id,
      data: input.data,
    });
  }),
create: protectedPrecedure
  .input(z.object({ data: z.any() })) // use schema if needed
  .mutation(async ({ input, ctx }) => {
    return ctx.db.create({
      collection: "products",
      data: input.data,
    });
  }),
  byTenant: protectedPrecedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input, ctx }) => {
      const products = await ctx.db.find({
        collection: "products",
        where: { "tenant.id": { equals: input.tenantId } },
        sort: "-createdAt",
        limit: 100,
      });
      return products.docs;
    }),

});
