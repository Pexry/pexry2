import type { CollectionConfig } from 'payload'

import { isSuperAdmin } from '@/lib/access';

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: () => true,
    create: () => true, // Allow public registration
    delete: ({ req }) => isSuperAdmin(req.user),
    update: ({ req, id }) => {
      if (isSuperAdmin(req.user)) return true;

      return req.user?.id === id;
    }
  },
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => !isSuperAdmin(user)
  },
  auth: true,
  fields: [
    {
      name: "username",
      required: true,
      unique: true,
      type: "text",
    },
    {
      admin: {
        position: "sidebar",
      },
      name: "roles",
      type: "select",
      defaultValue: ["user"],
      hasMany: true,
      options: ["super-admin", "user", "user-agent"],
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      }
    },
    {
      name: "usdtWalletAddress",
      label: "USDT Wallet Address",
      type: "text",
      required: false,
      admin: {
        description: "User's USDT (TRC20/BEP20) wallet address for payouts.",
        position: "sidebar",
      },
    },
    {
      name: "usdtNetwork",
      label: "USDT Network",
      type: "select",
      required: false,
      options: [
        { label: "TRC20", value: "TRC20" },
        { label: "ERC20", value: "ERC20" },
        { label: "BEP20", value: "BEP20" },
      ],
      admin: {
        description: "Network for user's USDT wallet address.",
        position: "sidebar",
      },
    },
    {
      name: "availableForWithdrawal",
      label: "Available for Withdrawal",
      type: "number",
      required: false,
      defaultValue: 0,
      admin: {
        description: "Amount (USD) available for vendor withdrawal. Updated by system.",
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "balanceOnHold",
      label: "Balance on Hold",
      type: "number",
      required: false,
      defaultValue: 0,
      admin: {
        description: "Amount (USD) on hold due to disputes. Updated by system.",
        position: "sidebar",
        readOnly: true,
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ req, doc, operation }) => {
        // Create a tenant for new users
        if (operation === 'create' && req.payload) {
          try {
            // Create a tenant for this user - slug is simply the username
            const tenant = await req.payload.create({
              collection: 'tenants',
              data: {
                name: `${doc.username}'s Store`,
                slug: doc.username,
              },
            });

            // Update the user with the tenant using the multi-tenant plugin format
            // Use a small delay to ensure the user document is fully created
            setTimeout(async () => {
              try {
                await req.payload!.update({
                  collection: 'users',
                  id: doc.id,
                  data: {
                    tenants: [
                      {
                        tenant: tenant.id,
                      }
                    ],
                  },
                });
              } catch (updateError) {
                console.error('Error updating user with tenant:', updateError);
              }
            }, 100);
          } catch (error) {
            console.error('Error creating tenant for user:', error);
          }
        }
      },
    ],
  },
};
