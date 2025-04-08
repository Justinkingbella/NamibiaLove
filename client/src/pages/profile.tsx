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
import { ArrowLeft, Settings, LogOut, Edit, Heart, Calendar, UserPlus, UserMinus, Loader2, Grid3X3, BookmarkIcon, UserIcon, Crown, ImageIcon } from 'lucide-react';
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

interface ProfileProps extends RouteComponentProps<{ id?: string }> {
  isCurrentUser?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ params: routeParams, isCurrentUser: propIsCurrentUser }) => {
  const [match, useRouteParams] = useRoute<{ id: string }>('/profile/:id');
  const { user: currentUser, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userId = match && useRouteParams.id ? parseInt(useRouteParams.id) : 
    routeParams?.id ? parseInt(routeParams.id) : currentUser?.id;
  const isCurrentUser = propIsCurrentUser !== undefined 
    ? propIsCurrentUser 
    : userId === currentUser?.id;

  const { 
    data: profileUser, 
    isLoading: userLoading 
  } = useQuery<User>({
    queryKey: [API_ENDPOINTS.USERS.DETAIL(userId || 0)],
    enabled: !!userId,
    staleTime: 60000,
  });

  const { 
    data: posts, 
    isLoading: postsLoading 
  } = useQuery<Post[]>({
    queryKey: [API_ENDPOINTS.POSTS.GET_BY_USER(userId || 0)],
    enabled: !!userId,
    staleTime: 30000,
  });

  const { 
    data: followStatus, 
    isLoading: followStatusLoading 
  } = useQuery<{ following: boolean }>({
    queryKey: [API_ENDPOINTS.FOLLOWS.CHECK_STATUS(userId || 0)],
    enabled: !!userId && !isCurrentUser,
    staleTime: 30000,
  });

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

  const handleFollowToggle = () => {
    if (!followStatusLoading && !followMutation.isPending) {
      followMutation.mutate();
    }
  };

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
      <div className="relative h-[60vh] bg-gradient-to-br from-orange-400 to-pink-500">
        <div className="absolute top-4 left-4 z-10">
          <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-xl">
            <Edit className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-xl">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end space-x-4">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden border-4 border-white w-24 h-24">
                {isCurrentUser ? (
                  <ProfilePictureUpload
                    currentImage={profileUser.profilePicture}
                    username={profileUser.username}
                    onImageUpdated={(newImageUrl) => {
                      queryClient.invalidateQueries({ 
                        queryKey: [API_ENDPOINTS.USERS.DETAIL(userId || 0)] 
                      });
                    }}
                  />
                ) : (
                  <Avatar className="w-full h-full">
                    <AvatarImage 
                      src={profileUser.profilePicture} 
                      alt={profileUser.fullName} 
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-orange-200 to-pink-200 text-orange-700">
                      {getInitials(profileUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profileUser.fullName}</h1>
              <p className="text-white/80 text-sm">{profileUser.occupation || 'No occupation set'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 bg-white relative">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center gap-4 relative z-10">
            <div className="relative">
              {isCurrentUser ? (
                <div className="rounded-full p-1 bg-gradient-to-r from-pink-400 to-purple-400">
                  <ProfilePictureUpload
                    currentImage={profileUser.profilePicture}
                    username={profileUser.username}
                    onImageUpdated={(newImageUrl) => {
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

      <div className="bg-white rounded-t-3xl -mt-6 relative z-10">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full flex justify-between p-2 bg-transparent gap-1">
            <TabsTrigger 
              value="posts"
              className="flex-1 py-3 px-6 rounded-xl data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="stories"
              className="flex-1 py-3 px-6 rounded-xl data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Stories
            </TabsTrigger>
            <TabsTrigger 
              value="connections"
              className="flex-1 py-3 px-6 rounded-xl data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Connections
            </TabsTrigger>
          </TabsList>

          <div className="px-4 pt-2 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">23 Posts</h2>
              <Button variant="link" className="text-orange-500">
                View Archives
              </Button>
            </div>
          </div>

          <TabsContent value="posts" className="px-4">
            <div className="grid grid-cols-2 gap-2">
              {posts && posts.length > 0 ? posts.map(post => (
                <div key={post.id} className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  {post.mediaUrl ? (
                    <img 
                      src={post.mediaUrl} 
                      alt={post.content} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
              )) : (
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
            </div>
          </TabsContent>
        </Tabs>
      </div>

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