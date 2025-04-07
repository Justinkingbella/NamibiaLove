import React from 'react';
import { Link } from 'wouter';
import { Heart, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  fullName: string;
  age?: number;
  location?: string;
  occupation?: string;
  profilePicture?: string;
}

const TopPicks: React.FC = () => {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: [API_ENDPOINTS.USERS.LIST],
    staleTime: 60000, // 1 minute
  });

  // Only show first 4 users as top picks
  const topPicks = users?.slice(0, 4);

  const matchMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('POST', API_ENDPOINTS.MATCHES.CREATE, { userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.MATCHES.LIST] });
    }
  });

  const handleLike = (userId: number) => {
    matchMutation.mutate(userId);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow-md bg-white">
              <Skeleton className="w-full h-48" />
              <div className="p-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!topPicks?.length) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold font-sans">Top Picks For You</h2>
        <Link href="/discover" className="text-orange-400 font-medium text-sm">
          See All
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {topPicks.map((user) => (
          <div key={user.id} className="rounded-lg overflow-hidden shadow-md bg-white">
            <div className="relative">
              <Link href={`/profile/${user.id}`}>
                <img 
                  src={user.profilePicture || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8cGVvcGxlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'} 
                  alt={`${user.fullName}'s profile`} 
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-white font-semibold">
                  {user.fullName.split(' ')[0]}, {user.age || '??'}
                </h3>
              </div>
            </div>
            <div className="p-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {user.occupation || 'Professional'} • {user.location ? `${user.location}` : '8km'}
                </span>
                <button 
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full",
                    "bg-gray-100 hover:bg-primary/10 text-primary",
                    matchMutation.isPending && matchMutation.variables === user.id && "opacity-70"
                  )}
                  onClick={() => handleLike(user.id)}
                  disabled={matchMutation.isPending && matchMutation.variables === user.id}
                >
                  {matchMutation.isPending && matchMutation.variables === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPicks;
