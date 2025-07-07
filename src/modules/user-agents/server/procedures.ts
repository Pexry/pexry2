import { z } from "zod";
import { createTRPCRouter, protectedPrecedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const userAgentRouter = createTRPCRouter({
  // Get all user agents (super admin only)
  getAll: protectedPrecedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.enum(["active", "inactive", "suspended"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is super admin
      if (!ctx.session.user.roles?.includes('super-admin')) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can access user agents",
        });
      }

      const where: any = {};
      if (input.status) {
        where.status = { equals: input.status };
      }

      const agents = await ctx.db.find({
        collection: "user-agents",
        page: input.page,
        limit: input.limit,
        where,
        sort: "-createdAt",
      });

      return agents;
    }),

  // Create a new user agent (super admin only)
  create: protectedPrecedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        permissions: z.object({
          handlePayouts: z.boolean().default(false),
          handleSupportTickets: z.boolean().default(false),
          handleLiveChat: z.boolean().default(false),
          viewUserData: z.boolean().default(false),
          manageDisputes: z.boolean().default(false),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is super admin
      if (!ctx.session.user.roles?.includes('super-admin')) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can create user agents",
        });
      }

      // Check if email already exists
      const existingAgent = await ctx.db.find({
        collection: "user-agents",
        where: {
          email: { equals: input.email },
        },
        limit: 1,
      });

      if (existingAgent.docs.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }

      // Create the user agent
      const agent = await ctx.db.create({
        collection: "user-agents",
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
          status: "active",
          availability: "unavailable",
          permissions: input.permissions,
          assignedChats: 0,
          totalChatsHandled: 0,
        },
      });

      // Also create a regular user account for login
      await ctx.db.create({
        collection: "users",
        data: {
          username: input.email,
          email: input.email,
          password: input.password,
          roles: ["user-agent"],
        },
      });

      return agent;
    }),

  // Update user agent (super admin only)
  update: protectedPrecedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        status: z.enum(["active", "inactive", "suspended"]).optional(),
        permissions: z.object({
          handlePayouts: z.boolean().optional(),
          handleSupportTickets: z.boolean().optional(),
          handleLiveChat: z.boolean().optional(),
          viewUserData: z.boolean().optional(),
          manageDisputes: z.boolean().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is super admin
      if (!ctx.session.user.roles?.includes('super-admin')) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can update user agents",
        });
      }

      const { id, ...updateData } = input;

      const agent = await ctx.db.update({
        collection: "user-agents",
        id,
        data: updateData,
      });

      return agent;
    }),

  // Delete user agent (super admin only)
  delete: protectedPrecedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is super admin
      if (!ctx.session.user.roles?.includes('super-admin')) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can delete user agents",
        });
      }

      await ctx.db.delete({
        collection: "user-agents",
        id: input.id,
      });

      return { success: true };
    }),

  // Get available agents for chat assignment
  getAvailableAgents: protectedPrecedure
    .query(async ({ ctx }) => {
      const agents = await ctx.db.find({
        collection: "user-agents",
        where: {
          and: [
            { status: { equals: "active" } },
            { availability: { equals: "available" } },
            { "permissions.handleLiveChat": { equals: true } },
          ],
        },
        sort: "assignedChats", // Assign to agent with least chats
      });

      return agents.docs;
    }),

  // Update agent availability (for agents themselves)
  updateAvailability: protectedPrecedure
    .input(
      z.object({
        availability: z.enum(["available", "unavailable", "busy"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is an agent
      if (!ctx.session.user.roles?.includes('user-agent')) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only agents can update their availability",
        });
      }

      // Find the agent record by email
      const agents = await ctx.db.find({
        collection: "user-agents",
        where: {
          email: { equals: ctx.session.user.email },
        },
        limit: 1,
      });

      if (agents.docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent record not found",
        });
      }

      const agent = await ctx.db.update({
        collection: "user-agents",
        id: agents.docs[0]!.id,
        data: {
          availability: input.availability,
          lastLoginAt: new Date().toISOString(),
        },
      });

      return agent;
    }),

  // Get current agent info
  getCurrentAgent: protectedPrecedure
    .query(async ({ ctx }) => {
      // Check if user is an agent
      if (!ctx.session.user.roles?.includes('user-agent')) {
        return null;
      }

      // Find the agent record by email
      const agents = await ctx.db.find({
        collection: "user-agents",
        where: {
          email: { equals: ctx.session.user.email },
        },
        limit: 1,
      });

      return agents.docs[0] || null;
    }),
});
