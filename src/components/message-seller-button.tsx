"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MessageSellerButtonProps {
  productId: string;
  sellerId: string;
  productName: string;
  className?: string;
}

export function MessageSellerButton({ productId, sellerId, productName, className }: MessageSellerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState(`Inquiry about ${productName}`);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const trpc = useTRPC();

  const createConversationMutation = useMutation(trpc.conversations.createConversation.mutationOptions({
    onSuccess: (result) => {
      toast.success("Message sent successfully!");
      setIsOpen(false);
      setMessage("");
      setSubject(`Inquiry about ${productName}`);
      
      // Navigate to messages page with conversation selected
      router.push(`/dashboard/messages?conversation=${result.conversationId}`);
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast.error(error.message || "Failed to send message. Please try again.");
    }
  }));

  const handleSendMessage = () => {
    if (!message.trim() || !subject.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    createConversationMutation.mutate({
      type: 'conversation',
      recipientId: sellerId,
      subject: subject,
      message: message,
      productId: productId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className} variant="outline">
          <MessageCircle className="h-4 w-4 mr-2" />
          Message Seller
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Message Seller</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What would you like to ask about?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in this product..."
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={createConversationMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={createConversationMutation.isPending || !message.trim() || !subject.trim()}
            >
              {createConversationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
