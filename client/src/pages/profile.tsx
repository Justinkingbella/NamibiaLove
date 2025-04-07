import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import UserInfo from '@/components/profile/user-info';
import PostCard from '@/components/posts/post-card';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Settings, LogOut, Edit, Heart, Calendar, UserPlus, UserMinus, Loader2, Grid3X3, BookmarkIcon, UserIcon } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import ModalDialog from '@/components/common/modal';

interface User {
  id: number;
  fullName: string;
  username: string;
  bio?: string;
  age?: number;
  gender?: string;
  location?: string;
  occupation?: string;
  profilePicture?: string;
  interests?: string[];
  email: string;
}

interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  user: User;
  likes: number;
  comments: number;
  userLiked: boolean;
}

interface ProfileProps {
  isCurrentUser?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isCurrentUser: propIsCurrentUser }) => {
  const [match, params] = useRoute<{ id: string }>('/profile/:id');
  const { user: currentUser, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // If no ID is provided, show current user's profile
  const userId = match ? parseInt(params.id) : currentUser?.id;
  const isCurrentUser = propIsCurrentUser !== undefined 
    ? propIsCurrentUser 
    : userId === currentUser?.id;

  // Fetch user data
  const { 
    data: profileUser, 
    isLoading: userLoading 
  } = useQuery<User>({
    queryKey: [API_ENDPOINTS.USERS.DETAIL(userId || 0)],
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });

  // Fetch user posts
  const { 
    data: posts, 
    isLoading: postsLoading 
  } = useQuery<Post[]>({
    queryKey: [API_ENDPOINTS.POSTS.GET_BY_USER(userId || 0)],
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });

  // Fetch follow status if viewing another user's profile
  const { 
    data: followStatus, 
    isLoading: followStatusLoading 
  } = useQuery<{ following: boolean }>({
    queryKey: [API_ENDPOINTS.FOLLOWS.CHECK_STATUS(userId || 0)],
    enabled: !!userId && !isCurrentUser,
    staleTime: 30000, // 30 seconds
  });

  // Toggle follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', API_ENDPOINTS.FOLLOWS.TOGGLE, {
        followingId: userId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.FOLLOWS.CHECK_STATUS(userId || 0)] });
    }
  });

  // Handle follow/unfollow button click
  const handleFollowToggle = () => {
    if (!followStatusLoading && !followMutation.isPending) {
      followMutation.mutate();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
  };

  if (userLoading || !profileUser) {
    return (
      <MainLayout>
        <div className="p-4">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="text-center mb-6">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-40 mx-auto mb-2" />
            <Skeleton className="h-4 w-60 mx-auto" />
          </div>
          
          <div className="flex justify-center space-x-6 mb-6">
            <div className="text-center">
              <Skeleton className="h-5 w-8 mx-auto mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="text-center">
              <Skeleton className="h-5 w-8 mx-auto mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="text-center">
              <Skeleton className="h-5 w-8 mx-auto mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-yellow-500 to-orange-400 h-32 relative">
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="bg-white/20 text-white hover:bg-white/30">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          {isCurrentUser ? (
            <div className="flex space-x-2">
              <Link href="/profile/edit">
                <Button variant="ghost" size="icon" className="bg-white/20 text-white hover:bg-white/30">
                  <Edit className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link href={`/booking/${profileUser.id}`}>
                <Button variant="ghost" size="icon" className="bg-white/20 text-white hover:bg-white/30">
                  <Calendar className="h-5 w-5" />
                </Button>
              </Link>
              <Link href={`/chat/${profileUser.id}`}>
                <Button variant="ghost" size="icon" className="bg-white/20 text-white hover:bg-white/30">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 -mt-16 mb-6">
        <div className="text-center">
          <Avatar className="h-32 w-32 mx-auto border-4 border-white">
            <AvatarImage 
              src={profileUser.profilePicture} 
              alt={profileUser.fullName} 
              className="object-cover"
            />
            <AvatarFallback className="text-3xl">
              {getInitials(profileUser.fullName)}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold mt-4 font-sans">{profileUser.fullName}</h1>
          
          <div className="text-gray-600 text-sm mt-1 flex items-center justify-center">
            @{profileUser.username}
            {profileUser.location && (
              <span className="mx-1">•</span>
            )}
            {profileUser.location}
          </div>
          
          {profileUser.bio && (
            <p className="mt-3 text-gray-700 max-w-md mx-auto">{profileUser.bio}</p>
          )}
          
          {!isCurrentUser && (
            <div className="mt-4">
              <Button 
                variant={followStatus?.following ? "outline" : "default"}
                className={followStatus?.following ? "bg-gray-100 hover:bg-gray-200 text-gray-800" : "bg-gradient-to-r from-yellow-500 to-orange-400 text-white"}
                onClick={handleFollowToggle}
                disabled={followStatusLoading || followMutation.isPending}
              >
                {followMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {followStatus?.following ? (
                      <UserMinus className="mr-2 h-4 w-4" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                  </>
                )}
                {followStatus?.following ? "Following" : "Follow"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-6 mt-6">
          <div className="text-center">
            <div className="font-bold">120</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold">856</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold">267</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="posts">
        <TabsList className="w-full bg-transparent border-b border-gray-200 rounded-none">
          <TabsTrigger 
            value="posts"
            className="flex-1 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Grid3X3 className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="saved"
            className="flex-1 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <BookmarkIcon className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="about"
            className="flex-1 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <UserIcon className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-4 px-4">
          {postsLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {posts && posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  {isCurrentUser ? (
                    <>
                      <p className="text-lg font-medium">No posts yet</p>
                      <p className="text-sm mt-1">Share your first post with your followers</p>
                    </>
                  ) : (
                    <p className="text-lg font-medium">{profileUser.fullName} hasn't posted anything yet</p>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="mt-4 px-4">
          <div className="text-center py-12 text-gray-500">
            <BookmarkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No saved posts</p>
            <p className="text-sm mt-1">Posts you save will appear here</p>
          </div>
        </TabsContent>
        
        <TabsContent value="about" className="mt-4 px-4">
          <UserInfo user={profileUser} />
        </TabsContent>
      </Tabs>
      
      {/* Logout confirmation modal */}
      <ModalDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Log Out"
      >
        <div className="p-4">
          <p className="mb-6">Are you sure you want to log out of your account?</p>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </ModalDialog>
    </MainLayout>
  );
};

export default Profile;
