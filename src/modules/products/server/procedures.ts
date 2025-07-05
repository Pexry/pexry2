import z from "zod";
import { TRPCError } from "@trpc/server";
import type { Sort, Where } from "payload";

import { DEFAULT_LIMIT } from "@/constants";
import { Category, Media, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { sortValues } from "../search-params";

export const productsRouter = createTRPCRouter({
    getOne: baseProcedure
    .input(
        z.object({
            id: z.string(),
        })
    )
    .query(async({ ctx, input }) => {

        const product = await ctx.db.findByID({
            collection: "products",
            id: input.id,
            depth: 2,
            select: {
                deliveryText: false,
            }
        });

        if (product.isArchived) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Product not found",
            })
        }

        const reviews = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            where: {
                product: {
                    equals: input.id,
                },
            },
        });

        const reviewRating = 
            reviews.docs.length > 0
            ? Number((reviews.docs.reduce((acc, review) => acc + review.rating, 0) / reviews.totalDocs).toFixed(2))
            : 0;


        const ratingDistribution: Record<number, number> ={
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          };

        if (reviews.totalDocs > 0) {
            reviews.docs.forEach((review) => {
                const rating = review.rating;

                if (rating >= 1 && rating <= 5) {
                    ratingDistribution[rating] = (ratingDistribution[rating] || 0) +1;
                }
            });

            Object.keys(ratingDistribution).forEach((key) => {
                const rating = Number(key);
                const count = ratingDistribution[rating] || 0;
                ratingDistribution[rating] = Math.round(
                    (count / reviews.totalDocs) * 100
                );
            });
        }

        return {
            ...product,
            image: product.image as Media | null,
            tenant: product.tenant as Tenant & { image: Media | null },
            reviewRating,
            reviewCount: reviews.totalDocs,
            ratingDistribution,
        }
    }),
    getMany: baseProcedure
    .input(
        z.object({
            cursor: z.number().default(1),
            limit: z.number().default(DEFAULT_LIMIT),
            category: z.string().nullable().optional(),
            minPrice: z.string().nullable().optional(),
            maxPrice: z.string().nullable().optional(),
            tags: z.array(z.string()).nullable().optional(),
            sort: z.enum(sortValues).nullable().optional(),
            tenantSlug: z.string().nullable().optional(),
            userId: z.string().nullable().optional(), // <-- add this
        }),
    )
    .query(async ({ ctx, input }) => {
        const where: Where = {
            isArchived: {
                not_equals: true,
            },
        };
        let sort : Sort = "-createdAt";

        if (input.sort === "suggested"){
            sort = "-createdAt";
        }
        
        if (input.sort === "trending"){
            sort = "+createdAt";
        }

        if (input.sort === "hot_and_new"){
            sort = "name";
        }

        if (input.minPrice && input.maxPrice) {
            where.price = {
                greater_than_equal: input.minPrice,
                less_than_equal: input.maxPrice,
            }
        } else if (input.minPrice){
            where.price = {
                greater_than_equal: input.minPrice,
            }
        }else if (input.maxPrice) {
            where.price = {
                less_than_equal: input.maxPrice
            }
        }

        if (input.tenantSlug) {
            where["tenant.slug"] = {
                equals: input.tenantSlug,
            }
        }
         
        if (input.category) {
            const categoriesData = await ctx.db.find({
                collection: "categories",
                limit: 1,
                depth: 1,
                pagination: false,
                where: {
                    slug: {
                        equals: input.category, 
                    }
                }
            });

            const formattedData = categoriesData.docs.map((doc) => ({
                ...doc,
                subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
                ...(doc as Category),
                subcategories: undefined, 
                    }))
                }));

            const subcategoriesSlugs = [];
            const category = formattedData[0];
            
            if (category) {
                // Check if this is a main category (has subcategories)
                if (category.subcategories && category.subcategories.length > 0) {
                    // This is a main category, include it and all its subcategories
                    subcategoriesSlugs.push(
                        ...category.subcategories.map((subcategory) => subcategory.slug)
                    );
                    where["category.slug"] = {
                       in: [category.slug, ...subcategoriesSlugs]
                    };
                } else {
                    // This might be a subcategory, check if it has a parent
                    if (category.parent) {
                        // This is a subcategory, filter by both main category and subcategory
                        const parentId = typeof category.parent === 'object' ? category.parent.id : category.parent;
                        where.and = [
                            { "category.id": { equals: parentId } },
                            { "subcategory.id": { equals: category.id } }
                        ];
                    } else {
                        // This is a main category without subcategories
                        where["category.slug"] = {
                           equals: category.slug
                        };
                    }
                }
            }
        }

        if (input.tags && input.tags.length > 0) {
            where["tags.name"] = {
                in: input.tags,
            };
        }

        if (input.userId) {
            where.user = { equals: input.userId };
        }

        const data = await ctx.db.find({
        collection: "products",
        depth: 2, // Populate "category", "image", "tenant", "tenant.image"
        where,
        sort,
        page:input.cursor,
        limit: input.limit,
        select: {
            deliveryText: false,
        }
    });    
    
    const dataWithSummarizedReviews = await Promise.all(
        data.docs.map(async (doc) => {
            const reviewsData = await ctx.db.find({
                collection: "reviews",
                pagination: false,
                where: {
                    product: {
                        equals: doc.id,
                    },
                },
            });
            return {
                ...doc,
                reviewCount: reviewsData.totalDocs,
                reviewRating: 
                    reviewsData.docs.length === 0
                        ? 0
                        : Number((reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) / reviewsData.totalDocs).toFixed(2)),
            }
        })
    );

            return {
                ...data,
                docs: dataWithSummarizedReviews.map((doc) => ({
                    ...doc,
                    image: doc.image as Media | null,
                    tenant: doc.tenant as Tenant & { image: Media | null }
                }))
            }
        }),
    
    getStats: baseProcedure
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
