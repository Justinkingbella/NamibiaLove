import React, { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, STORY_DURATION } from '@/lib/constants';
import { X, ChevronLeft, ChevronRight, Send, Heart, MessageCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInitials, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface User {
  id: number;
  fullName: string;
  username: string;
  profilePicture?: string;
}

interface Story {
  id: number;
  userId: number;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  expiresAt: string;
}

const StoryView: React.FC = () => {
  const [match, params] = useRoute<{ id: string }>('/story/:id');
  const [, setLocation] = useLocation();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState('');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const userId = match ? parseInt(params.id) : null;

  // Fetch stories by user
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: [API_ENDPOINTS.STORIES.GET_BY_USER(userId || 0)],
    enabled: !!userId,
    staleTime: 0, // Always refetch
  });

  // Fetch user details
  const { data: storyUser } = useQuery<User>({
    queryKey: [API_ENDPOINTS.USERS.DETAIL(userId || 0)],
    enabled: !!userId,
    staleTime: 300000, // 5 minutes
  });

  const currentStory = stories && stories.length > 0 ? stories[currentStoryIndex] : null;

  // Setup progress timer
  useEffect(() => {
    if (!stories?.length || paused) return;
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setProgress(0);
    const increment = 100 / (STORY_DURATION / 100); // Progress increment per 100ms
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current as NodeJS.Timeout);
          
          // Move to next story or close if at the end
          if (currentStoryIndex < (stories.length - 1)) {
            setCurrentStoryIndex(prev => prev + 1);
          } else {
            setLocation('/');
          }
          
          return 0;
        }
        return prev + increment;
      });
    }, 100);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentStoryIndex, stories, paused, setLocation]);

  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentStoryIndex > 0) {
          setCurrentStoryIndex(prev => prev - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (stories && currentStoryIndex < stories.length - 1) {
          setCurrentStoryIndex(prev => prev + 1);
        } else {
          setLocation('/');
        }
      } else if (e.key === 'Escape') {
        setLocation('/');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStoryIndex, stories, setLocation]);

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const handleNextStory = () => {
    if (stories && currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      setLocation('/');
    }
  };

  const handleClose = () => {
    setLocation('/');
  };

  const togglePause = () => {
    setPaused(prev => !prev);
  };

  const handleSendMessage = () => {
    if (message.trim() && userId) {
      // In a real app, this would send a message via the API
      console.log(`Sending message to ${userId}: ${message}`);
      
      // Navigate to the chat with this user
      setLocation(`/chat/${userId}`);
    }
  };

  if (isLoading || !currentStory || !storyUser) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="animate-pulse w-10 h-10 rounded-full bg-white/20"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Story progress indicators */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {stories?.map((_, index) => (
          <Progress 
            key={index} 
            value={index === currentStoryIndex ? progress : index < currentStoryIndex ? 100 : 0}
            className="h-1 bg-gray-600"
          />
        ))}
      </div>
      
      {/* Story header */}
      <div className="absolute top-12 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={storyUser.profilePicture} alt={storyUser.fullName} />
            <AvatarFallback>{getInitials(storyUser.fullName)}</AvatarFallback>
          </Avatar>
          
          <div className="ml-3 text-white">
            <div className="font-semibold">{storyUser.fullName}</div>
            <div className="text-xs opacity-80">{formatDate(currentStory.createdAt)}</div>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="text-white" onClick={handleClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Story content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative w-full h-full"
        onClick={togglePause}
      >
        <img 
          src={currentStory.mediaUrl} 
          alt="Story" 
          className="w-full h-full object-contain"
        />
        
        {currentStory.caption && (
          <div className="absolute bottom-24 left-4 right-4 bg-black/30 text-white p-4 rounded-lg backdrop-blur-sm">
            {currentStory.caption}
          </div>
        )}
      </motion.div>
      
      {/* Navigation controls */}
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 rounded-full p-2 text-white z-10"
        onClick={handlePrevStory}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 rounded-full p-2 text-white z-10"
        onClick={handleNextStory}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      
      {/* Story actions */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-2 z-10">
        <Input
          type="text"
          placeholder="Send a message..."
          className="flex-1 bg-white/10 border-none text-white placeholder:text-white/60"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        
        <Button variant="ghost" size="icon" className="text-white">
          <Heart className="h-6 w-6" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-white">
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        <Button 
          size="icon" 
          className="bg-primary text-white rounded-full"
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default StoryView;
