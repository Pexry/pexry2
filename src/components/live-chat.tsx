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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface LiveChatProps {
  className?: string;
}

export const LiveChat = ({ className }: LiveChatProps) => {
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
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  
  // Support ticket form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState<'payment' | 'dispute' | 'account' | 'technical' | 'refund' | 'other'>('other');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    
    // Simulate support response
    setIsTyping(true);
    setTimeout(() => {
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getSupportResponse(message),
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getSupportResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('payment') || msg.includes('pay')) {
      return "I can help you with payment issues. Are you having trouble with a specific transaction? For detailed assistance, consider creating a support ticket.";
    } else if (msg.includes('dispute') || msg.includes('problem')) {
      return "I understand you're having an issue. Can you provide more details about the dispute? You can also create a support ticket for our team to investigate further.";
    } else if (msg.includes('refund')) {
      return "I can assist with refund requests. Please provide your order ID and I'll look into it. You may also create a support ticket for faster processing.";
    } else if (msg.includes('account') || msg.includes('login')) {
      return "I can help with account-related issues. What specific problem are you experiencing? Consider creating a support ticket if you need account changes.";
    } else if (msg.includes('hello') || msg.includes('hi')) {
      return "Hello! I'm here to help. What can I assist you with today? You can chat here or create a support ticket for complex issues.";
    } else if (msg.includes('ticket') || msg.includes('support ticket')) {
      return "You can create a support ticket by clicking the '+' button above. This will allow our team to assist you with detailed issues.";
    } else {
      return "Thank you for reaching out. I'm here to help with quick questions. For complex issues, please create a support ticket and our team will respond promptly.";
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreatingTicket(true);
    
    try {
      // Simulate ticket creation for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ticketId = `TKT-${Date.now().toString().slice(-6)}`;
      
      toast.success("Support ticket created successfully!");
      setShowTicketForm(false);
      setTicketSubject("");
      setTicketDescription("");
      setTicketCategory('other');
      
      // Add confirmation message to chat
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: `✅ Support ticket #${ticketId} created successfully! Our team will contact you soon via email.`,
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMessage]);
      
    } catch (error) {
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowTicketForm(false);
  };

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
                {!showTicketForm && (
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
              {showTicketForm ? "Create detailed support request" : "Online - We typically reply instantly"}
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
                      disabled={isCreatingTicket}
                    >
                      Back to Chat
                    </Button>
                    <Button
                      onClick={handleCreateTicket}
                      disabled={isCreatingTicket || !ticketSubject.trim() || !ticketDescription.trim()}
                      size="sm"
                      className="flex-1"
                    >
                      {isCreatingTicket ? (
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
                      placeholder="Type your message..."
                      className="flex-1 bg-white"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      size="sm"
                      className="px-3 bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
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
