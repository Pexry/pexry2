
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { generateAuthCookie } from "../utils";
import { loginSchema, registerSchema, forgotPasswordSchema } from "../schemas";


export const authRouter = createTRPCRouter({
    session: baseProcedure.query(async ({ ctx }) => {
        const headers = await getHeaders();

        const session = await ctx.db.auth({ headers });

        return session;

    }),
    register: baseProcedure
  .input(registerSchema)
  .mutation(async ({ input, ctx }) => {
    // Check if username already exists
    const existingData = await ctx.db.find({
      collection: "users",
      limit: 1,
      where: {
        username: {
          equals: input.username,
        },
      },
    });

    if (existingData.docs.length > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Username already taken",
      });
    }

    // ✅ Create tenant with same slug/name as username
    const tenant = await ctx.db.create({
      collection: "tenants",
      data: {
        name: input.username,
        slug: input.username,
      },
    });

    // ✅ Create user and assign tenant
    await ctx.db.create({
      collection: "users",
      data: {
        email: input.email,
        username: input.username,
        password: input.password,
        tenants: [
          {
            tenant: tenant.id, // 👈 required for plugin-multi-tenant
          },
        ],
      },
    });

    // ✅ Log in user after creation
    const loginData = await ctx.db.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    });

    if (!loginData.token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to log in after registration",
      });
    }

    await generateAuthCookie({
      prefix: ctx.db.config.cookiePrefix,
      value: loginData.token,
    });
  }),

        login: baseProcedure
    .input(loginSchema)

    .mutation(async ({ input, ctx }) => {
        const data = await ctx.db.login({
            collection: "users",
            data: {
                email: input.email,
                password: input.password,
            },
        });

        if(!data.token) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Failed to login",
            });
        }

        await generateAuthCookie({
            prefix: ctx.db.config.cookiePrefix,
            value: data.token,
        });

        return data;
    }),
    
    forgotPassword: baseProcedure
        .input(forgotPasswordSchema)
        .mutation(async ({ input, ctx }) => {
            // Create a support ticket for admin to review
            await ctx.db.create({
                collection: "support-tickets",
                data: {
                    subject: "Password Reset Request",
                    description: `Password reset request with the following information:

Email: ${input.email}
Username: ${input.username}
Listed Products: ${input.listedProducts}
Number of Products: ${input.numberOfProducts}

Please verify the user's information and assist with password reset.`,
                    status: "open",
                    priority: "high", // High priority for password resets
                    category: "account", // Account issue category
                    // user field is optional, so we don't include it for password reset requests
                },
            });

            return {
                success: true,
                message: "Password reset request submitted successfully. An agent will contact you within 24 hours.",
            };
        }),
});
