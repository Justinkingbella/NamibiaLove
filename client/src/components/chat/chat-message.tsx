import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2 } from 'lucide-react';
import { formatChatTime, getInitials } from '@/lib/utils';
import { motion } from 'framer-motion';

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

interface ChatMessageProps {
  message: Message;
  otherUser: User;
  isCurrentUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, otherUser, isCurrentUser }) => {
  return (
    <motion.div 
      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isCurrentUser && (
        <Avatar className="w-8 h-8 mr-2 self-end border-2 border-white">
          <AvatarImage src={otherUser.profilePicture} alt={otherUser.fullName} />
          <AvatarFallback>{getInitials(otherUser.fullName)}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[75%] ${isCurrentUser ? 'text-right' : ''}`}>
        <div 
          className={isCurrentUser ? 'message-bubble-sent' : 'message-bubble-received'}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        
        <div className={`flex items-center text-[10px] text-gray-500 mt-1 ${isCurrentUser ? 'justify-end' : 'ml-2'}`}>
          <span className={isCurrentUser ? 'mr-1' : ''}>{formatChatTime(message.createdAt)}</span>
          
          {isCurrentUser && (
            <span className="ml-1">
              {message.read ? (
                <CheckCircle2 className="h-3 w-3 text-primary fill-primary" />
              ) : (
                <CheckCircle2 className="h-3 w-3 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
