import type { CollectionConfig } from 'payload';
import { isSuperAdmin } from '@/lib/access';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: () => true, // Allow tenant creation for auto-creation hook
    delete: ({ req }) => isSuperAdmin(req.user),
    read: () => true,
    update: ({ req, id }) => {
      if (isSuperAdmin(req.user)) return true;
      // Allow tenant owner to update their own store
      if (req.user && req.user.tenants) {
        return req.user.tenants.some((t: any) => t.tenant === id);
      }
      return false;
    },
  },
  admin: {
    useAsTitle: 'name',
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Store Name',
      admin: {
        description: 'This is the name of the store (e.g. John’s Store)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'This will be the subdomain (e.g. [slug].pexry.com)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Store logo or banner',
      },
    },
  ],
};
