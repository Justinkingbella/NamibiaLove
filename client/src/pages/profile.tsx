import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import UserInfo from '@/components/profile/user-info';
import SecretLover from '@/components/profile/secret-lover';
import GiftArea from '@/components/profile/gift-area';
import Avatar3D from '@/components/profile/avatar-3d';
import MessageSettings from '@/components/profile/message-settings';
import NicknameManager from '@/components/profile/nickname-manager';
import SubscriptionStatus from '@/components/profile/subscription-status';
import { ProfilePictureUpload } from '@/components/profile/profile-picture-upload';
import PostCard from '@/components/posts/post-card';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, LogOut, Edit, Heart, Calendar, UserPlus, UserMinus, Loader2, Grid3X3, BookmarkIcon, UserIcon, Crown } from 'lucide-react';
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
  avatarData?: any;
  isPremium?: boolean;
  premiumExpiresAt?: string;
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

import { RouteComponentProps } from 'wouter';

interface ProfileProps extends RouteComponentProps<{ id?: string }> {
  isCurrentUser?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ params: routeParams, isCurrentUser: propIsCurrentUser }) => {
  const [match, useRouteParams] = useRoute<{ id: string }>('/profile/:id');
  const { user: currentUser, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // If no ID is provided, show current user's profile
  const userId = match && useRouteParams.id ? parseInt(useRouteParams.id) : 
    routeParams?.id ? parseInt(routeParams.id) : currentUser?.id;
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
      {/* Navigation header */}
      <div className="bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-md py-4 px-4 relative overflow-hidden sticky top-0 z-50 shadow-sm">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-100/10 to-purple-100/10">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-r from-pink-200/20 to-purple-200/20 blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-r from-purple-200/20 to-pink-200/20 blur-xl"></div>
        </div>
        
        <div className="flex justify-between items-center relative z-10">
          <Link href="/">
            <Button variant="outline" size="icon" className="bg-white shadow-lg border-pink-100 hover:bg-pink-50">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
          </Link>
          
          {isCurrentUser ? (
            <div className="flex space-x-2">
              <Link href="/profile/edit">
                <Button variant="outline" size="icon" className="bg-white shadow-lg border-pink-100 hover:bg-pink-50">
                  <Edit className="h-5 w-5 text-gray-700" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white shadow-lg border-pink-100 hover:bg-pink-50"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link href={`/booking/${profileUser.id}`}>
                <Button variant="ghost" size="icon" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                  <Calendar className="h-5 w-5" />
                </Button>
              </Link>
              <Link href={`/chat/${profileUser.id}`}>
                <Button variant="ghost" size="icon" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 py-6 bg-white relative">
        {/* Profile header with avatar and basic info */}
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center gap-4 relative z-10">
            <div className="relative">
              {isCurrentUser ? (
                <div className="rounded-full p-1 bg-gradient-to-r from-pink-400 to-purple-400">
                  <ProfilePictureUpload
                    currentImage={profileUser.profilePicture}
                    username={profileUser.username}
                    onImageUpdated={(newImageUrl) => {
                      // Invalidate user query to refresh profile
                      queryClient.invalidateQueries({ 
                        queryKey: [API_ENDPOINTS.USERS.DETAIL(userId || 0)] 
                      });
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-full p-1 bg-gradient-to-r from-pink-400 to-purple-400">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                    <AvatarImage 
                      src={profileUser.profilePicture} 
                      alt={profileUser.fullName} 
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl bg-gradient-to-r from-pink-200 to-purple-200 text-pink-700">
                      {getInitials(profileUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              {profileUser.isPremium && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full p-1.5">
                  <Crown className="h-5 w-5" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold font-sans text-gray-800 flex items-center justify-center md:justify-start">
                    {profileUser.fullName}
                    {profileUser.isPremium && (
                      <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-amber-500 border-none">
                        <Crown className="h-3 w-3 mr-1" /> Premium
                      </Badge>
                    )}
                  </h1>
                  <div className="text-gray-600 text-sm mt-1 flex items-center justify-center md:justify-start">
                    @{profileUser.username}
                    {profileUser.location && (
                      <>
                        <span className="mx-1">•</span>
                        {profileUser.location}
                      </>
                    )}
                  </div>
                </div>
                
                {!isCurrentUser && (
                  <div className="mt-4 md:mt-0">
                    <Button 
                      variant={followStatus?.following ? "outline" : "default"}
                      className={followStatus?.following 
                        ? "bg-white hover:bg-gray-100 text-gray-800 border-pink-200" 
                        : "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                      }
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
              
              {profileUser.bio && (
                <p className="mt-3 text-gray-600 max-w-md leading-relaxed">{profileUser.bio}</p>
              )}
              
              <div className="grid grid-cols-3 gap-4 w-full mt-5 bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <div className="font-medium text-gray-800">80% OFF</div>
                  <div className="text-xs text-gray-500">Until Jul 7</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-800 text-lg">856</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-800 text-lg">267</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="posts">
        <div className="bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-md border-b border-gray-100 sticky top-[72px] z-10 shadow-sm">
          <TabsList className="w-full bg-transparent rounded-none max-w-2xl mx-auto p-1">
            <TabsTrigger 
              value="posts"
              className="flex-1 py-3 px-4 rounded-lg text-gray-600 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm"
            >
              <Grid3X3 className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              className="flex-1 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-medium rounded-none py-3"
            >
              <BookmarkIcon className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
            <TabsTrigger 
              value="about"
              className="flex-1 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-medium rounded-none py-3"
            >
              <UserIcon className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
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
        
        <TabsContent value="about" className="mt-4">
          <div className="max-w-md mx-auto flex flex-col gap-2">
            {/* User Info */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <UserInfo user={profileUser} isCurrentUser={isCurrentUser} />
            </div>
            
            {/* Secret Lover */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profileUser.profilePicture} />
                  <AvatarFallback>SL</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <SecretLover isCurrentUser={isCurrentUser} />
                </div>
              </div>
            </div>
            
            {/* Gift Area */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/gift-icon.png" />
                  <AvatarFallback>🎁</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <GiftArea isCurrentUser={isCurrentUser} userId={profileUser.id} />
                </div>
              </div>
            </div>
            
            {/* 3D Avatar */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/avatar-3d-icon.png" />
                  <AvatarFallback>3D</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Avatar3D 
                    isCurrentUser={isCurrentUser} 
                    avatarData={profileUser.avatarData} 
                  />
                </div>
              </div>
            </div>
            
            {/* Message Settings */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/message-settings-icon.png" />
                  <AvatarFallback>⚙️</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <MessageSettings isCurrentUser={isCurrentUser} />
                </div>
              </div>
            </div>
            
            {/* Nickname Manager */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/nickname-icon.png" />
                  <AvatarFallback>👤</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <NicknameManager 
                    isCurrentUser={isCurrentUser} 
                    targetUser={{
                      id: profileUser.id,
                      fullName: profileUser.fullName,
                      username: profileUser.username
                    }}
                    initialNickname="Sweetheart" 
                  />
                </div>
              </div>
            </div>
            
            {/* Subscription Status */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/subscription-icon.png" />
                  <AvatarFallback>⭐</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <SubscriptionStatus 
                    isCurrentUser={isCurrentUser} 
                    isPremium={profileUser.isPremium || false} 
                    expiresAt={profileUser.premiumExpiresAt ? new Date(profileUser.premiumExpiresAt) : undefined} 
                  />
                </div>
              </div>
            </div>
          </div>
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
