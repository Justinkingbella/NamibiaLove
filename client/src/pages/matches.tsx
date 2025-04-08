
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, X, MessageCircle, Loader2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { API_ENDPOINTS } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  fullName: string;
  bio?: string;
  profilePicture?: string;
  interests?: string[];
  age?: number;
  gender?: string;
  location?: string;
}

interface MatchAnimation {
  show: boolean;
  matchedUser: User | null;
}

const MatchesPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [matchAnimation, setMatchAnimation] = useState<MatchAnimation>({
    show: false,
    matchedUser: null
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiRequest('GET', API_ENDPOINTS.USERS.LIST);
      return response;
    },
    enabled: !!user,
  });

  // Filter out the current user
  const potentialMatches = users?.filter(u => u.id !== user?.id) || [];

  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number, status: string }) => {
      return apiRequest('POST', API_ENDPOINTS.MATCHES.CREATE, {
        userId,
        status,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // If it's a match, show the animation
      if (data && data.status === 'matched') {
        const matchedUser = potentialMatches?.[currentProfileIndex] || null;
        setMatchAnimation({
          show: true,
          matchedUser
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Something went wrong while matching",
        variant: "destructive",
      });
    }
  });

  const handleLike = () => {
    if (!potentialMatches || currentProfileIndex >= potentialMatches.length) return;
    
    const userId = potentialMatches[currentProfileIndex].id;
    setDirection('right');
    
    setTimeout(() => {
      createMatchMutation.mutate({ userId, status: 'liked' });
      setCurrentProfileIndex(prev => prev + 1);
      setDirection(null);
    }, 300);
  };

  const handleDislike = () => {
    if (!potentialMatches || currentProfileIndex >= potentialMatches.length) return;
    
    const userId = potentialMatches[currentProfileIndex].id;
    setDirection('left');
    
    setTimeout(() => {
      createMatchMutation.mutate({ userId, status: 'rejected' });
      setCurrentProfileIndex(prev => prev + 1);
      setDirection(null);
    }, 300);
  };

  const handleStartChat = () => {
    if (matchAnimation.matchedUser) {
      setLocation(`/chat/${matchAnimation.matchedUser.id}`);
    }
    setMatchAnimation({ show: false, matchedUser: null });
  };

  const handleContinueSwiping = () => {
    setMatchAnimation({ show: false, matchedUser: null });
  };

  const currentProfile = potentialMatches && potentialMatches.length > currentProfileIndex 
    ? potentialMatches[currentProfileIndex] 
    : null;

  return (
    <MainLayout>
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1">Find Your Match</h2>
          <p className="text-gray-500 text-sm">Discover people nearby</p>
        </div>

        {usersLoading && (
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {!usersLoading && (!potentialMatches || potentialMatches.length === 0 || currentProfileIndex >= potentialMatches.length) && (
          <div className="text-center p-8 bg-[#F8F5F0] rounded-3xl shadow-lg mx-auto max-w-md">
            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No more profiles</h3>
            <p className="text-gray-500 mb-4">We'll notify you when new people join!</p>
            <Button 
              className="w-full" 
              onClick={() => setCurrentProfileIndex(0)}
              disabled={!potentialMatches || potentialMatches.length === 0}
            >
              Start Over
            </Button>
          </div>
        )}

        {!usersLoading && potentialMatches && potentialMatches.length > 0 && currentProfileIndex < potentialMatches.length && (
          <div className="relative mx-auto max-w-md h-[60vh]">
            <AnimatePresence>
              {currentProfile && (
                <motion.div
                  key={currentProfile.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0 
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-[#F8F5F0] rounded-3xl shadow-lg overflow-hidden h-full"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                      backgroundImage: currentProfile.profilePicture 
                        ? `url(${currentProfile.profilePicture})` 
                        : 'none'
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-20" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-30 text-white">
                    <h3 className="text-2xl font-bold mb-1 flex items-center">
                      {currentProfile.fullName} 
                      {currentProfile.age && <span className="ml-2 text-xl">{currentProfile.age}</span>}
                    </h3>
                    
                    {currentProfile.location && (
                      <p className="text-white/80 mb-2">{currentProfile.location}</p>
                    )}
                    
                    {currentProfile.bio && (
                      <p className="text-white/90 mb-4 line-clamp-3">{currentProfile.bio}</p>
                    )}
                    
                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {currentProfile.interests.map((interest, idx) => (
                          <span 
                            key={idx}
                            className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="absolute bottom-[-30px] left-0 right-0 flex justify-center gap-4 z-40">
              <Button 
                size="lg"
                variant="outline"
                className="h-16 w-16 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-transform hover:scale-110"
                onClick={handleDislike}
              >
                <X className="h-8 w-8 text-rose-500" />
              </Button>
              
              <Button 
                size="lg"
                className="h-16 w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
                onClick={handleLike}
              >
                <Heart className="h-8 w-8 text-white" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Match Animation */}
      <AnimatePresence>
        {matchAnimation.show && matchAnimation.matchedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20
              }}
              className="bg-[#F8F5F0] rounded-3xl p-6 w-full max-w-sm text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-6"
              >
                <Heart className="h-10 w-10 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-6">It's a Match!</h2>
              
              <div className="flex justify-center items-center mb-8">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback>{getInitials(user?.fullName || '')}</AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="mx-2 z-10"
                >
                  <Heart className="h-8 w-8 text-primary" fill="currentColor" />
                </motion.div>
                
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                    <AvatarImage src={matchAnimation.matchedUser.profilePicture} />
                    <AvatarFallback>{getInitials(matchAnimation.matchedUser.fullName)}</AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>
              
              <div className="grid gap-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleStartChat}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Send a Message
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={handleContinueSwiping}
                >
                  Keep Swiping
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default MatchesPage;
