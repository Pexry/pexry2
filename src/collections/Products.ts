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
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main cover image displayed on product pages',
      },
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
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        condition: () => false,
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // Validate subcategory relationship
        if (data.subcategory && data.category) {
          const subcategory = await req.payload!.findByID({
            collection: 'categories',
            id: data.subcategory,
          });

          // Check if subcategory's parent matches the selected category
          // Handle both object and string parent references
          const parentId = typeof subcategory.parent === 'object' && subcategory.parent 
            ? subcategory.parent.id 
            : subcategory.parent;
            
          if (parentId !== data.category) {
            throw new Error('Selected subcategory must belong to the selected category');
          }
        }

        if (operation === 'create' && req.user) {
          // Get the user with their tenants
          const user = await req.payload!.findByID({
            collection: 'users',
            id: req.user.id,
            depth: 1,
          });

          // If user has tenants, automatically assign the first one
          if (user.tenants && user.tenants.length > 0) {
            const firstTenant = user.tenants[0];
            const tenantId = typeof firstTenant === 'object' && firstTenant.tenant 
              ? (typeof firstTenant.tenant === 'object' ? firstTenant.tenant.id : firstTenant.tenant)
              : firstTenant;
            
            return {
              ...data,
              vendor: req.user.id,
              tenant: tenantId,
            };
          }

          return {
            ...data,
            vendor: req.user.id,
          };
        }
        return data;
      },
    ],
  },
};