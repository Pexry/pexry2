import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from "@/lib/access";

export const SupportTickets: CollectionConfig = {
  slug: 'support-tickets',
  admin: {
    useAsTitle: 'subject',
    hidden: ({ user }) => !isSuperAdmin(user), // Hide from non-admin users
  },
  access: {
    create: () => true, // Allow anyone to create support tickets (including forgot password requests)
    read: ({ req: { user } }) => {
      if (user?.roles?.includes('super-admin')) return true
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    update: ({ req: { user } }) => !!user?.roles?.includes('super-admin'),
    delete: ({ req: { user } }) => !!user?.roles?.includes('super-admin'),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false, // Make optional for forgot password requests
      admin: {
        description: 'The user requesting support (optional for password reset requests)',
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        {
          label: 'Open',
          value: 'open',
        },
        {
          label: 'In Progress',
          value: 'in-progress',
        },
        {
          label: 'Resolved',
          value: 'resolved',
        },
        {
          label: 'Closed',
          value: 'closed',
        },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        {
          label: 'Low',
          value: 'low',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'High',
          value: 'high',
        },
        {
          label: 'Urgent',
          value: 'urgent',
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Payment Issue',
          value: 'payment',
        },
        {
          label: 'Dispute',
          value: 'dispute',
        },
        {
          label: 'Account Issue',
          value: 'account',
        },
        {
          label: 'Technical Issue',
          value: 'technical',
        },
        {
          label: 'Refund Request',
          value: 'refund',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },
    {
      name: 'messages',
      type: 'array',
      fields: [
        {
          name: 'sender',
          type: 'select',
          required: true,
          options: [
            {
              label: 'User',
              value: 'user',
            },
            {
              label: 'Support',
              value: 'support',
            },
          ],
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
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        roles: {
          contains: 'super-admin',
        },
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Notify user when ticket status changes
        if (operation === 'update') {
          const { createNotificationService } = await import('../lib/notifications')
          
          if (doc.status === 'resolved') {
            const notificationService = createNotificationService(req.payload)
            await notificationService.createSupportTicketResolvedNotification(
              doc.user.toString(),
              doc.subject,
              doc.id
            )
          }
        }
      },
    ],
  },
}
