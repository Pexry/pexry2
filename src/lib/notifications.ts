import { BasePayload } from 'payload'
import { emailService } from './email'

export interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: 'sale' | 'dispute_opened' | 'dispute_resolved' | 'withdrawal_paid' | 'withdrawal_rejected' | 'general' | 'message'
  metadata?: Record<string, unknown>
  actionUrl?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export class NotificationService {
  private db: BasePayload

  constructor(db: BasePayload) {
    this.db = db
  }

  async createNotification(params: CreateNotificationParams) {
    try {
      const notification = await this.db.create({
        collection: 'notifications',
        data: {
          user: params.userId,
          title: params.title,
          message: params.message,
          type: params.type,
          metadata: params.metadata || {},
          actionUrl: params.actionUrl,
          priority: params.priority || 'normal',
          read: false,
        },
      })

      return notification
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  // Specific notification methods for different events
  async notifySale(params: {
    sellerId: string
    orderAmount: number
    productName: string
    orderId: string
    buyerName?: string
  }) {
    // Create in-app notification
    const notification = await this.createNotification({
      userId: params.sellerId,
      title: '🎉 New Sale!',
      message: `Great news! You sold "${params.productName}" for $${params.orderAmount.toFixed(2)}${params.buyerName ? ` to ${params.buyerName}` : ''}.`,
      type: 'sale',
      metadata: {
        orderId: params.orderId,
        orderAmount: params.orderAmount,
        productName: params.productName,
      },
      actionUrl: `/dashboard/orders/${params.orderId}`,
      priority: 'high',
    })

    // Send email notification to seller
    try {
      const seller = await this.db.findByID({ collection: 'users', id: params.sellerId })
      const sellerEmail = seller.email
      const sellerName = (seller as any).username || seller.email

      if (sellerEmail) {
        const earnings = params.orderAmount * 0.9 // 90% to seller
        await emailService.sendSellerSaleNotificationEmail({
          sellerEmail,
          sellerName,
          orderId: params.orderId,
          productName: params.productName,
          amount: params.orderAmount,
          buyerName: params.buyerName || 'Anonymous',
          earnings,
        })
      }
    } catch (error) {
      console.error('Failed to send seller email notification:', error)
    }

    return notification
  }

  // New method for payment confirmation emails
  async notifyPaymentConfirmed(params: {
    buyerId: string
    orderId: string
    productName: string
    amount: number
    transactionId: string
  }) {
    try {
      const buyer = await this.db.findByID({ collection: 'users', id: params.buyerId })
      const buyerEmail = buyer.email
      const buyerName = (buyer as any).username || buyer.email

      if (buyerEmail) {
        await emailService.sendPaymentConfirmationEmail({
          userEmail: buyerEmail,
          userName: buyerName,
          orderId: params.orderId,
          productName: params.productName,
          amount: params.amount,
          transactionId: params.transactionId,
        })
      }
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error)
    }
  }

  async notifyDisputeOpened(params: {
    sellerId: string
    buyerId: string
    disputeId: string
    orderId: string
    productName: string
    disputeSubject: string
  }) {
    // Notify seller
    const sellerNotification = await this.createNotification({
      userId: params.sellerId,
      title: '⚠️ New Dispute Opened',
      message: `A dispute has been opened for your product "${params.productName}". Subject: ${params.disputeSubject}`,
      type: 'dispute_opened',
      metadata: {
        disputeId: params.disputeId,
        orderId: params.orderId,
        productName: params.productName,
        role: 'seller',
      },
      actionUrl: `/dashboard/disputes/${params.disputeId}`,
      priority: 'urgent',
    })

    // Send email to seller
    try {
      const seller = await this.db.findByID({ collection: 'users', id: params.sellerId })
      if (seller.email) {
        await emailService.sendDisputeOpenedEmail({
          userEmail: seller.email,
          userName: (seller as any).username || seller.email,
          disputeId: params.disputeId,
          productName: params.productName,
          orderId: params.orderId,
          disputeSubject: params.disputeSubject,
          userRole: 'seller',
        })
      }
    } catch (error) {
      console.error('Failed to send dispute email to seller:', error)
    }

    // Notify buyer (confirmation)
    const buyerNotification = await this.createNotification({
      userId: params.buyerId,
      title: '📝 Dispute Submitted',
      message: `Your dispute for "${params.productName}" has been submitted and is being reviewed.`,
      type: 'dispute_opened',
      metadata: {
        disputeId: params.disputeId,
        orderId: params.orderId,
        productName: params.productName,
        role: 'buyer',
      },
      actionUrl: `/dashboard/disputes/${params.disputeId}`,
      priority: 'high',
    })

    // Send email to buyer
    try {
      const buyer = await this.db.findByID({ collection: 'users', id: params.buyerId })
      if (buyer.email) {
        await emailService.sendDisputeOpenedEmail({
          userEmail: buyer.email,
          userName: (buyer as any).username || buyer.email,
          disputeId: params.disputeId,
          productName: params.productName,
          orderId: params.orderId,
          disputeSubject: params.disputeSubject,
          userRole: 'buyer',
        })
      }
    } catch (error) {
      console.error('Failed to send dispute email to buyer:', error)
    }

    return buyerNotification
  }

  async notifyDisputeResolved(params: {
    sellerId: string
    buyerId: string
    disputeId: string
    resolution: string
    inFavorOfSeller: boolean
    orderAmount: number
    productName: string
  }) {
    const winnerUserId = params.inFavorOfSeller ? params.sellerId : params.buyerId
    const loserUserId = params.inFavorOfSeller ? params.buyerId : params.sellerId

    // Notify winner
    const winnerNotification = await this.createNotification({
      userId: winnerUserId,
      title: '✅ Dispute Resolved in Your Favor',
      message: `Good news! The dispute for "${params.productName}" has been resolved in your favor. ${params.inFavorOfSeller ? `Funds ($${params.orderAmount.toFixed(2)}) have been released to your account.` : `You will receive a refund of $${params.orderAmount.toFixed(2)}.`}`,
      type: 'dispute_resolved',
      metadata: {
        disputeId: params.disputeId,
        resolution: params.resolution,
        won: true,
        orderAmount: params.orderAmount,
        productName: params.productName,
      },
      actionUrl: `/dashboard/disputes/${params.disputeId}`,
      priority: 'high',
    })

    // Send email to winner
    try {
      const winner = await this.db.findByID({ collection: 'users', id: winnerUserId })
      if (winner.email) {
        await emailService.sendDisputeResolvedEmail({
          userEmail: winner.email,
          userName: (winner as any).username || winner.email,
          disputeId: params.disputeId,
          productName: params.productName,
          resolution: params.resolution,
          userWon: true,
          amount: params.orderAmount,
        })
      }
    } catch (error) {
      console.error('Failed to send dispute resolved email to winner:', error)
    }

    // Notify loser
    const loserNotification = await this.createNotification({
      userId: loserUserId,
      title: '❌ Dispute Resolved',
      message: `The dispute for "${params.productName}" has been resolved. Unfortunately, it was not resolved in your favor. Resolution: ${params.resolution}`,
      type: 'dispute_resolved',
      metadata: {
        disputeId: params.disputeId,
        resolution: params.resolution,
        won: false,
        orderAmount: params.orderAmount,
        productName: params.productName,
      },
      actionUrl: `/dashboard/disputes/${params.disputeId}`,
      priority: 'normal',
    })

    // Send email to loser
    try {
      const loser = await this.db.findByID({ collection: 'users', id: loserUserId })
      if (loser.email) {
        await emailService.sendDisputeResolvedEmail({
          userEmail: loser.email,
          userName: (loser as any).username || loser.email,
          disputeId: params.disputeId,
          productName: params.productName,
          resolution: params.resolution,
          userWon: false,
          amount: params.orderAmount,
        })
      }
    } catch (error) {
      console.error('Failed to send dispute resolved email to loser:', error)
    }

    return loserNotification
  }

  async notifyWithdrawalStatusUpdate(params: {
    userId: string
    withdrawalId: string
    amount: number
    status: 'approved' | 'rejected' | 'paid'
    rejectionReason?: string
  }) {
    const isPaid = params.status === 'paid'
    const isRejected = params.status === 'rejected'

    const notification = await this.createNotification({
      userId: params.userId,
      title: isPaid ? '💰 Withdrawal Completed' : isRejected ? '❌ Withdrawal Rejected' : '✅ Withdrawal Approved',
      message: isPaid 
        ? `Your withdrawal of $${params.amount.toFixed(2)} has been processed and sent to your account.`
        : isRejected 
        ? `Your withdrawal request of $${params.amount.toFixed(2)} was rejected. ${params.rejectionReason ? `Reason: ${params.rejectionReason}` : ''}`
        : `Your withdrawal request of $${params.amount.toFixed(2)} has been approved and will be processed soon.`,
      type: isPaid ? 'withdrawal_paid' : 'withdrawal_rejected',
      metadata: {
        withdrawalId: params.withdrawalId,
        amount: params.amount,
        status: params.status,
        rejectionReason: params.rejectionReason,
      },
      actionUrl: '/dashboard/payout',
      priority: isPaid ? 'high' : isRejected ? 'normal' : 'normal',
    })

    // Send email notification
    try {
      const user = await this.db.findByID({ collection: 'users', id: params.userId })
      if (user.email) {
        await emailService.sendWithdrawalStatusEmail({
          userEmail: user.email,
          userName: (user as any).username || user.email,
          withdrawalId: params.withdrawalId,
          amount: params.amount,
          status: params.status,
          rejectionReason: params.rejectionReason,
        })
      }
    } catch (error) {
      console.error('Failed to send withdrawal status email:', error)
    }

    return notification
  }

  async createSupportTicketResolvedNotification(
    userId: string,
    ticketSubject: string,
    ticketId: string
  ) {
    const notification = await this.createNotification({
      userId,
      title: '✅ Support Ticket Resolved',
      message: `Your support ticket "${ticketSubject}" has been resolved by our team.`,
      type: 'general',
      metadata: {
        ticketId,
        ticketSubject,
      },
      actionUrl: `/dashboard/support/tickets/${ticketId}`,
      priority: 'normal',
    })

    // Send email notification
    try {
      const user = await this.db.findByID({ collection: 'users', id: userId })
      if (user.email) {
        await emailService.sendSupportTicketResolvedEmail({
          userEmail: user.email,
          userName: (user as any).username || user.email,
          ticketId,
          ticketSubject,
        })
      }
    } catch (error) {
      console.error('Failed to send support ticket resolved email:', error)
    }

    return notification
  }

  async createDirectMessageNotification(
    userId: string,
    conversationSubject: string,
    conversationId: string,
    senderName?: string
  ) {
    const notification = await this.createNotification({
      userId,
      title: '💬 New Message',
      message: `You have a new message in "${conversationSubject}".`,
      type: 'message',
      metadata: {
        conversationId,
        conversationSubject,
      },
      actionUrl: `/dashboard/messages?conversation=${conversationId}`,
      priority: 'normal',
    })

    // Send email notification
    try {
      const user = await this.db.findByID({ collection: 'users', id: userId })
      if (user.email) {
        await emailService.sendNewMessageEmail({
          userEmail: user.email,
          userName: (user as any).username || user.email,
          conversationId,
          conversationSubject,
          senderName: senderName || 'Someone',
        })
      }
    } catch (error) {
      console.error('Failed to send new message email:', error)
    }

    return notification
  }
}

// Factory function to create NotificationService with BasePayload
export const createNotificationService = (db: BasePayload): NotificationService => {
  return new NotificationService(db)
}
