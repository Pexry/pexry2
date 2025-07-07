import { CollectionConfig } from 'payload'
import { isSuperAdmin } from "@/lib/access";

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'read', 'user', 'createdAt'],
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  access: {
    read: ({ req }) => {
      // Users can only see their own notifications
      if (req.user) {
        return {
          user: {
            equals: req.user.id,
          },
        }
      }
      return false
    },
    create: ({ req }) => {
      // Only authenticated users can create notifications (system-generated)
      return !!req.user
    },
    update: ({ req }) => {
      // Users can only update their own notifications (mark as read)
      if (req.user) {
        return {
          user: {
            equals: req.user.id,
          },
        }
      }
      return false
    },
    delete: ({ req }) => {
      // Users can delete their own notifications
      if (req.user) {
        return {
          user: {
            equals: req.user.id,
          },
        }
      }
      return false
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The user who should receive this notification',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification title/subject',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed notification message',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Sale', value: 'sale' },
        { label: 'Dispute Opened', value: 'dispute_opened' },
        { label: 'Dispute Resolved', value: 'dispute_resolved' },
        { label: 'Withdrawal Paid', value: 'withdrawal_paid' },
        { label: 'Withdrawal Rejected', value: 'withdrawal_rejected' },
        { label: 'Message', value: 'message' },
        { label: 'General', value: 'general' },
      ],
      admin: {
        description: 'Type of notification for categorization',
      },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the user has read this notification',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data related to the notification (order ID, dispute ID, etc.)',
      },
    },
    {
      name: 'actionUrl',
      type: 'text',
      admin: {
        description: 'URL to redirect user when notification is clicked (optional)',
      },
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      admin: {
        description: 'Notification priority level',
      },
    },
  ],
  timestamps: true,
}
