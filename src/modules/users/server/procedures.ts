import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter, protectedPrecedure } from "@/trpc/init";

export const userRouter = createTRPCRouter({
  changePassword: protectedPrecedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current user
      const userId = ctx.session.user.id;
      // Validate current password
      const user = await ctx.db.find({
        collection: "users",
        where: { id: { equals: userId } },
        limit: 1,
      });
      if (!user.docs[0]) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      // Try login with current password
      const login = await ctx.db.login({
        collection: "users",
        data: { email: user.docs[0].email, password: input.currentPassword },
      });
      if (!login.token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
      // Update password
      await ctx.db.update({
        collection: "users",
        where: { id: { equals: userId } },
        data: { password: input.newPassword },
      });
      return { success: true };
    }),

  updateWallet: protectedPrecedure
    .input(z.object({ 
      usdtNetwork: z.enum(["TRC20", "ERC20", "BEP20"]),
      usdtWalletAddress: z.string().min(5) 
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db.update({
        collection: "users",
        where: { id: { equals: userId } },
        data: { 
          usdtNetwork: input.usdtNetwork,
          usdtWalletAddress: input.usdtWalletAddress 
        },
      });
      return { success: true };
    }),

  availableForWithdrawal: protectedPrecedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.find({
        collection: "users",
        where: { id: { equals: userId } },
        limit: 1,
      });
      const availableForWithdrawal = user.docs[0]?.availableForWithdrawal ?? 0;
      const balanceOnHold = (user.docs[0] as any)?.balanceOnHold ?? 0;

      // Check for pending withdrawal requests
      const pendingWithdrawals = await ctx.db.find({
        collection: "withdrawal-requests",
        where: {
          and: [
            { user: { equals: userId } },
            { 
              status: { 
                in: ["pending", "approved"] 
              } 
            }
          ]
        },
        sort: "-createdAt",
        limit: 1,
      });

      const pendingRequest = pendingWithdrawals.docs.length > 0 ? pendingWithdrawals.docs[0] : null;

      return { 
        availableForWithdrawal,
        balanceOnHold,
        totalEarnings: availableForWithdrawal + balanceOnHold,
        pendingWithdrawal: pendingRequest ? {
          id: pendingRequest.id,
          amount: pendingRequest.amount,
          status: pendingRequest.status,
          createdAt: pendingRequest.createdAt,
        } : null,
      };
    }),

  requestWithdrawal: protectedPrecedure
    .input(z.object({ amount: z.number().min(10, "Minimum withdrawal amount is $10") }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Check for existing pending withdrawal requests
      const pendingWithdrawals = await ctx.db.find({
        collection: "withdrawal-requests",
        where: {
          and: [
            { user: { equals: userId } },
            { 
              status: { 
                in: ["pending", "approved"] 
              } 
            }
          ]
        },
        limit: 1,
      });

      if (pendingWithdrawals.docs.length > 0) {
        const pendingRequest = pendingWithdrawals.docs[0];
        const status = pendingRequest?.status || 'pending';
        throw new Error(`You already have a ${status} withdrawal request. Please wait for it to be processed before submitting a new request.`);
      }
      
      // Check for open disputes where user is the seller
      const openDisputes = await ctx.db.find({
        collection: "disputes",
        where: {
          and: [
            { seller: { equals: userId } },
            { 
              status: { 
                in: ["open", "in-progress"] 
              } 
            }
          ]
        },
        limit: 1,
      });

      if (openDisputes.docs.length > 0) {
        throw new Error("Cannot withdraw funds while you have open disputes. Please resolve all disputes first.");
      }

      // Get user's availableForWithdrawal
      const user = await ctx.db.find({
        collection: "users",
        where: { id: { equals: userId } },
        limit: 1,
      });
      const availableForWithdrawal = user.docs[0]?.availableForWithdrawal ?? 0;
      if (input.amount > availableForWithdrawal) {
        throw new Error("Requested amount exceeds available balance");
      }
      // Create a withdrawal request (do not reset balance yet)
      await ctx.db.create({
        collection: "withdrawal-requests",
        data: {
          user: userId,
          amount: input.amount,
          status: "pending",
        },
      });
      return { success: true };
    }),

  withdrawalHistory: protectedPrecedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const requests = await ctx.db.find({
        collection: "withdrawal-requests",
        where: { user: { equals: userId } },
        sort: "-createdAt",
        depth: 2, // populate user for wallet address
        pagination: false,
      });
      return requests.docs;
    }),
});
