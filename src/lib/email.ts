import nodemailer from 'nodemailer';

// Create SMTP transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export interface EmailNotificationParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private defaultFrom: string;

  constructor() {
    this.defaultFrom = process.env.GMAIL_FROM_EMAIL || process.env.GMAIL_USER || 'noreply@pexry.com';
  }

  async sendEmail(params: EmailNotificationParams): Promise<boolean> {
    try {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('Gmail credentials not configured, skipping email notification');
        return false;
      }

      const transporter = createTransporter();
      
      const mailOptions = {
        from: params.from || this.defaultFrom,
        to: params.to,
        subject: params.subject,
        html: params.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  // Payment confirmation email template
  async sendPaymentConfirmationEmail(params: {
    userEmail: string;
    userName: string;
    orderId: string;
    productName: string;
    amount: number;
    transactionId: string;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .success-icon { background: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
            .detail { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
            .detail strong { color: #374151; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmed! ✅</h1>
            </div>
            <div class="content">
              <div class="success-icon">✓</div>
              <h2 style="text-align: center; color: #374151; margin-bottom: 30px;">Thank you for your purchase, ${params.userName}!</h2>
              
              <p style="color: #6b7280; line-height: 1.6;">Your payment has been successfully processed and confirmed. Here are the details of your purchase:</p>
              
              <div class="detail">
                <strong>Product:</strong> ${params.productName}
              </div>
              
              <div class="detail">
                <strong>Order ID:</strong> ${params.orderId}
              </div>
              
              <div class="detail">
                <strong>Amount Paid:</strong> $${params.amount.toFixed(2)} USD
              </div>
              
              <div class="detail">
                <strong>Transaction ID:</strong> ${params.transactionId}
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pexry.com'}/dashboard/orders/${params.orderId}" class="button">View Order Details</a>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
                Your digital product will be delivered automatically to your account. You can access it from your dashboard.
              </p>
            </div>
            <div class="footer">
              <p>If you have any questions, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} Pexry. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.userEmail,
      subject: `Payment Confirmed - Order #${params.orderId}`,
      html,
    });
  }

  // Seller notification email template
  async sendSellerSaleNotificationEmail(params: {
    sellerEmail: string;
    sellerName: string;
    orderId: string;
    productName: string;
    amount: number;
    buyerName: string;
    earnings: number;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Sale Notification</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .celebration-icon { background: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
            .detail { margin: 15px 0; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; }
            .detail strong { color: #374151; }
            .earnings { background: #dcfce7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .earnings-amount { font-size: 32px; font-weight: bold; color: #059669; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Sale!</h1>
            </div>
            <div class="content">
              <div class="celebration-icon">💰</div>
              <h2 style="text-align: center; color: #374151; margin-bottom: 30px;">Congratulations, ${params.sellerName}!</h2>
              
              <p style="color: #6b7280; line-height: 1.6;">Great news! You've made a new sale. Here are the details:</p>
              
              <div class="detail">
                <strong>Product Sold:</strong> ${params.productName}
              </div>
              
              <div class="detail">
                <strong>Buyer:</strong> ${params.buyerName}
              </div>
              
              <div class="detail">
                <strong>Order ID:</strong> ${params.orderId}
              </div>
              
              <div class="detail">
                <strong>Sale Amount:</strong> $${params.amount.toFixed(2)} USD
              </div>
              
              <div class="earnings">
                <div style="color: #059669; font-size: 18px; margin-bottom: 10px;">Your Earnings</div>
                <div class="earnings-amount">$${params.earnings.toFixed(2)}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Added to your available balance</div>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pexry.com'}/dashboard/orders/${params.orderId}" class="button">View Order Details</a>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
                Keep up the great work! Your earnings have been added to your available balance and can be withdrawn from your dashboard.
              </p>
            </div>
            <div class="footer">
              <p>Keep selling and earning with Pexry!</p>
              <p>© ${new Date().getFullYear()} Pexry. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.sellerEmail,
      subject: `🎉 New Sale: ${params.productName} - Order #${params.orderId}`,
      html,
    });
  }

  // Dispute opened email template
  async sendDisputeOpenedEmail(params: {
    userEmail: string;
    userName: string;
    disputeId: string;
    productName: string;
    orderId: string;
    disputeSubject: string;
    userRole: 'buyer' | 'seller';
  }): Promise<boolean> {
    const isSeller = params.userRole === 'seller';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dispute ${isSeller ? 'Opened' : 'Submitted'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .warning-icon { background: #f59e0b; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
            .detail { margin: 15px 0; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; }
            .detail strong { color: #374151; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isSeller ? '⚠️ Dispute Opened' : '📝 Dispute Submitted'}</h1>
            </div>
            <div class="content">
              <div class="warning-icon">⚠️</div>
              <h2 style="text-align: center; color: #374151; margin-bottom: 30px;">Hello ${params.userName},</h2>
              
              <p style="color: #6b7280; line-height: 1.6;">
                ${isSeller 
                  ? 'A dispute has been opened against one of your products. Please review the details below and respond accordingly.'
                  : 'Your dispute has been successfully submitted and is now under review. Here are the details:'
                }
              </p>
              
              <div class="detail">
                <strong>Product:</strong> ${params.productName}
              </div>
              
              <div class="detail">
                <strong>Order ID:</strong> ${params.orderId}
              </div>
              
              <div class="detail">
                <strong>Dispute Subject:</strong> ${params.disputeSubject}
              </div>
              
              <div class="detail">
                <strong>Dispute ID:</strong> ${params.disputeId}
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pexry.com'}/dashboard/disputes/${params.disputeId}" class="button">View Dispute Details</a>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
                ${isSeller 
                  ? 'Please respond to this dispute as soon as possible to help resolve the matter quickly.'
                  : 'We will review your dispute and work to resolve it fairly. You will be notified of any updates.'
                }
              </p>
            </div>
            <div class="footer">
              <p>For questions about disputes, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} Pexry. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.userEmail,
      subject: `${isSeller ? '⚠️ Dispute Opened' : '📝 Dispute Submitted'} - Order #${params.orderId}`,
      html,
    });
  }

  // Dispute resolved email template
  async sendDisputeResolvedEmail(params: {
    userEmail: string;
    userName: string;
    disputeId: string;
    productName: string;
    resolution: string;
    userWon: boolean;
    amount?: number;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dispute Resolved</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, ${params.userWon ? '#10b981 0%, #059669 100%' : '#6b7280 0%, #4b5563 100%'}); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .result-icon { background: ${params.userWon ? '#10b981' : '#6b7280'}; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
            .detail { margin: 15px 0; padding: 15px; background: ${params.userWon ? '#f0fdf4' : '#f9fafb'}; border-radius: 8px; border-left: 4px solid ${params.userWon ? '#10b981' : '#6b7280'}; }
            .detail strong { color: #374151; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: ${params.userWon ? '#10b981' : '#6b7280'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${params.userWon ? '✅ Dispute Resolved in Your Favor' : '❌ Dispute Resolved'}</h1>
            </div>
            <div class="content">
              <div class="result-icon">${params.userWon ? '✓' : '✗'}</div>
              <h2 style="text-align: center; color: #374151; margin-bottom: 30px;">Hello ${params.userName},</h2>
              
              <p style="color: #6b7280; line-height: 1.6;">
                The dispute for "${params.productName}" has been resolved. ${params.userWon ? 'Good news - it was resolved in your favor!' : 'Unfortunately, it was not resolved in your favor.'}
              </p>
              
              <div class="detail">
                <strong>Product:</strong> ${params.productName}
              </div>
              
              <div class="detail">
                <strong>Resolution:</strong> ${params.resolution}
              </div>
              
              ${params.amount ? `
              <div class="detail">
                <strong>Amount:</strong> $${params.amount.toFixed(2)} USD
              </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pexry.com'}/dashboard/disputes/${params.disputeId}" class="button">View Dispute Details</a>
              </div>
              
              ${params.userWon ? `
              <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
                ${params.amount ? `The amount of $${params.amount.toFixed(2)} will be processed according to the resolution.` : 'The resolution will be processed according to our policies.'}
              </p>
              ` : ''}
            </div>
            <div class="footer">
              <p>Thank you for using our dispute resolution system.</p>
              <p>© ${new Date().getFullYear()} Pexry. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.userEmail,
      subject: `${params.userWon ? '✅ Dispute Resolved in Your Favor' : '❌ Dispute Resolved'} - ${params.productName}`,
      html,
    });
  }

  // Withdrawal status update email template
  async sendWithdrawalStatusEmail(params: {
    userEmail: string;
    userName: string;
    withdrawalId: string;
    amount: number;
    status: 'approved' | 'rejected' | 'paid';
    rejectionReason?: string;
  }): Promise<boolean> {
    const isPaid = params.status === 'paid';
    const isRejected = params.status === 'rejected';
    const isApproved = params.status === 'approved';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Withdrawal ${isPaid ? 'Completed' : isRejected ? 'Rejected' : 'Approved'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, ${isPaid ? '#10b981 0%, #059669 100%' : isRejected ? '#ef4444 0%, #dc2626 100%' : '#3b82f6 0%, #2563eb 100%'}); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .status-icon { background: ${isPaid ? '#10b981' : isRejected ? '#ef4444' : '#3b82f6'}; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
            .detail { margin: 15px 0; padding: 15px; background: ${isPaid ? '#f0fdf4' : isRejected ? '#fef2f2' : '#eff6ff'}; border-radius: 8px; border-left: 4px solid ${isPaid ? '#10b981' : isRejected ? '#ef4444' : '#3b82f6'}; }
            .detail strong { color: #374151; }
            .amount { background: ${isPaid ? '#dcfce7' : isRejected ? '#fee2e2' : '#dbeafe'}; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .amount-value { font-size: 32px; font-weight: bold; color: ${isPaid ? '#059669' : isRejected ? '#dc2626' : '#2563eb'}; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: ${isPaid ? '#10b981' : isRejected ? '#ef4444' : '#3b82f6'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isPaid ? '💰 Withdrawal Completed' : isRejected ? '❌ Withdrawal Rejected' : '✅ Withdrawal Approved'}</h1>
            </div>
            <div class="content">
              <div class="status-icon">${isPaid ? '💰' : isRejected ? '✗' : '✓'}</div>
              <h2 style="text-align: center; color: #374151; margin-bottom: 30px;">Hello ${params.userName},</h2>
              
              <p style="color: #6b7280; line-height: 1.6;">
                ${isPaid 
                  ? 'Great news! Your withdrawal request has been completed and the funds have been sent to your account.'
                  : isRejected 
                  ? 'We regret to inform you that your withdrawal request has been rejected.'
                  : 'Good news! Your withdrawal request has been approved and will be processed soon.'
                }
              </p>
              
              <div class="amount">
                <div style="color: ${isPaid ? '#059669' : isRejected ? '#dc2626' : '#2563eb'}; font-size: 18px; margin-bottom: 10px;">Withdrawal Amount</div>
                <div class="amount-value">$${params.amount.toFixed(2)}</div>
              </div>
              
              <div class="detail">
                <strong>Withdrawal ID:</strong> ${params.withdrawalId}
              </div>
              
              <div class="detail">
                <strong>Status:</strong> ${isPaid ? 'Completed' : isRejected ? 'Rejected' : 'Approved'}
              </div>
              
              ${isRejected && params.rejectionReason ? `
              <div class="detail">
                <strong>Reason:</strong> ${params.rejectionReason}
              </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pexry.com'}/dashboard/payout" class="button">View Payout Dashboard</a>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
                ${isPaid 
                  ? 'The funds should appear in your account within the next few business days.'
                  : isRejected 
                  ? 'The funds have been returned to your available balance. You can request a new withdrawal after addressing the issue.'
                  : 'Your withdrawal will be processed within the next few business days.'
                }
              </p>
            </div>
            <div class="footer">
              <p>If you have any questions, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} Pexry. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.userEmail,
      subject: `${isPaid ? '💰 Withdrawal Completed' : isRejected ? '❌ Withdrawal Rejected' : '✅ Withdrawal Approved'} - $${params.amount.toFixed(2)}`,
      html,
    });
  }

  // Support ticket resolved email template
  async sendSupportTicketResolvedEmail(params: {
    userEmail: string;
    userName: string;
    ticketId: string;
    ticketSubject: string;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Ticket Resolved</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .success-icon { background: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
            .detail { margin: 15px 0; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; }
            .detail strong { color: #374151; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Support Ticket Resolved</h1>
            </div>
            <div class="content">
              <div class="success-icon">✓</div>
              <h2 style="text-align: center; color: #374151; margin-bottom: 30px;">Hello ${params.userName},</h2>
              
              <p style="color: #6b7280; line-height: 1.6;">
                Great news! Your support ticket has been resolved by our team. We hope we were able to help you with your issue.
              </p>
              
              <div class="detail">
                <strong>Ticket Subject:</strong> ${params.ticketSubject}
              </div>
              
              <div class="detail">
                <strong>Ticket ID:</strong> ${params.ticketId}
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pexry.com'}/dashboard/support/tickets/${params.ticketId}" class="button">View Ticket Details</a>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
                If you have any further questions or need additional assistance, please don't hesitate to create a new support ticket.
              </p>
            </div>
            <div class="footer">
              <p>Thank you for using Pexry support!</p>
              <p>© ${new Date().getFullYear()} Pexry. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.userEmail,
      subject: `✅ Support Ticket Resolved - ${params.ticketSubject}`,
      html,
    });
  }

  // New message notification email template
  async sendNewMessageEmail(params: {
    userEmail: string;
    userName: string;
    conversationId: string;
    conversationSubject: string;
    senderName: string;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Message</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .message-icon { background: #3b82f6; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
            .detail { margin: 15px 0; padding: 15px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .detail strong { color: #374151; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Message</h1>
            </div>
            <div class="content">
              <div class="message-icon">💬</div>
              <h2 style="text-align: center; color: #374151; margin-bottom: 30px;">Hello ${params.userName},</h2>
              
              <p style="color: #6b7280; line-height: 1.6;">
                You have received a new message from ${params.senderName}. Please check your messages to continue the conversation.
              </p>
              
              <div class="detail">
                <strong>Conversation:</strong> ${params.conversationSubject}
              </div>
              
              <div class="detail">
                <strong>From:</strong> ${params.senderName}
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://pexry.com'}/dashboard/messages?conversation=${params.conversationId}" class="button">View Message</a>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6; margin-top: 30px;">
                Click the button above to read and reply to the message.
              </p>
            </div>
            <div class="footer">
              <p>Stay connected with Pexry messaging!</p>
              <p>© ${new Date().getFullYear()} Pexry. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.userEmail,
      subject: `💬 New Message from ${params.senderName} - ${params.conversationSubject}`,
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
