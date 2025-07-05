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
});
