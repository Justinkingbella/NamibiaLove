import React from 'react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlusIcon } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface Story {
  id: number;
  userId: number;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  expiresAt: string;
}

interface StoryGroup {
  user: {
    id: number;
    username: string;
    fullName: string;
    profilePicture?: string;
  };
  stories: Story[];
}

const StoryCircles: React.FC = () => {
  const { user } = useAuth();
  
  const { data: storyGroups, isLoading } = useQuery<StoryGroup[]>({
    queryKey: [API_ENDPOINTS.STORIES.LIST],
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center space-x-4 overflow-x-auto hide-scrollbar">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center space-x-4 overflow-x-auto hide-scrollbar">
        {/* Your Story */}
        <div className="flex flex-col items-center space-y-1">
          <Link href="/story/create">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-100">
              <PlusIcon className="h-6 w-6 text-gray-500" />
            </div>
          </Link>
          <span className="text-xs text-gray-600">Your Story</span>
        </div>

        {/* Stories from other users */}
        {storyGroups?.map((group) => (
          <div key={group.user.id} className="flex flex-col items-center space-y-1">
            <Link href={`/story/${group.user.id}`}>
              <div className="relative">
                <div className="story-circle p-0.5 rounded-full bg-gradient-to-r from-yellow-500 via-orange-400 to-red-500">
                  <Avatar className="w-16 h-16 border-2 border-white">
                    <AvatarImage 
                      src={group.user.profilePicture} 
                      alt={group.user.fullName} 
                      className="object-cover"
                    />
                    <AvatarFallback>{getInitials(group.user.fullName)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </Link>
            <span className="text-xs text-gray-600">{
              group.user.id === user?.id 
                ? 'You' 
                : group.user.fullName.split(' ')[0]
            }</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryCircles;
