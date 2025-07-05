import z from "zod";
import { TRPCError } from "@trpc/server";

import { Media, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter, protectedPrecedure } from "@/trpc/init";
import { createNowPayment } from "@/lib/nowpayments";

export const checkoutRouter = createTRPCRouter({
    purchase: protectedPrecedure
        .input(
            z.object({
                productIds: z.array(z.string()).min(1),
                tenantSlug: z.string().min(1)
            })
        )
        .mutation(async({ ctx, input }) => {
            const products = await ctx.db.find({
                collection: "products",
                depth: 2,
                where: {
                    and: [
                        {
                            id:{
                                in: input.productIds,
                            }
                        },
                        {
                            "tenant.slug": {
                                equals: input.tenantSlug,
                            }
                        },
                        {
                            isArchived: {
                                not_equals: true,
                            }
                        }
                    ]
                }
            })

            if (products.totalDocs !== input.productIds.length) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Products not found" });
            }

            const tenantsData = await ctx.db.find({
                collection: "tenants",
                limit: 1,
                pagination: false,
                where: {
                    slug: {
                        equals: input.tenantSlug,
                    },
                },
            });

            const tenant = tenantsData.docs[0];

            if(!tenant){
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tenant not found",
                })
            }

            // Calculate total amount
            const totalAmount = products.docs.reduce((sum, product) => sum + product.price, 0);

            // Generate a unique orderId for NowPayments and Orders
            const orderId = `order-${Date.now()}`;

            // If totalAmount is 0, mark as paid and skip payment gateway
            if (totalAmount === 0) {
                await ctx.db.create({
                    collection: 'orders',
                    data: {
                        user: ctx.session.user.id,
                        product: products.docs[0]?.id || '',
                        status: 'paid',
                        amount: totalAmount,
                        transactionId: orderId,
                        deliveryStatus: 'auto',
                    },
                });
                return { url: null, message: 'Order marked as paid (free product).' };
            }

            // Create the order in the database with transactionId = orderId
            await ctx.db.create({
                collection: 'orders',
                data: {
                    user: ctx.session.user.id,
                    product: products.docs[0]?.id || '', // fallback to empty string if not found
                    status: 'pending',
                    amount: totalAmount,
                    transactionId: orderId,
                    deliveryStatus: 'auto',
                },
            });

            // Create NowPayments invoice
            const nowPayment = await createNowPayment(
                totalAmount,
                "usd",
                orderId
            );

            if (!nowPayment || !nowPayment.invoice_url) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create NowPayments invoice" });
            }

            return { url: nowPayment.invoice_url };
        })
    ,
    getProducts: baseProcedure
    .input(
        z.object({
            ids: z.array(z.string(),)
        }),
    )
    .query(async ({ ctx, input }) => {
        const data = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
            and: [
                    {
                        id: {
                             in: input.ids,
                            },
                    },
                    {
                        isArchived: {
                            not_equals: true,
                        },
                    },
            ],
        },
    });     

    if (data.totalDocs !== input.ids.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Products not found" });
    }

    const totalPrice = data.docs.reduce((acc, product) => {
        const price = Number(product.price);
        return acc + (isNaN(price) ? 0 : price);
    }, 0)

    return {
        ...data,
        totalPrice: totalPrice,
        docs: data.docs.map((doc) => ({
            ...doc,
            image: doc.image as Media | null,
            tenant: doc.tenant as Tenant & { image: Media | null }
            }))
        }
      }),
    });
