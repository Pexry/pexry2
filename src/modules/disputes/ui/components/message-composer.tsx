"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";

interface MessageComposerProps {
  disputeId: string;
  disabled?: boolean;
  onMessageSent?: () => void;
}

export const MessageComposer = ({ disputeId, disabled = false, onMessageSent }: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const addMessage = useMutation({
    ...trpc.disputes.addMessage.mutationOptions(),
    onSuccess: () => {
      toast.success("Message sent successfully");
      setMessage("");
      // Invalidate all disputes queries to refetch updated data
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'disputes'
      });
      onMessageSent?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    addMessage.mutate({
      disputeId,
      message: message.trim(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (disabled) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            This dispute is closed and no longer accepts new messages.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Type your message here... (Press Ctrl+Enter to send)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[120px] resize-none"
          maxLength={2000}
        />
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {message.length}/2000 characters
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage("")}
              disabled={!message.trim() || addMessage.isPending}
            >
              Clear
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || addMessage.isPending}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {addMessage.isPending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          💡 Tip: Use Ctrl+Enter (Cmd+Enter on Mac) to send your message quickly.
        </p>
      </CardContent>
    </Card>
  );
};
