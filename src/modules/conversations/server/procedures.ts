import { z } from 'zod'
import { createTRPCRouter, protectedPrecedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const conversationsRouter = createTRPCRouter({
  // Get user's conversations
  getMyConversations: protectedPrecedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      type: z.enum(['conversation', 'support']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view conversations',
        })
      }

      try {
        const where: any = {
          and: [
            {
              participants: {
                contains: ctx.session.user.id,
              },
            },
            {
              status: {
                not_in: ['resolved', 'closed'] // Hide resolved and closed conversations
              }
            }
          ]
        }

        if (input.type) {
          where.and.push({ type: { equals: input.type } })
        }

        const conversations = await payload.find({
          collection: 'conversations',
          where,
          limit: input.limit,
          page: input.page,
          sort: '-lastMessageAt',
        })

        return conversations
      } catch (error) {
        console.error('Error fetching conversations:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch conversations',
        })
      }
    }),

  // Get specific conversation
  getConversation: protectedPrecedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view conversations',
        })
      }

      try {
        const conversation = await payload.findByID({
          collection: 'conversations',
          id: input.conversationId,
        })

        // Check if user has access to this conversation
        const isParticipant = conversation.participants.some((p: any) => 
          (typeof p === 'string' ? p : p.id) === ctx.session!.user.id
        )
        
        const isAssignedAgent = conversation.assignedAgent && 
          (typeof conversation.assignedAgent === 'string' ? conversation.assignedAgent : conversation.assignedAgent.id) === ctx.session!.user.id
        
        const isUserAgent = ctx.session.user.roles?.includes('user-agent')
        const isSuperAdmin = ctx.session.user.roles?.includes('super-admin')
        
        // Allow access if user is: participant, assigned agent, any user-agent (for support), or super admin
        const hasAccess = isParticipant || isAssignedAgent || 
          (isUserAgent && conversation.type === 'support') || isSuperAdmin

        if (!hasAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only view conversations you are part of',
          })
        }

        return conversation
      } catch (error) {
        console.error('Error fetching conversation:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch conversation',
        })
      }
    }),

  // Create new conversation
  createConversation: protectedPrecedure
    .input(z.object({
      type: z.enum(['conversation', 'support']),
      subject: z.string().min(1, 'Subject is required'),
      message: z.string().min(1, 'Initial message is required'),
      recipientId: z.string().optional(), // For regular conversations
      category: z.enum(['payment', 'dispute', 'account', 'technical', 'refund', 'other']).optional(), // For support requests
      priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
      productId: z.string().optional(),
      orderId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create a conversation',
        })
      }

      try {
        // Determine participants
        let participants = [ctx.session.user.id]
        if (input.type === 'conversation' && input.recipientId) {
          participants.push(input.recipientId)
        }

        // Create the conversation
        const conversation = await payload.create({
          collection: 'conversations',
          data: {
            type: input.type,
            subject: input.subject,
            participants,
            category: input.category,
            priority: input.priority,
            product: input.productId,
            order: input.orderId,
            messages: [
              {
                sender: ctx.session.user.id,
                message: input.message,
                timestamp: new Date().toISOString(),
                isRead: false,
              }
            ],
            status: 'active',
            lastMessageAt: new Date().toISOString(),
            lastMessageBy: ctx.session.user.id,
          },
        })

        return { 
          success: true, 
          conversationId: conversation.id,
          conversation 
        }
      } catch (error) {
        console.error('Error creating conversation:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create conversation',
        })
      }
    }),

  // Send message to conversation
  sendMessage: protectedPrecedure
    .input(z.object({
      conversationId: z.string(),
      message: z.string().min(1, 'Message is required'),
      isInternal: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to send a message',
        })
      }

      try {
        // Get the conversation
        const conversation = await payload.findByID({
          collection: 'conversations',
          id: input.conversationId,
        })

        // Check if user has access
        const isParticipant = conversation.participants.some((p: any) => 
          (typeof p === 'string' ? p : p.id) === ctx.session!.user.id
        )
        
        const isAssignedAgent = conversation.assignedAgent && 
          (typeof conversation.assignedAgent === 'string' ? conversation.assignedAgent : conversation.assignedAgent.id) === ctx.session!.user.id
        
        const isUserAgent = ctx.session.user.roles?.includes('user-agent')
        const isSuperAdmin = ctx.session.user.roles?.includes('super-admin')
        
        // Allow access if user is: participant, assigned agent, any user-agent (for support), or super admin
        const hasAccess = isParticipant || isAssignedAgent || 
          (isUserAgent && conversation.type === 'support') || isSuperAdmin

        if (!hasAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only send messages to conversations you are part of',
          })
        }

        // Add the new message
        const updatedMessages = [
          ...(conversation.messages || []),
          {
            sender: ctx.session.user.id,
            message: input.message,
            timestamp: new Date().toISOString(),
            isRead: false,
            isInternal: input.isInternal,
          }
        ]

        await payload.update({
          collection: 'conversations',
          id: input.conversationId,
          data: {
            messages: updatedMessages,
            status: 'active',
            lastMessageAt: new Date().toISOString(),
            lastMessageBy: ctx.session.user.id,
          },
        })

        return { success: true }
      } catch (error) {
        console.error('Error sending message:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message',
        })
      }
    }),

  // Mark messages as read
  markAsRead: protectedPrecedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to mark messages as read',
        })
      }

      try {
        const conversation = await payload.findByID({
          collection: 'conversations',
          id: input.conversationId,
        })

        // Check if user has access
        const isParticipant = conversation.participants.some((p: any) => 
          (typeof p === 'string' ? p : p.id) === ctx.session!.user.id
        )
        
        const isAssignedAgent = conversation.assignedAgent && 
          (typeof conversation.assignedAgent === 'string' ? conversation.assignedAgent : conversation.assignedAgent.id) === ctx.session!.user.id
        
        const isUserAgent = ctx.session.user.roles?.includes('user-agent')
        const isSuperAdmin = ctx.session.user.roles?.includes('super-admin')
        
        // Allow access if user is: participant, assigned agent, any user-agent (for support), or super admin
        const hasAccess = isParticipant || isAssignedAgent || 
          (isUserAgent && conversation.type === 'support') || isSuperAdmin

        if (!hasAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only mark messages as read in your own conversations',
          })
        }

        // Mark messages as read for the current user
        // Only mark messages that are not sent by the current user and are currently unread
        const updatedMessages = conversation.messages?.map((msg: any) => {
          const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?.id
          if (senderId !== ctx.session!.user.id && !msg.isRead) {
            return { ...msg, isRead: true }
          }
          return msg
        }) || []

        await payload.update({
          collection: 'conversations',
          id: input.conversationId,
          data: {
            messages: updatedMessages,
          },
        })

        return { success: true }
      } catch (error) {
        console.error('Error marking messages as read:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark messages as read',
        })
      }
    }),

  // Get agent's assigned conversations (for user-agents)
  getAgentConversations: protectedPrecedure
    .query(async ({ ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user || !ctx.session.user.roles?.includes('user-agent')) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Only agents can access this endpoint',
        })
      }

      try {
        const conversations = await payload.find({
          collection: 'conversations',
          where: {
            assignedAgent: {
              equals: ctx.session.user.id,
            },
            status: {
              not_in: ['resolved', 'closed'], // Hide resolved and closed for agents too
            }
          },
          limit: 50,
          sort: '-lastMessageAt',
        })

        return {
          success: true,
          conversations: conversations.docs
        }
      } catch (error) {
        console.error('Error fetching agent conversations:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch conversations',
        })
      }
    }),

  // Get all support conversations for user agents
  getAllSupportConversations: protectedPrecedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(['active', 'waiting', 'resolved', 'closed']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user || !ctx.session.user.roles?.includes('user-agent')) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Only agents can access this endpoint',
        })
      }

      try {
        const where: any = {
          type: { equals: 'support' }
        }

        if (input.status) {
          where.status = { equals: input.status }
        } else {
          // By default, exclude resolved and closed conversations
          where.status = { not_in: ['resolved', 'closed'] }
        }

        const conversations = await payload.find({
          collection: 'conversations',
          where,
          limit: input.limit,
          page: input.page,
          sort: '-lastMessageAt',
        })

        return conversations
      } catch (error) {
        console.error('Error fetching support conversations:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch conversations',
        })
      }
    }),

  // Assign agent to conversation (for user agents to assign themselves)
  assignSelfToConversation: protectedPrecedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user || !ctx.session.user.roles?.includes('user-agent')) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Only agents can assign themselves to conversations',
        })
      }

      try {
        // Get the conversation to check if it's a support conversation
        const conversation = await payload.findByID({
          collection: 'conversations',
          id: input.conversationId,
        })

        if (conversation.type !== 'support') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Can only assign agents to support conversations',
          })
        }

        await payload.update({
          collection: 'conversations',
          id: input.conversationId,
          data: {
            assignedAgent: ctx.session.user.id,
            status: 'active',
          },
        })

        return { success: true }
      } catch (error) {
        console.error('Error assigning agent:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign agent',
        })
      }
    }),

  // Update conversation status (for agents)
  updateConversationStatus: protectedPrecedure
    .input(z.object({
      conversationId: z.string(),
      status: z.enum(['active', 'waiting', 'resolved', 'closed']),
    }))
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        })
      }

      try {
        // Get the conversation first
        const conversation = await payload.findByID({
          collection: 'conversations',
          id: input.conversationId,
        })

        if (!conversation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Conversation not found',
          })
        }

        // Check if user is an agent or participant
        const isAgent = ctx.session.user.roles?.includes('user-agent')
        const isParticipant = conversation.participants.some((p: any) => 
          (typeof p === 'string' ? p : p.id) === ctx.session.user.id
        )
        const isAssignedAgent = conversation.assignedAgent && 
          (typeof conversation.assignedAgent === 'string' 
            ? conversation.assignedAgent 
            : conversation.assignedAgent.id) === ctx.session.user.id

        if (!isAgent && !isParticipant && !isAssignedAgent) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this conversation',
          })
        }

        // Only agents can update status to resolved/closed
        if ((input.status === 'resolved' || input.status === 'closed') && !isAgent) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only agents can resolve or close conversations',
          })
        }

        // Update the conversation status
        const updatedConversation = await payload.update({
          collection: 'conversations',
          id: input.conversationId,
          data: {
            status: input.status,
          },
        })

        // Add a system message about the status change
        const statusMessages = {
          resolved: 'This conversation has been marked as resolved.',
          closed: 'This conversation has been closed.',
          active: 'This conversation has been reopened.',
          waiting: 'This conversation is waiting for a response.',
        }

        await payload.update({
          collection: 'conversations',
          id: input.conversationId,
          data: {
            messages: [
              ...(conversation.messages || []),
              {
                sender: ctx.session.user.id,
                message: statusMessages[input.status],
                timestamp: new Date().toISOString(),
                isRead: false,
                isInternal: true,
              }
            ]
          }
        })

        return { success: true, status: input.status }
      } catch (error) {
        console.error('Error updating conversation status:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update conversation status',
        })
      }
    }),

  // Get unread messages count
  getUnreadMessagesCount: protectedPrecedure
    .query(async ({ ctx }) => {
      const payload = await getPayload({ config })
      
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view unread messages count',
        })
      }

      try {
        console.log('Getting unread messages count for user:', ctx.session.user.id)
        
        // Get all active conversations where user is a participant
        const conversations = await payload.find({
          collection: 'conversations',
          where: {
            and: [
              {
                participants: {
                  contains: ctx.session.user.id,
                },
              },
              {
                status: {
                  not_in: ['resolved', 'closed'] // Only count messages from active conversations
                }
              }
            ]
          },
          limit: 1000, // reasonable limit
          depth: 0, // Don't populate relationships to improve performance
        })

        console.log('Found conversations:', conversations.docs.length)

        let unreadCount = 0
        let debugInfo = []
        
        // Count unread messages in each conversation
        for (const conversation of conversations.docs) {
          let conversationUnreadCount = 0
          
          if (conversation.messages && Array.isArray(conversation.messages)) {
            for (const message of conversation.messages) {
              // Count messages that are:
              // 1. Not read by the current user
              // 2. Not sent by the current user
              // 3. Not internal messages (unless user is an agent)
              const senderId = typeof message.sender === 'string' ? message.sender : message.sender?.id
              const isUserAgent = ctx.session.user.roles?.includes('user-agent')
              
              if (!message.isRead && 
                  senderId !== ctx.session.user.id && 
                  (!message.isInternal || isUserAgent)) {
                unreadCount++
                conversationUnreadCount++
              }
            }
          }
          
          if (conversationUnreadCount > 0) {
            debugInfo.push({
              conversationId: conversation.id,
              subject: conversation.subject,
              unreadCount: conversationUnreadCount
            })
          }
        }

        console.log('Total unread messages:', unreadCount)
        console.log('Debug info:', debugInfo)

        return { count: unreadCount }
      } catch (error) {
        console.error('Error getting unread messages count:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get unread messages count',
        })
      }
    }),

})
