import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
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

  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-none bg-gray-100 hover:bg-gray-200">
            <MessageSquarePlus className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations"
            className="pl-10 rounded-2xl py-6 border-gray-200 bg-gray-50"
          />
        </div>
        
        <div className="space-y-1">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            ))
          ) : (
            <>
              {conversations && conversations.length > 0 ? (
                conversations.map((conversation, index) => (
                  <motion.div key={conversation.user.id} {...slideInLeft} style={{ transitionDelay: `${index * 50}ms` }}>
                    <Link href={`/chat/${conversation.user.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                        <Avatar className="h-14 w-14 border-2 border-primary/10">
                          <AvatarImage 
                            src={conversation.user.profilePicture} 
                            alt={conversation.user.fullName} 
                          />
                          <AvatarFallback>{getInitials(conversation.user.fullName)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{conversation.user.fullName}</h3>
                            <span className="text-xs text-gray-500">{formatDate(conversation.lastMessage.createdAt)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate max-w-[200px]">
                              {conversation.lastMessage.senderId === user?.id ? (
                                <span className="flex items-center gap-1">
                                  <span className="text-gray-500">You: </span>
                                  {conversation.lastMessage.content}
                                </span>
                              ) : (
                                conversation.lastMessage.content
                              )}
                            </p>
                            
                            {conversation.lastMessage.senderId !== user?.id && !conversation.lastMessage.read && (
                              <span className="h-3 w-3 rounded-full bg-primary flex-shrink-0"></span>
                            )}
                            
                            {conversation.lastMessage.senderId === user?.id && conversation.lastMessage.read && (
                              <CheckCircle2 className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm px-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageSquarePlus className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</p>
                  <p className="text-sm text-gray-500">Match with someone to start chatting</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatPage;
