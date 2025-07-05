import z from "zod";
import { TRPCError } from "@trpc/server";
import { Media, Tenant } from "@/payload-types";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";


export const tenantsRouter = createTRPCRouter({
    getOne: baseProcedure
    .input(
        z.object({
            slug: z.string(),
        }),
    )
    .query(async ({ ctx, input }) => {
        const tenantsData = await ctx.db.find({
        collection: 'tenants',
        depth: 2,
        where: {
            slug: {
                equals: input.slug,
            },
        },
        limit: 1,
        pagination: false,
    });     

    const tenant = tenantsData.docs[0];

    if(!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shop not found"});
    }

            return tenant as Tenant & { image: Media | null };
        }),
    update: baseProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1, 'Store name is required'),
          image: z.string().optional().nullable(), // media id
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Only allow update if user is superadmin or owner (enforced by access control)
        const updated = await ctx.db.update({
          collection: 'tenants',
          id: input.id,
          data: {
            name: input.name,
            image: input.image ?? null,
          },
        });
        return updated;
      }),
});
