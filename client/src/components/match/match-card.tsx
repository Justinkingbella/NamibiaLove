import React, { useState } from 'react';
import { Heart, X, MapPin, Briefcase, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { matchingAnimation } from '@/lib/animations';
import { motion } from 'framer-motion';

interface User {
  id: number;
  fullName: string;
  age?: number;
  location?: string;
  occupation?: string;
  profilePicture?: string;
  bio?: string;
}

interface MatchCardProps {
  user: User;
  onMatch?: (user: User) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ user, onMatch }) => {
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
  const matchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', API_ENDPOINTS.MATCHES.CREATE, { userId: user.id });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.MATCHES.LIST] });
      
      if (data.isNewMatch && onMatch) {
        onMatch(user);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to like this person",
        variant: "destructive",
      });
    }
  });

  const handleLike = () => {
    setDirection('right');
    setTimeout(() => {
      matchMutation.mutate();
      setDirection(null);
    }, 300);
  };

  const handleDislike = () => {
    setDirection('left');
    setTimeout(() => {
      setDirection(null);
    }, 300);
  };

  return (
    <motion.div
      className="relative w-full"
      animate={
        direction === 'left' 
          ? { x: -500, opacity: 0, rotate: -20 }
          : direction === 'right' 
            ? { x: 500, opacity: 0, rotate: 20 }
            : { x: 0, opacity: 1, rotate: 0 }
      }
      transition={{ duration: 0.3 }}
    >
      <Card className="relative mx-4 my-6 bg-white rounded-xl shadow-lg overflow-hidden">
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={`${user.fullName}'s profile`} 
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No profile picture</span>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold font-sans">
                {user.fullName}, {user.age || '??'}
              </h3>
              {user.location && (
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin size={14} />
                  <span className="text-sm">{user.location}, 5km away</span>
                </div>
              )}
              {user.occupation && (
                <div className="flex items-center space-x-2 mt-1">
                  <Briefcase size={14} />
                  <span className="text-sm">{user.occupation}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs mb-1">76% Match</span>
              <button 
                className={cn(
                  "w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg",
                  matchMutation.isPending && "opacity-70"
                )}
                onClick={handleLike}
                disabled={matchMutation.isPending}
              >
                {matchMutation.isPending ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Heart className="h-6 w-6 text-white" fill="white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-6 z-10">
        <button 
          className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200"
          onClick={handleDislike}
          disabled={matchMutation.isPending}
        >
          <X className="h-8 w-8 text-gray-500" />
        </button>
        
        <button 
          className={cn(
            "w-16 h-16 rounded-full bg-primary shadow-lg flex items-center justify-center",
            matchMutation.isPending && "opacity-70"
          )}
          onClick={handleLike}
          disabled={matchMutation.isPending}
        >
          {matchMutation.isPending ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Heart className="h-8 w-8 text-white" fill="white" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default MatchCard;
