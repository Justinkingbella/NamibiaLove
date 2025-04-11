import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import StoryCircles from '@/components/stories/story-circles';
import TopPicks from '@/components/match/top-picks';
import EventList from '@/components/events/event-list';
import PostCard from '@/components/posts/post-card';
import MatchCard from '@/components/match/match-card';
import ModalDialog from '@/components/common/modal';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface User {
  id: number;
  fullName: string;
  age?: number;
  location?: string;
  occupation?: string;
  profilePicture?: string;
}

interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  user: User;
  likes: number;
  comments: any[];
  userLiked: boolean;
}

const CreatePost = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <textarea placeholder="Create your post here..." className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" />
      <button className="mt-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">Post</button>
    </div>
  );
};


const Home: React.FC = () => {
  const { user } = useAuth();
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [showMatchModal, setShowMatchModal] = useState<boolean>(false);

  // Fetch users for matching
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: [API_ENDPOINTS.USERS.LIST],
    staleTime: 60000, // 1 minute
  });

  // Fetch posts for feed
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: [API_ENDPOINTS.POSTS.FEED],
    staleTime: 30000, // 30 seconds
  });

  // Get potential matches (excluding current user)
  const potentialMatches = users?.filter(u => u.id !== user?.id);
  const featuredMatch = potentialMatches?.[0];

  const handleMatch = (user: User) => {
    setMatchedUser(user);
    setShowMatchModal(true);
  };

  return (
    <MainLayout>
      {/* Stories */}
      <StoryCircles />

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <Tabs defaultValue="for-you">
          <TabsList className="w-full bg-transparent justify-around border-none">
            <TabsTrigger 
              value="for-you"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="discover"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Discover
            </TabsTrigger>
            <TabsTrigger 
              value="nearby"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Nearby
            </TabsTrigger>
            <TabsTrigger 
              value="matches"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Matches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="for-you" className="mt-0">
            {/* Main Featured Match Card */}
            {usersLoading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : featuredMatch ? (
              <MatchCard user={featuredMatch} onMatch={handleMatch} />
            ) : (
              <div className="text-center p-10 text-gray-500">
                No more matches available at the moment
              </div>
            )}

            {/* Top Picks Section */}
            <TopPicks />

            {/* Events Section */}
            <div className="bg-gray-50">
              <EventList />
            </div>

            {/* Posts Feed */}
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold font-sans">Latest Posts</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                      Create Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                    </DialogHeader>
                    <CreatePost />
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              </div>

              <div className="space-y-6">
                {posts?.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}

                {!posts?.length && (
                  <div className="text-center p-6 text-gray-500">
                    No posts yet. Follow people to see their posts here!
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Other tabs would have separate content */}
          <TabsContent value="discover">
            <div className="p-6 text-center text-gray-500">
              Switch to the Discover tab to explore more people
            </div>
          </TabsContent>

          <TabsContent value="nearby">
            <div className="p-6 text-center text-gray-500">
              Find people near you in the Nearby tab
            </div>
          </TabsContent>

          <TabsContent value="matches">
            <div className="p-6 text-center text-gray-500">
              Your matches will appear here
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Match Modal */}
      {matchedUser && (
        <ModalDialog 
          isOpen={showMatchModal} 
          onClose={() => setShowMatchModal(false)}
          title="It's a Match!"
        >
          <div className="text-center p-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-400 animate-pulse opacity-50"></div>
              </div>
              <img 
                src={matchedUser.profilePicture || "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8cm9tYW50aWMlMjBjb3VwbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"} 
                alt="Match success" 
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 font-sans">It's a Match!</h2>
            <p className="text-gray-600 mt-2 mb-6">You and {matchedUser.fullName} have liked each other.</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowMatchModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium"
              >
                Keep Swiping
              </button>
              <button 
                onClick={() => {
                  setShowMatchModal(false);
                  window.location.href = `/chat/${matchedUser.id}`;
                }}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-400 hover:opacity-90 text-white py-3 rounded-lg font-medium"
              >
                Send Message
              </button>
            </div>
          </div>
        </ModalDialog>
      )}
    </MainLayout>
  );
};

export default Home;