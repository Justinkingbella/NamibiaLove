import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, MessageSquarePlus, CheckCircle2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/utils';
import { motion } from 'framer-motion';
import { slideInLeft } from '@/lib/animations';

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

interface Conversation {
  user: User;
  lastMessage: Message;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: conversations, isLoading, refetch } = useQuery<Conversation[]>({
    queryKey: [API_ENDPOINTS.MESSAGES.GET_CONVERSATIONS],
    staleTime: 10000, // 10 seconds
  });

  // Refresh conversations when page is focused
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch]);

  const filteredConversations = conversations?.filter(
    conversation => conversation.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="app-container">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">messages</h1>
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white shadow-md">
              <Plus className="h-5 w-5 text-primary" />
            </Button>
          </div>
          
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="search"
              className="pl-10 rounded-2xl py-6 border-gray-100 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="messages-list">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="message-preview p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1 ml-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-3 w-6 rounded-full" />
                </div>
              ))
            ) : (
              <>
                {filteredConversations && filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation, index) => (
                    <motion.div key={conversation.user.id} {...slideInLeft} style={{ transitionDelay: `${index * 50}ms` }}>
                      <Link href={`/chat/${conversation.user.id}`}>
                        <div className={`message-preview ${!conversation.lastMessage.read && conversation.lastMessage.senderId !== user?.id ? 'unread' : ''}`}>
                          <Avatar className="h-12 w-12 border-2 border-primary/5">
                            <AvatarImage 
                              src={conversation.user.profilePicture} 
                              alt={conversation.user.fullName} 
                            />
                            <AvatarFallback>{getInitials(conversation.user.fullName)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0 ml-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">{conversation.user.fullName}</h3>
                              <span className="text-xs text-gray-400">{formatDate(conversation.lastMessage.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-gray-500 truncate max-w-[180px]">
                                {conversation.lastMessage.senderId === user?.id ? (
                                  <span className="flex items-center gap-1">
                                    <span className="opacity-70">You: </span>
                                    {conversation.lastMessage.content}
                                  </span>
                                ) : (
                                  conversation.lastMessage.content
                                )}
                              </p>
                              
                              {conversation.lastMessage.senderId !== user?.id && !conversation.lastMessage.read && (
                                <span className="badge">2</span>
                              )}
                              
                              {conversation.lastMessage.senderId === user?.id && conversation.lastMessage.read && (
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-16 px-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                      <MessageSquarePlus className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">No conversations yet</p>
                    <p className="text-sm text-gray-500">Match with someone to start chatting</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatPage;
