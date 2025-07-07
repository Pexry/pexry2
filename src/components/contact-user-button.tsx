'use client'

/**
 * Contact User Button Components
 * 
 * These components provide an easy way to initiate buyer-seller conversations
 * from product pages, order pages, or anywhere users need to contact each other.
 * 
 * Usage Examples:
 * 
 * On a product page:
 * <ContactSellerButton 
 *   sellerId={product.seller.id} 
 *   sellerName={product.seller.name}
 *   productId={product.id}
 * />
 * 
 * On an order page (for buyers):
 * <ContactSellerButton 
 *   sellerId={order.seller.id} 
 *   sellerName={order.seller.name}
 *   productId={order.product.id}
 *   orderId={order.id}
 * />
 * 
 * On an order page (for sellers):
 * <ContactBuyerButton 
 *   buyerId={order.buyer.id} 
 *   buyerName={order.buyer.name}
 *   orderId={order.id}
 * />
 */

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ContactUserButtonProps {
  recipientId: string
  recipientName?: string
  productId?: string
  orderId?: string
  buttonText?: string
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost'
  children?: React.ReactNode
}

export function ContactUserButton({
  recipientId,
  recipientName,
  productId,
  orderId,
  buttonText = 'Contact User',
  buttonVariant = 'default',
  children
}: ContactUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const trpc = useTRPC()

  const createConversationMutation = useMutation(trpc.conversations.createConversation.mutationOptions({
    onSuccess: (data: any) => {
      setIsOpen(false)
      setMessage('')
      toast.success('Message sent! Redirecting to conversation...')
      // Redirect to messages page with the conversation selected
      router.push(`/dashboard/messages?conversation=${data.conversationId}`)
    },
    onError: (error: any) => {
      toast.error('Failed to send message: ' + error.message)
    }
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      toast.error('Message is required')
      return
    }

    // Generate a subject based on context
    let subject = `Message to ${recipientName || 'user'}`
    if (productId && orderId) {
      subject = `Order inquiry - Order #${orderId.slice(-6)}`
    } else if (productId) {
      subject = `Product inquiry`
    }

    createConversationMutation.mutate({
      type: 'conversation',
      subject,
      message: message.trim(),
      recipientId,
      productId,
      orderId,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={buttonVariant}>
            <MessageCircle className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] mx-4">
        <DialogHeader>
          <DialogTitle>
            Contact {recipientName || 'User'}
          </DialogTitle>
          {(productId || orderId) && (
            <p className="text-sm text-gray-600">
              {orderId && `Regarding Order #${orderId.slice(-6)}`}
              {productId && !orderId && 'Regarding this product'}
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              required
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={createConversationMutation.isPending} className="w-full sm:w-auto">
              {createConversationMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Convenience components for common use cases
export function ContactSellerButton({ 
  sellerId, 
  sellerName, 
  productId, 
  orderId,
  ...props 
}: Omit<ContactUserButtonProps, 'recipientId' | 'buttonText'> & { 
  sellerId: string
  sellerName?: string 
}) {
  return (
    <ContactUserButton
      recipientId={sellerId}
      recipientName={sellerName}
      productId={productId}
      orderId={orderId}
      buttonText="Contact Seller"
      {...props}
    />
  )
}

export function ContactBuyerButton({ 
  buyerId, 
  buyerName, 
  productId, 
  orderId,
  ...props 
}: Omit<ContactUserButtonProps, 'recipientId' | 'buttonText'> & { 
  buyerId: string
  buyerName?: string 
}) {
  return (
    <ContactUserButton
      recipientId={buyerId}
      recipientName={buyerName}
      productId={productId}
      orderId={orderId}
      buttonText="Contact Buyer"
      {...props}
    />
  )
}
