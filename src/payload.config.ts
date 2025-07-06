// storage-adapter-import-placeholder
import { s3Storage } from '@payloadcms/storage-s3'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";

import path from 'path'
import { buildConfig } from 'payload'
import { Config } from './payload-types';

import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { isSuperAdmin } from './lib/access';

import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders';
import { Tenants } from './collections/Tenants'
import { Reviews } from './collections/Reviews';
import { Disputes } from './collections/Disputes';
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { WithdrawalRequests } from './collections/WithdrawalRequests';
import { Notifications } from './collections/Notifications';
import { Conversations } from './collections/Conversations';
import { UserAgents } from './collections/UserAgents';
import { SupportTickets } from './collections/SupportTickets';



const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      actions: ["@/components/back-to-dashboard#BackToDashboard"]
    }
  },
  collections: [Users, Media, Categories, Products, Tags, Tenants, Orders, Reviews, Disputes, WithdrawalRequests, Notifications, Conversations, UserAgents, SupportTickets],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    multiTenantPlugin<Config>({
      collections: {
        products: {
          useBaseListFilter: true, // Filter products by user's tenants
        },
      },
      tenantsArrayField: {
        includeDefaultField: true, // Let the plugin add the tenants field automatically
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
    // Cloudflare R2 Storage Adapter
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.CLOUDFLARE_R2_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
        },
        region: process.env.CLOUDFLARE_R2_REGION || 'auto',
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
        // Force path-style for R2 compatibility
        forcePathStyle: true,
      },
    }),
  ],
})
