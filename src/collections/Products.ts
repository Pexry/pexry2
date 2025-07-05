import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";


export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: 'name',
    //hidden: ({ user }) => !isSuperAdmin(user),
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        description: 'Price in USD',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'refundPolicy',
      type: 'select',
      options: ['no-refunds', '30-day', '14-day', '7-day', '3-day', '1-day'],
      defaultValue: 'no-refunds',
    },
    {
      name: 'deliveryType',
      type: 'select',
      options: ['file', 'text'],
      defaultValue: 'file',
      required: true,
    },
    {
      name: 'deliveryText',
      type: 'textarea',
      admin: {
        condition: (data) => data.deliveryType === 'text',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data.deliveryType === 'file',
      },
    },
    {
      name: 'isArchived',
      label: 'Archive',
      type: 'checkbox',
      defaultValue: false,
    },
   
  ],
};