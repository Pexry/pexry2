import type { CollectionConfig } from 'payload';
import { isSuperAdmin } from "@/lib/access";

export const UserAgents: CollectionConfig = {
  slug: 'user-agents',
  auth: false,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'permissions'],
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  access: {
    read: ({ req: { user } }: any) => {
      // Only super admins can read user agents
      return user?.roles?.includes('super-admin');
    },
    create: ({ req: { user } }: any) => {
      return user?.roles?.includes('super-admin');
    },
    update: ({ req: { user } }: any) => {
      return user?.roles?.includes('super-admin');
    },
    delete: ({ req: { user } }: any) => {
      return user?.roles?.includes('super-admin');
    },
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Create or update corresponding user when user agent is created/updated
        if (operation === 'create') {
          try {
            // Check if user already exists
            const existingUsers = await req.payload.find({
              collection: 'users',
              where: {
                email: {
                  equals: doc.email,
                },
              },
            })

            if (existingUsers.docs.length === 0) {
              // Create new user with user-agent role
              const newUser = await req.payload.create({
                collection: 'users',
                data: {
                  email: doc.email,
                  password: doc.password,
                  username: doc.name.toLowerCase().replace(/\s+/g, '_'),
                  roles: ['user-agent'],
                },
                overrideAccess: true,
              })
              console.log('Created user agent:', newUser.id, 'with roles:', newUser.roles)
            } else {
              // Update existing user to add user-agent role
              const existingUser = existingUsers.docs[0]
              if (existingUser) {
                const currentRoles = existingUser.roles || []
                
                if (!currentRoles.includes('user-agent')) {
                  const updatedUser = await req.payload.update({
                    collection: 'users',
                    id: existingUser.id,
                    data: {
                      roles: [...currentRoles, 'user-agent'],
                    },
                    overrideAccess: true,
                  })
                  console.log('Updated user with agent role:', updatedUser.id, 'new roles:', updatedUser.roles)
                }
              }
            }
          } catch (error) {
            console.error('Error creating/updating user for agent:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Agent Name',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: 'Email Address',
    },
    {
      name: 'password',
      type: 'text',
      required: true,
      label: 'Password',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'inactive',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    {
      name: 'availability',
      type: 'select',
      required: true,
      defaultValue: 'unavailable',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Unavailable', value: 'unavailable' },
        { label: 'Busy', value: 'busy' },
      ],
    },
    {
      name: 'permissions',
      type: 'group',
      fields: [
        {
          name: 'handlePayouts',
          type: 'checkbox',
          label: 'Handle Payouts',
          defaultValue: false,
        },
        {
          name: 'handleSupportTickets',
          type: 'checkbox',
          label: 'Handle Support Tickets',
          defaultValue: false,
        },
        {
          name: 'handleLiveChat',
          type: 'checkbox',
          label: 'Handle Live Chat Messages',
          defaultValue: false,
        },
        {
          name: 'viewUserData',
          type: 'checkbox',
          label: 'View User Data',
          defaultValue: false,
        },
        {
          name: 'manageDisputes',
          type: 'checkbox',
          label: 'Manage Disputes',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'assignedChats',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
      label: 'Currently Assigned Chats',
    },
    {
      name: 'totalChatsHandled',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
      label: 'Total Chats Handled',
    },
  ],
  timestamps: true,
};
