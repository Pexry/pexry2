import { z } from "zod";
import { createTRPCRouter, protectedPrecedure } from "@/trpc/init";
import { createNotificationService } from "@/lib/notifications";

export const notificationsRouter = createTRPCRouter({
  // Get user's notifications
  getMyNotifications: protectedPrecedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        unreadOnly: z.boolean().default(false),
        type: z.enum(['sale', 'dispute_opened', 'dispute_resolved', 'withdrawal_paid', 'withdrawal_rejected', 'general']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        user: { equals: ctx.session.user.id },
      };

      if (input.unreadOnly) {
        where.read = { equals: false };
      }

      if (input.type) {
        where.type = { equals: input.type };
      }

      const result = await ctx.db.find({
        collection: "notifications",
        where,
        sort: "-createdAt",
        limit: input.limit,
        page: input.page,
        depth: 1,
      });

      return {
        docs: result.docs,
        totalDocs: result.totalDocs,
        page: input.page,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      };
    }),

  // Get unread notification count
  getUnreadCount: protectedPrecedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.find({
        collection: "notifications",
        where: {
          and: [
            { user: { equals: ctx.session.user.id } },
            { read: { equals: false } },
          ],
        },
        limit: 0, // Only count, don't return docs
      });

      return { count: result.totalDocs };
    }),

  // Mark notification as read
  markAsRead: protectedPrecedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // First verify the notification belongs to the user
      const notification = await ctx.db.findByID({
        collection: "notifications",
        id: input,
      });

      const notificationUserId = typeof notification.user === 'string' ? notification.user : notification.user?.id;
      
      if (notificationUserId !== ctx.session.user.id) {
        throw new Error('Notification not found or access denied');
      }

      await ctx.db.update({
        collection: "notifications",
        id: input,
        data: { read: true },
      });

      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedPrecedure
    .mutation(async ({ ctx }) => {
      // Get all unread notifications for the user
      const unreadNotifications = await ctx.db.find({
        collection: "notifications",
        where: {
          and: [
            { user: { equals: ctx.session.user.id } },
            { read: { equals: false } },
          ],
        },
        limit: 1000, // Reasonable limit
      });

      // Mark each as read
      const updatePromises = unreadNotifications.docs.map(notification =>
        ctx.db.update({
          collection: "notifications",
          id: notification.id,
          data: { read: true },
        })
      );

      await Promise.all(updatePromises);
      return { success: true };
    }),

  // Delete a notification
  deleteNotification: protectedPrecedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // First verify the notification belongs to the user
      const notification = await ctx.db.findByID({
        collection: "notifications",
        id: input,
      });

      const notificationUserId = typeof notification.user === 'string' ? notification.user : notification.user?.id;
      
      if (notificationUserId !== ctx.session.user.id) {
        throw new Error('Notification not found or access denied');
      }

      await ctx.db.delete({
        collection: "notifications",
        id: input,
      });

      return { success: true };
    }),

  // Test procedure to create a sample notification (for testing only)
  createTestNotification: protectedPrecedure
    .input(
      z.object({
        type: z.enum(['sale', 'dispute_opened', 'dispute_resolved', 'withdrawal_paid', 'withdrawal_rejected', 'general']).default('general'),
        title: z.string().default('Test Notification'),
        message: z.string().default('This is a test notification to verify the system is working.'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notificationService = createNotificationService(ctx.db);
      
      const notification = await notificationService.createNotification({
        userId: ctx.session.user.id,
        title: input.title,
        message: input.message,
        type: input.type,
        priority: 'normal',
        actionUrl: '/dashboard/notifications',
      });

      return { success: true, notification };
    }),

  // Debug procedure to check if notifications collection exists
  debugNotifications: protectedPrecedure
    .query(async ({ ctx }) => {
      try {
        // Try to get all collections to see if notifications exists
        const result = await ctx.db.find({
          collection: "notifications",
          where: {},
          limit: 1,
        });

        return {
          success: true,
          message: "Notifications collection is accessible",
          totalDocs: result.totalDocs,
          hasCollections: true,
        };
      } catch (error) {
        console.error('Debug notifications error:', error);
        return {
          success: false,
          message: `Error accessing notifications: ${error}`,
          error: String(error),
        };
      }
    }),
});
