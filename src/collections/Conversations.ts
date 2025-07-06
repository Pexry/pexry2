import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from "@/lib/access";

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'type', 'participants', 'status', 'lastMessageAt'],
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user?.roles?.includes('super-admin')) return true
      if (user?.roles?.includes('user-agent')) return true // Agents can see assigned conversations
      
      return {
        participants: {
          contains: user.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user?.roles?.includes('super-admin')) return true
      if (user?.roles?.includes('user-agent')) return true
      
      return {
        participants: {
          contains: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => !!user?.roles?.includes('super-admin'),
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'conversation',
      options: [
        { label: 'Regular Conversation', value: 'conversation' },
        { label: 'Support Request', value: 'support' },
      ],
    },
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      required: true,
      validate: (value) => {
        if (!value || value.length < 1) {
          return 'Conversation must have at least 1 participant'
        }
        return true
      },
    },
    {
      name: 'assignedAgent',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: (data) => data.type === 'support',
        description: 'Agent assigned to handle this support request',
      },
    },
    {
      name: 'category',
      type: 'select',
      admin: {
        condition: (data) => data.type === 'support',
      },
      options: [
        { label: 'Payment Issue', value: 'payment' },
        { label: 'Dispute', value: 'dispute' },
        { label: 'Account Issue', value: 'account' },
        { label: 'Technical Issue', value: 'technical' },
        { label: 'Refund Request', value: 'refund' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      admin: {
        condition: (data) => data.type === 'support',
      },
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Waiting for Response', value: 'waiting' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'messages',
      type: 'array',
      fields: [
        {
          name: 'sender',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'message',
          type: 'textarea',
          required: true,
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
        },
        {
          name: 'isRead',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isInternal',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Internal notes visible only to agents (for support requests)',
          },
        },
      ],
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        description: 'Related product (optional)',
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        description: 'Related order (optional)',
      },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastMessageBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'update' && data.messages) {
          // Update lastMessageAt and lastMessageBy when new messages are added
          const lastMessage = data.messages[data.messages.length - 1]
          if (lastMessage) {
            data.lastMessageAt = lastMessage.timestamp
            data.lastMessageBy = lastMessage.sender
          }
        }

        // Auto-assign agent for support requests during creation
        if (operation === 'create' && data.type === 'support' && !data.assignedAgent) {
          try {
            // Find any available agent
            const agents = await req.payload.find({
              collection: 'users',
              where: {
                'roles': { contains: 'user-agent' },
              },
              limit: 1,
            })

            if (agents.docs.length > 0) {
              const agent = agents.docs[0]
              if (agent) {
                data.assignedAgent = agent.id
                // Add agent to participants if not already included
                if (!data.participants.includes(agent.id)) {
                  data.participants = [...(data.participants || []), agent.id]
                }
              }
            } else {
              // If no agents found, we'll leave it unassigned
              console.log('No agents available for new support request')
            }
          } catch (error) {
            console.error('Error auto-assigning agent:', error)
            // Don't throw error, just continue without assignment
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // Create notification for new messages
        if (operation === 'update' && doc.messages?.length > 0) {
          const { createNotificationService } = await import('../lib/notifications')
          const notificationService = createNotificationService(req.payload)
          
          const lastMessage = doc.messages[doc.messages.length - 1]
          
          // Notify participants (except sender)
          for (const participant of doc.participants) {
            const participantId = typeof participant === 'string' ? participant : participant.id
            const senderId = typeof lastMessage.sender === 'string' ? lastMessage.sender : lastMessage.sender.id
            
            if (participantId !== senderId) {
              await notificationService.createDirectMessageNotification(
                participantId,
                doc.subject,
                doc.id
              )
            }
          }

          // Notify assigned agent if not a participant
          if (doc.assignedAgent) {
            const agentId = typeof doc.assignedAgent === 'string' ? doc.assignedAgent : doc.assignedAgent.id
            const senderId = typeof lastMessage.sender === 'string' ? lastMessage.sender : lastMessage.sender.id
            
            if (agentId !== senderId && !doc.participants.some((p: any) => 
              (typeof p === 'string' ? p : p.id) === agentId
            )) {
              await notificationService.createDirectMessageNotification(
                agentId,
                doc.subject,
                doc.id
              )
            }
          }
        }
      },
    ],
  },
}
