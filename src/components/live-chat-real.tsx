"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X, Send, User, Headphones, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface LiveChatRealProps {
  className?: string;
}

export const LiveChatReal = ({ className }: LiveChatRealProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm here to help you. You can ask me questions or create a support ticket for detailed assistance.",
      sender: "support",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [assignedAgent, setAssignedAgent] = useState<{id: string, name: string} | null>(null);
  
  // Support ticket form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState<'payment' | 'dispute' | 'account' | 'technical' | 'refund' | 'other'>('other');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TRPC mutations
  const trpc = useTRPC();
  const startChatMutation = useMutation(trpc.conversations.createConversation.mutationOptions({
    onSuccess: (result) => {
      if (result) {
        setConversationId(result.conversationId);
        // setAssignedAgent(result.assignedAgent);
        toast.success("Connected to support!");
      }
    },
    onError: (error: any) => {
      console.error('Error starting chat:', error);
      toast.error(error.message || "Failed to start chat. Please try again.");
      setIsTyping(false);
    }
  }));
  
  const sendMessageMutation = useMutation(trpc.conversations.sendMessage.mutationOptions({
    onSuccess: () => {
      toast.success("Message sent!");
    },
    onError: (error: any) => {
      console.error('Error sending message:', error);
      toast.error(error.message || "Failed to send message. Please try again.");
    }
  }));

  const createTicketMutation = useMutation(trpc.support.createSupportTicket.mutationOptions({
    onSuccess: (result: any) => {
      toast.success("Support ticket created successfully!");
      setShowTicketForm(false);
      setTicketSubject("");
      setTicketDescription("");
      setTicketCategory('other');
      
      // Add confirmation message to chat
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: `✅ Support ticket #${result.ticketId} created successfully! Our team will contact you soon via email.`,
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMessage]);
    },
    onError: (error: any) => {
      console.error('Error creating ticket:', error);
      toast.error(error.message || "Failed to create ticket. Please try again.");
    }
  }));

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleStartChat = async () => {
    if (!message.trim()) return;

    try {
      setIsTyping(true);

      // Add user message to chat immediately
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      const currentMessage = message;
      setMessage("");

      const result = await startChatMutation.mutateAsync({
        type: "support",
        subject: "Live Chat Support",
        message: currentMessage,
        category: 'other',
        priority: 'normal',
      });

      if (result.success) {
        // Simulate agent acknowledgment
        setTimeout(() => {
          const supportResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: `Hi! I'll be helping you today. I've received your message and will assist you shortly.`,
            sender: 'support',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, supportResponse]);
          setIsTyping(false);
        }, 1500);
      }
    } catch (error: any) {
      setIsTyping(false);
      // Error is already handled in the mutation onError callback
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      const currentMessage = message;
      setMessage("");

      await sendMessageMutation.mutateAsync({
        conversationId,
        message: currentMessage,
      });
    } catch (error: any) {
      // Error is already handled in the mutation onError callback
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createTicketMutation.mutateAsync({
        subject: ticketSubject,
        description: ticketDescription,
        category: ticketCategory,
        priority: 'medium'
      });
    } catch (error: any) {
      // Error is already handled in the mutation onError callback
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (conversationId) {
        handleSendMessage();
      } else {
        handleStartChat();
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowTicketForm(false);
  };

  const isLoading = startChatMutation.isPending || sendMessageMutation.isPending || createTicketMutation.isPending;

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 h-96 mb-4 shadow-xl border-0 bg-white flex flex-col overflow-hidden">
          <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                <CardTitle className="text-sm font-medium">
                  {showTicketForm ? "Create Support Ticket" : "Support Chat"}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
                {!showTicketForm && !conversationId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTicketForm(true)}
                    className="h-6 w-6 p-0 text-white hover:bg-blue-800 hover:bg-opacity-50"
                    title="Create Support Ticket"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 text-white hover:bg-blue-800 hover:bg-opacity-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              {showTicketForm 
                ? "Create detailed support request" 
                : assignedAgent 
                  ? `Connected to ${assignedAgent.name}`
                  : "Online - We typically reply instantly"
              }
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col flex-1 min-h-0">
            {showTicketForm ? (
              // Support Ticket Form
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <Select value={ticketCategory} onValueChange={(value: any) => setTicketCategory(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payment">💳 Payment Issue</SelectItem>
                          <SelectItem value="dispute">⚖️ Dispute</SelectItem>
                          <SelectItem value="account">👤 Account Issue</SelectItem>
                          <SelectItem value="technical">🔧 Technical Issue</SelectItem>
                          <SelectItem value="refund">💰 Refund Request</SelectItem>
                          <SelectItem value="other">❓ Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Subject</label>
                      <Input
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <Textarea
                        value={ticketDescription}
                        onChange={(e) => setTicketDescription(e.target.value)}
                        placeholder="Please provide detailed information about your issue..."
                        rows={3}
                        className="w-full resize-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t bg-gray-50 flex-shrink-0">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowTicketForm(false)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={createTicketMutation.isPending}
                    >
                      Back to Chat
                    </Button>
                    <Button
                      onClick={handleCreateTicket}
                      disabled={createTicketMutation.isPending || !ticketSubject.trim() || !ticketDescription.trim()}
                      size="sm"
                      className="flex-1"
                    >
                      {createTicketMutation.isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Ticket"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Chat Interface
              <>
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2 items-start",
                          msg.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        {msg.sender === 'support' && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <Headphones className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                            msg.sender === 'user'
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          )}
                          style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto'
                          }}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          <p className={cn(
                            "text-xs mt-1 opacity-70",
                            msg.sender === 'user' ? "text-blue-100" : "text-gray-500"
                          )}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {msg.sender === 'user' && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-2 justify-start items-start">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <Headphones className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t bg-gray-50 flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={conversationId ? "Type your message..." : "Start a conversation..."}
                      className="flex-1 bg-white"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={conversationId ? handleSendMessage : handleStartChat}
                      disabled={!message.trim() || isLoading}
                      size="sm"
                      className="px-3 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-all duration-300",
          "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
          "hover:scale-110 active:scale-95 border-0",
          isOpen && "rotate-180"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};
