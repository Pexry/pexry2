'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  HeadphonesIcon,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { Conversation } from '@/payload-types'

type ConversationType = 'conversation' | 'support'
type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'closed'
type Priority = 'low' | 'normal' | 'high' | 'urgent'
type Category = 'payment' | 'dispute' | 'account' | 'technical' | 'refund' | 'other'

export default function MessagesPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data: session } = useQuery(trpc.auth.session.queryOptions())
  const searchParams = useSearchParams()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | ConversationType>('all')
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [showMobileConversationList, setShowMobileConversationList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-select conversation from URL parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId) {
      setSelectedConversation(conversationId)
      setShowMobileConversationList(false) // Show chat on mobile when conversation is selected
    }
  }, [searchParams])

  // TRPC Queries
  const { 
    data: conversationsData, 
    isLoading: conversationsLoading,
    refetch: refetchConversations 
  } = useQuery({
    ...trpc.conversations.getMyConversations.queryOptions({
      page: 1,
      limit: 50,
      type: filterType === 'all' ? undefined : filterType
    }),
    refetchInterval: 5000, // Poll every 5 seconds for new conversations list
    refetchIntervalInBackground: true
  })

  const { 
    data: selectedConversationData,
    refetch: refetchSelectedConversation,
    isFetching: isMessagesFetching
  } = useQuery({
    ...trpc.conversations.getConversation.queryOptions(
      { conversationId: selectedConversation! }
    ),
    enabled: !!selectedConversation,
    refetchInterval: selectedConversation ? 3000 : false, // Poll every 3 seconds when a conversation is selected
    refetchIntervalInBackground: true
  })

  // TRPC Mutations
  const sendMessageMutation = useMutation(trpc.conversations.sendMessage.mutationOptions({
    onSuccess: () => {
      setNewMessage('')
      refetchSelectedConversation()
      refetchConversations()
      // Invalidate the unread messages count query
      queryClient.invalidateQueries({ 
        queryKey: trpc.conversations.getUnreadMessagesCount.queryKey() 
      })
      toast.success('Message sent!')
    },
    onError: (error: any) => {
      toast.error('Failed to send message: ' + error.message)
    }
  }))

  const markAsReadMutation = useMutation(trpc.conversations.markAsRead.mutationOptions({
    onSuccess: () => {
      refetchSelectedConversation()
      refetchConversations()
      // Invalidate the unread messages count query
      queryClient.invalidateQueries({ 
        queryKey: trpc.conversations.getUnreadMessagesCount.queryKey() 
      })
    }
  }))

  const createConversationMutation = useMutation(trpc.conversations.createConversation.mutationOptions({
    onSuccess: (data: any) => {
      setIsNewConversationOpen(false)
      setSelectedConversation(data.conversationId)
      refetchConversations()
      toast.success('Conversation created!')
    },
    onError: (error: any) => {
      toast.error('Failed to create conversation: ' + error.message)
    }
  }))

  const updateStatusMutation = useMutation(trpc.conversations.updateConversationStatus.mutationOptions({
    onSuccess: (data) => {
      refetchSelectedConversation()
      refetchConversations()
      toast.success(`Conversation ${data.status}`)
    },
    onError: (error: any) => {
      toast.error('Failed to update status: ' + error.message)
    }
  }))

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversationData?.messages])

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversationData) {
      const hasUnreadMessages = selectedConversationData.messages?.some(
        (msg: any) => !msg.isRead && (typeof msg.sender === 'string' ? msg.sender : msg.sender.id) !== session?.user?.id
      )
      
      if (hasUnreadMessages) {
        markAsReadMutation.mutate({ conversationId: selectedConversation })
      }
    }
  }, [selectedConversation, selectedConversationData, session?.user?.id])

  const conversations = conversationsData?.docs || []
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.messages?.some((msg: any) => 
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      message: newMessage.trim(),
      isInternal: false
    })
  }

  const getPriorityColor = (priority?: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'normal': return 'bg-blue-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: ConversationStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'waiting': return 'bg-yellow-500'
      case 'resolved': return 'bg-blue-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getConversationIcon = (type: ConversationType) => {
    return type === 'support' ? <HeadphonesIcon className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm')
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm')
    } else {
      return format(date, 'MMM d, HH:mm')
    }
  }

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.messages?.filter(
      (msg: any) => !msg.isRead && (typeof msg.sender === 'string' ? msg.sender : msg.sender.id) !== session?.user?.id
    ).length || 0
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Please log in</h3>
          <p className="mt-1 text-sm text-gray-500">You need to be logged in to view messages.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-72px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b bg-white">
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile back button */}
          {!showMobileConversationList && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => {
                setSelectedConversation(null)
                setShowMobileConversationList(true)
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <h1 className="text-xl md:text-2xl font-bold">Messages</h1>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <NewConversationDialog
              isOpen={isNewConversationOpen}
              onOpenChange={setIsNewConversationOpen}
              onCreateConversation={createConversationMutation.mutate}
              isLoading={createConversationMutation.isPending}
            />
          </div>
          
          {/* Desktop controls */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="conversation">Buyer/Seller</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            
            <NewConversationDialog
              isOpen={isNewConversationOpen}
              onOpenChange={setIsNewConversationOpen}
              onCreateConversation={createConversationMutation.mutate}
              isLoading={createConversationMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* Mobile search and filter */}
      {showMobileConversationList && (
        <div className="md:hidden p-4 border-b bg-white space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="conversation">Buyer/Seller</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="secondary">
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Conversations List */}
        <div className={`${
          showMobileConversationList ? 'flex' : 'hidden'
        } md:flex w-full md:w-1/3 border-r flex-col bg-white`}>
          <ScrollArea className="flex-1">
            {conversationsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="mx-auto h-8 w-8 mb-2" />
            <p className="font-medium">No conversations found</p>
            {searchTerm ? (
              <Button 
                variant="link" 
                onClick={() => setSearchTerm('')}
                className="text-sm"
              >
                Clear search
              </Button>
            ) : (
              <div className="mt-2 text-xs space-y-1">
                <p>• Contact support using the button above</p>
                <p>• Use &quot;Contact Seller/Buyer&quot; buttons on product/order pages</p>
              </div>
            )}
          </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation: Conversation) => {
                  const unreadCount = getUnreadCount(conversation)
                  const lastMessage = conversation.messages?.[conversation.messages.length - 1]
                  
                  return (
                    <Card 
                      key={conversation.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation === conversation.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation.id)
                        setShowMobileConversationList(false) // Hide list on mobile when conversation is selected
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {getConversationIcon(conversation.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-sm truncate">
                                  {conversation.subject}
                                </h3>
                                {unreadCount > 0 && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusColor(conversation.status)} text-white border-0`}
                                >
                                  {conversation.status}
                                </Badge>
                                
                                {conversation.type === 'support' && conversation.priority && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPriorityColor(conversation.priority)} text-white border-0`}
                                  >
                                    {conversation.priority}
                                  </Badge>
                                )}
                              </div>
                              
                              {lastMessage && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {lastMessage.message}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-400 ml-2">
                            {conversation.lastMessageAt && formatMessageTime(conversation.lastMessageAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`${
          !showMobileConversationList ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col bg-white`}>
          {selectedConversation && selectedConversationData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h2 className="font-semibold truncate">{selectedConversationData.subject}</h2>
                      {isMessagesFetching && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(selectedConversationData.status)} text-white border-0`}>
                        {selectedConversationData.status}
                      </Badge>
                      
                      {selectedConversationData.type === 'support' && (
                        <>
                          {selectedConversationData.category && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedConversationData.category}
                            </Badge>
                          )}
                          {selectedConversationData.priority && (
                            <Badge className={`text-xs ${getPriorityColor(selectedConversationData.priority)} text-white border-0`}>
                              {selectedConversationData.priority}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Status update for agents */}
                    {session?.user?.roles?.includes('user-agent') && selectedConversationData.type === 'support' && (
                      <Select 
                        value={selectedConversationData.status}
                        onValueChange={(value: ConversationStatus) => {
                          updateStatusMutation.mutate({
                            conversationId: selectedConversation!,
                            status: value
                          })
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    <div className="text-xs md:text-sm text-gray-500 text-right">
                      <div>{selectedConversationData.participants?.length} participant{selectedConversationData.participants?.length !== 1 ? 's' : ''}</div>
                      {selectedConversationData.assignedAgent && (
                        <div className="hidden md:block">Agent: {
                          typeof selectedConversationData.assignedAgent === 'string' 
                            ? selectedConversationData.assignedAgent 
                            : (selectedConversationData.assignedAgent.username || selectedConversationData.assignedAgent.email)
                        }</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversationData.messages?.map((message: any, index: number) => {
                    const isOwnMessage = (typeof message.sender === 'string' ? message.sender : message.sender.id) === session?.user?.id
                    const prevMessage = selectedConversationData.messages?.[index - 1]
                    const showAvatar = index === 0 || 
                      !prevMessage ||
                      (typeof prevMessage.sender === 'string' 
                         ? prevMessage.sender 
                         : prevMessage.sender.id) !== 
                       (typeof message.sender === 'string' ? message.sender : message.sender.id)

                    return (
                      <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end space-x-2 max-w-[85%] md:max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {showAvatar && !isOwnMessage && (
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarImage src={typeof message.sender === 'string' ? '' : message.sender.avatar} />
                              <AvatarFallback>
                                {typeof message.sender === 'string' 
                                  ? 'U' 
                                  : (message.sender.username?.[0] || message.sender.email?.[0] || 'U')
                                }
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`rounded-lg p-3 ${
                            isOwnMessage 
                              ? 'bg-blue-500 text-white' 
                              : message.isInternal 
                                ? 'bg-yellow-100 border border-yellow-300'
                                : 'bg-gray-100'
                          }`}>
                            {!isOwnMessage && showAvatar && (
                              <p className="text-xs font-medium mb-1 hidden md:block">
                                {typeof message.sender === 'string' 
                                  ? message.sender 
                                  : (message.sender.username || message.sender.email)
                                }
                              </p>
                            )}
                            
                            {message.isInternal && (
                              <Badge variant="outline" className="mb-2 text-xs">
                                Internal Note
                              </Badge>
                            )}
                            
                            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                            
                            <div className={`flex items-center justify-between mt-2 text-xs ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span>{formatMessageTime(message.timestamp)}</span>
                              {isOwnMessage && (
                                <div className="flex items-center space-x-1 ml-2">
                                  {message.isRead ? (
                                    <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                                  ) : (
                                    <Clock className="h-3 w-3 flex-shrink-0" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[60px] max-h-32 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="lg"
                    className="flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">Choose a conversation from the list to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// New Support Request Dialog Component
function NewConversationDialog({ 
  isOpen, 
  onOpenChange, 
  onCreateConversation, 
  isLoading 
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateConversation: (data: any) => void
  isLoading: boolean
}) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [priority, setPriority] = useState<Priority>('normal')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required')
      return
    }

    onCreateConversation({
      type: 'support',
      subject: subject.trim(),
      message: message.trim(),
      category,
      priority,
    })

    // Reset form
    setSubject('')
    setMessage('')
    setCategory('other')
    setPriority('normal')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <HeadphonesIcon className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] mx-4">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <p className="text-sm text-gray-600">
            Get help from our support team. For buyer-seller conversations, use the &quot;Contact Seller&quot; or &quot;Contact Buyer&quot; buttons on product or order pages.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment Issue</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="account">Account Issue</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="refund">Refund Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Briefly describe your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Please provide details about your issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              required
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Sending...' : 'Submit Support Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
