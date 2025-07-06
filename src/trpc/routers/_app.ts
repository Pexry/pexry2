import { createTRPCRouter } from '../init';

import { authRouter } from '@/modules/auth/server/procedures';
import { tagsRouter } from '@/modules/tags/server/procedures';
import { reviewsRouter } from '@/modules/reviews/server/procedures';
import { libraryRouter } from '@/modules/library/server/procedures';
import { tenantsRouter } from '@/modules/tenants/server/procedures';
import { checkoutRouter } from '@/modules/checkout/server/procedures';
import { productsRouter } from '@/modules/products/server/procedures';
import { categoriesRouter } from '@/modules/categories/server/procedures';
import { userRouter } from '@/modules/users/server/procedures';
import { dashboardRouter } from '@/modules/dashboard/server/procedures';
import { ordersRouter } from '@/modules/orders/server/procedures';
import { disputesRouter } from '@/modules/disputes/server/procedures';
import { notificationsRouter } from '@/modules/notifications/server/procedures';
import { conversationsRouter } from '@/modules/conversations/server/procedures';
import { userAgentRouter } from '@/modules/user-agents/server/procedures';
import { supportRouter } from '@/modules/support/server/procedures';
import { productRouter } from '@/server/routers/products';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  tags: tagsRouter,
  tenants: tenantsRouter,
  reviews: reviewsRouter,
  checkout: checkoutRouter,
  library: libraryRouter,
  products: productsRouter,
  categories: categoriesRouter,
  user: userRouter,
  dashboard: dashboardRouter,
  orders: ordersRouter,
  disputes: disputesRouter,
  notifications: notificationsRouter,
  conversations: conversationsRouter,
  userAgents: userAgentRouter,
  support: supportRouter,
  product: productRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;