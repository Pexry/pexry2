import type { CollectionConfig } from "payload";
import { createNotificationService } from "@/lib/notifications";
import { isSuperAdmin } from "@/lib/access";

export const WithdrawalRequests: CollectionConfig = {
  slug: "withdrawal-requests",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "amount", "status", "createdAt"],
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  access: {
    read: ({ req }) => {
      if (req.user && req.user.roles?.includes("super-admin")) return true;
      if (req.user) return { user: { equals: req.user.id } };
      return false;
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => !!req.user && !!req.user.roles?.includes("super-admin"),
    delete: ({ req }) => !!req.user && !!req.user.roles?.includes("super-admin"),
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "amount",
      type: "number",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      options: ["pending", "approved", "paid", "rejected"],
      defaultValue: "pending",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "adminNote",
      type: "textarea",
      required: false,
      admin: { position: "sidebar" },
    },
    {
      name: "paidAt",
      label: "Paid At",
      type: "date",
      required: false,
      admin: { position: "sidebar" },
    },
    {
      name: "paidBy",
      label: "Paid By (Admin)",
      type: "relationship",
      relationTo: "users",
      required: false,
      admin: { position: "sidebar" },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        // Only check on create operations
        if (operation !== 'create' || !data) return;
        
        const userId = typeof data.user === 'string' ? data.user : data.user?.id;
        if (!userId) return;

        // Check for existing pending/approved withdrawal requests
        const existingRequests = await req.payload.find({
          collection: 'withdrawal-requests',
          where: {
            and: [
              { user: { equals: userId } },
              { 
                status: { 
                  in: ['pending', 'approved'] 
                } 
              }
            ]
          },
          limit: 1,
        });

        if (existingRequests.docs.length > 0) {
          const existingRequest = existingRequests.docs[0];
          const status = existingRequest?.status || 'pending';
          throw new Error(`User already has a ${status} withdrawal request. Please wait for it to be processed before submitting a new request.`);
        }
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const userId = typeof doc.user === 'string' ? doc.user : doc.user?.id;
        if (!userId) {
          console.warn('❌ No userId found in withdrawal request:', doc);
          return;
        }

        console.log(`🔄 Withdrawal hook triggered - Operation: ${operation}, User: ${userId}, Status: ${doc.status}`);
        
        // Handle withdrawal status changes and send notifications
        if (operation === 'update' && previousDoc?.status !== doc.status) {
          console.log(`🔄 Withdrawal status changed from "${previousDoc?.status}" to "${doc.status}" for user ${userId}`);
          
          try {
            const notificationService = createNotificationService(req.payload);
            
            if (doc.status === 'paid' && previousDoc?.status !== 'paid') {
              console.log(`🔄 Processing withdrawal payment for user ${userId}, amount: ${doc.amount}`);
              
              // Set paidAt and paidBy (avoid infinite loop by checking if already set)
              if (!doc.paidAt || !doc.paidBy) {
                console.log('📝 Setting paidAt and paidBy fields...');
                await req.payload.update({
                  collection: 'withdrawal-requests',
                  id: doc.id,
                  data: {
                    paidAt: doc.paidAt || new Date().toISOString(),
                    paidBy: doc.paidBy || req.user?.id,
                  },
                });
              }
              
              // Subtract the withdrawn amount from availableForWithdrawal
              console.log('👤 Fetching user to update balance...');
              const user = await req.payload.findByID({ collection: 'users', id: userId });
              const current = typeof user.availableForWithdrawal === 'number' ? user.availableForWithdrawal : 0;
              const newBalance = Math.max(0, current - (doc.amount || 0));
              
              console.log(`💰 Updating balance: ${current} - ${doc.amount} = ${newBalance}`);
              
              try {
                await req.payload.update({
                  collection: 'users',
                  id: userId,
                  data: { availableForWithdrawal: newBalance },
                });
                console.log('✅ Successfully updated user balance');
              } catch (updateError) {
                console.error('❌ Failed to update user balance:', updateError);
                throw updateError;
              }

              // Send paid notification
              console.log('📧 Sending notification...');
              await notificationService.notifyWithdrawalStatusUpdate({
                userId,
                withdrawalId: doc.id,
                amount: doc.amount || 0,
                status: 'paid',
              });
              console.log('✅ Withdrawal processing completed successfully');
            } else if (doc.status === 'rejected' && previousDoc?.status !== 'rejected') {
              // Send rejection notification
              await notificationService.notifyWithdrawalStatusUpdate({
                userId,
                withdrawalId: doc.id,
                amount: doc.amount || 0,
                status: 'rejected',
                rejectionReason: doc.adminNote || undefined,
              });
            } else if (doc.status === 'approved' && previousDoc?.status !== 'approved') {
              // Send approval notification
              await notificationService.notifyWithdrawalStatusUpdate({
                userId,
                withdrawalId: doc.id,
                amount: doc.amount || 0,
                status: 'approved',
              });
            }
          } catch (error) {
            console.error('❌ Failed to process withdrawal status change:', error);
            console.error('Error details:', {
              userId,
              withdrawalId: doc.id,
              amount: doc.amount,
              status: doc.status,
              previousStatus: previousDoc?.status
            });
            // Re-throw the error so it's visible to the admin
            throw new Error(`Failed to process withdrawal: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      },
    ],
  },
};
