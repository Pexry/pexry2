"use client";

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  HeadphonesIcon,
  Send, 
  Clock, 
  CheckCircle2, 
  Search,
  Filter,
  ArrowLeft,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { Conversation } from '@/payload-types'

type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'closed'
type Priority = 'low' | 'normal' | 'high' | 'urgent'

export default function AgentSupportPage() {
  const trpc = useTRPC()
  const { data: session } = useQuery(trpc.auth.session.queryOptions())
  const searchParams = useSearchParams()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | ConversationStatus>('all')
  const [showMobileConversationList, setShowMobileConversationList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if user is an agent
  const isAgent = session?.user?.roles?.includes('user-agent')

  // Auto-select conversation from URL parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId) {
      setSelectedConversation(conversationId)
      setShowMobileConversationList(false)
    }
  }, [searchParams])

  // TRPC Queries - Get all support conversations for agents
  const { 
    data: conversationsData, 
    isLoading: conversationsLoading,
    refetch: refetchConversations 
  } = useQuery({
    ...trpc.conversations.getAllSupportConversations.queryOptions({
      page: 1,
      limit: 50,
      status: filterStatus === 'all' ? undefined : filterStatus
    }),
    enabled: isAgent,
    refetchInterval: 5000, // Poll every 5 seconds for new support conversations
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
    enabled: !!selectedConversation && isAgent,
    refetchInterval: selectedConversation ? 3000 : false, // Poll every 3 seconds when a conversation is selected
    refetchIntervalInBackground: true
  })

  // TRPC Mutations
  const sendMessageMutation = useMutation(trpc.conversations.sendMessage.mutationOptions({
    onSuccess: () => {
      setNewMessage('')
      refetchSelectedConversation()
      refetchConversations()
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
    }
  }))

  const assignSelfMutation = useMutation(trpc.conversations.assignSelfToConversation.mutationOptions({
    onSuccess: () => {
      refetchSelectedConversation()
      refetchConversations()
      toast.success('Conversation assigned to you!')
    },
    onError: (error: any) => {
      toast.error('Failed to assign conversation: ' + error.message)
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

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <HeadphonesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Please log in</h3>
          <p className="mt-1 text-sm text-gray-500">You need to be logged in to access agent support.</p>
        </div>
      </div>
    )
  }

  if (!isAgent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You need to be a user agent to access this page.</p>
          <div className="mt-2 text-xs text-gray-400">
            <p>Current user roles: {JSON.stringify(session?.user?.roles)}</p>
            <p>User ID: {session?.user?.id}</p>
          </div>
        </div>
      </div>
    )
  }

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

  const handleAssignSelf = () => {
    if (!selectedConversation) return
    assignSelfMutation.mutate({ conversationId: selectedConversation })
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

  const isAssignedToMe = (conversation: Conversation) => {
    return conversation.assignedAgent && 
      (typeof conversation.assignedAgent === 'string' 
        ? conversation.assignedAgent === session?.user?.id 
        : conversation.assignedAgent.id === session?.user?.id)
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
          
          <HeadphonesIcon className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl md:text-2xl font-bold">Support Center</h1>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {filteredConversations.length} ticket{filteredConversations.length !== 1 ? 's' : ''}
          </Badge>
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
          
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
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
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="secondary">
              {filteredConversations.length} ticket{filteredConversations.length !== 1 ? 's' : ''}
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
                <HeadphonesIcon className="mx-auto h-8 w-8 mb-2" />
                <p className="font-medium">No support tickets found</p>
                {searchTerm ? (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm('')}
                    className="text-sm"
                  >
                    Clear search
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    Support tickets will appear here when users submit them.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation: Conversation) => {
                  const unreadCount = getUnreadCount(conversation)
                  const lastMessage = conversation.messages?.[conversation.messages.length - 1]
                  const isAssigned = isAssignedToMe(conversation)
                  
                  return (
                    <Card 
                      key={conversation.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation === conversation.id ? 'ring-2 ring-blue-500' : ''
                      } ${isAssigned ? 'border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => {
                        setSelectedConversation(conversation.id)
                        setShowMobileConversationList(false)
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <HeadphonesIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-sm truncate">
                                  {conversation.subject}
                                </h3>
                                <div className="flex items-center space-x-1 ml-2">
                                  {isAssigned && (
                                    <UserCheck className="h-3 w-3 text-blue-600" />
                                  )}
                                  {unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusColor(conversation.status)} text-white border-0`}
                                >
                                  {conversation.status}
                                </Badge>
                                
                                {conversation.priority && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPriorityColor(conversation.priority)} text-white border-0`}
                                  >
                                    {conversation.priority}
                                  </Badge>
                                )}

                                {conversation.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {conversation.category}
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
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Status update selector */}
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
                    
                    {!isAssignedToMe(selectedConversationData) && (
                      <Button 
                        onClick={handleAssignSelf}
                        disabled={assignSelfMutation.isPending}
                        size="sm"
                        variant="outline"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        {assignSelfMutation.isPending ? 'Assigning...' : 'Assign to Me'}
                      </Button>
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
                    placeholder="Type your reply..."
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
                <HeadphonesIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">Choose a support ticket from the list to start helping the customer.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
