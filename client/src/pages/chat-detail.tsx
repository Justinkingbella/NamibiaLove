import React, { useState, useEffect, useRef } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import ChatMessage from '@/components/chat/chat-message';
import MessageInput from '@/components/chat/message-input';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/hooks/use-websocket';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Phone, Video, MoreVertical, Loader2 
} from 'lucide-react';
import { formatChatTime, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface User {
  id: number;
  fullName: string;
  profilePicture?: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

const ChatDetail: React.FC = () => {
  const [match, params] = useRoute<{ id: string }>('/chat/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const otherUserId = match ? parseInt(params.id) : null;

  // Get the other user's details
  const { data: otherUser, isLoading: userLoading } = useQuery<User>({
    queryKey: [API_ENDPOINTS.USERS.DETAIL(otherUserId || 0)],
    enabled: !!otherUserId,
    staleTime: 300000, // 5 minutes
  });

  // Get messages between users
  const { 
    data: messages, 
    isLoading: messagesLoading,
    refetch: refetchMessages 
  } = useQuery<Message[]>({
    queryKey: [API_ENDPOINTS.MESSAGES.GET_WITH_USER(otherUserId || 0)],
    enabled: !!otherUserId,
    staleTime: 0, // Always refetch messages
  });

  // WebSocket for real-time chat
  const {
    status: wsStatus,
    sendChatMessage,
    sendTyping,
    markMessagesAsRead,
  } = useWebSocket(user?.id || null, {
    onMessage: (data) => {
      if (data.type === 'message' && data.message.senderId === otherUserId) {
        refetchMessages();
        markMessagesAsRead(otherUserId || 0);
      } else if (data.type === 'typing' && data.senderId === otherUserId) {
        setIsTyping(true);
        
        // Clear previous timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        
        // Set new timeout to clear typing indicator after 3 seconds
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
        
        setTypingTimeout(timeout);
      }
    },
    onOpen: () => {
      if (otherUserId) {
        markMessagesAsRead(otherUserId);
      }
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!otherUserId) throw new Error('No recipient selected');
      
      // Try to send via WebSocket first
      const sentViaWs = sendChatMessage(otherUserId, content);
      
      // If WebSocket fails, send via REST API
      if (!sentViaWs) {
        await apiRequest('POST', API_ENDPOINTS.MESSAGES.CREATE, {
          receiverId: otherUserId,
          content,
        });
      }
      
      return { content, receiverId: otherUserId };
    },
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.MESSAGES.GET_CONVERSATIONS] });
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current && messages?.length) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when component mounts or messages update
  useEffect(() => {
    if (otherUserId && wsStatus === 'open') {
      markMessagesAsRead(otherUserId);
    }
  }, [otherUserId, messages, wsStatus, markMessagesAsRead]);

  const handleSendMessage = () => {
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleInputChange = (text: string) => {
    setNewMessage(text);
    if (otherUserId && text.trim()) {
      sendTyping(otherUserId);
    }
  };

  if (userLoading || !otherUser) {
    return (
      <MainLayout hideBottomNav>
        <div className="flex justify-center items-center h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideBottomNav>
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/chat')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Link href={`/profile/${otherUser.id}`}>
            <div className="flex items-center ml-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profilePicture} alt={otherUser.fullName} />
                <AvatarFallback>{getInitials(otherUser.fullName)}</AvatarFallback>
              </Avatar>
              
              <div className="ml-3">
                <h3 className="font-semibold">{otherUser.fullName}</h3>
                <div className="flex items-center text-xs text-green-500">
                  {wsStatus === 'open' ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      Online
                    </>
                  ) : (
                    'Offline'
                  )}
                </div>
              </div>
            </div>
          </Link>
          
          <div className="ml-auto flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <div 
        ref={chatContainerRef}
        className="p-4 h-[calc(100vh-140px)] overflow-y-auto bg-gray-50"
      >
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {messages && messages.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center text-xs text-gray-500 my-3">
                  {messages[0]?.createdAt ? (
                    formatChatTime(messages[0].createdAt)
                  ) : (
                    'Today'
                  )}
                </div>
                
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    otherUser={otherUser}
                    isCurrentUser={message.senderId === user?.id}
                  />
                ))}
                
                {isTyping && (
                  <div className="flex mb-4">
                    <Avatar className="w-8 h-8 mr-2 self-end">
                      <AvatarImage src={otherUser.profilePicture} alt={otherUser.fullName} />
                      <AvatarFallback>{getInitials(otherUser.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm inline-flex">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <p className="mb-2">No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <MessageInput
        value={newMessage}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        disabled={sendMessageMutation.isPending}
        isLoading={sendMessageMutation.isPending}
      />
    </MainLayout>
  );
};

export default ChatDetail;
