import { z } from 'zod'
import { createTRPCRouter, protectedPrecedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const supportRouter = createTRPCRouter({
  // Create support ticket
  createSupportTicket: protectedPrecedure
    .input(z.object({
      subject: z.string().min(1, 'Subject is required'),
      description: z.string().min(1, 'Description is required'),
      category: z.enum(['payment', 'dispute', 'account', 'technical', 'refund', 'other']),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      productId: z.string().optional(),
      orderId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create a support ticket',
        })
      }

      try {
        const ticket = await payload.create({
          collection: 'support-tickets',
          data: {
            subject: input.subject,
            description: input.description,
            category: input.category,
            priority: input.priority,
            user: ctx.session.user.id,
            status: 'open',
          },
        })

        return { 
          success: true, 
          ticketId: ticket.id,
          ticket 
        }
      } catch (error) {
        console.error('Error creating support ticket:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create support ticket',
        })
      }
    }),
})
