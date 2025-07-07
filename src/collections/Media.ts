import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from "@/lib/access";

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    {
      name: 'caption',
      type: 'text',
      required: false,
    },
  ],
  upload: {
    // Configure image resizing and optimization
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'medium',
        width: 800,
        height: 600,
        position: 'centre',
      },
      {
        name: 'large',
        width: 1200,
        height: 900,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
