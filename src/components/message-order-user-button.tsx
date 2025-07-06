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

interface MessageOrderUserButtonProps {
  orderId: string;
  recipientId: string; // Could be seller or buyer depending on context
  orderReference: string;
  className?: string;
  buttonText?: string;
}

export function MessageOrderUserButton({ 
  orderId, 
  recipientId, 
  orderReference, 
  className,
  buttonText = "Message" 
}: MessageOrderUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState(`Question about order ${orderReference}`);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const trpc = useTRPC();

  const createConversationMutation = useMutation(trpc.conversations.createConversation.mutationOptions({
    onSuccess: (result) => {
      toast.success("Message sent successfully!");
      setIsOpen(false);
      setMessage("");
      setSubject(`Question about order ${orderReference}`);
      
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
      recipientId: recipientId,
      subject: subject,
      message: message,
      orderId: orderId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className} variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] mx-4 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{buttonText}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What would you like to ask about?"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I have a question about this order..."
              rows={4}
              className="resize-none text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={createConversationMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={createConversationMutation.isPending || !message.trim() || !subject.trim()}
              className="w-full sm:w-auto"
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
