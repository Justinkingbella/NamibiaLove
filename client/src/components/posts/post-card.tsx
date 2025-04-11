import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, MessageSquare, Share2, Bookmark, CheckCircle, Loader2, Send, Edit, Trash 
} from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  fullName: string;
  username: string;
  profilePicture?: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: User;
}

interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  user: User;
  likes: number;
  comments: Comment[] | number;
  userLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onCommentAdded?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onCommentAdded }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedComments, setExpandedComments] = useState(false);
  const [editingPost, setEditingPost] = useState(false); // Added state for editing

  // Determine if comments are an array or just a count
  const commentsArray = Array.isArray(post.comments) ? post.comments : [];
  const commentsCount = Array.isArray(post.comments) ? post.comments.length : post.comments;

  // Fetch detailed post with comments if needed and not already loaded
  const { data: detailedPost, isLoading: commentsLoading } = useQuery<Post>({
    queryKey: [API_ENDPOINTS.POSTS.DETAIL(post.id)],
    enabled: expandedComments && !Array.isArray(post.comments),
    staleTime: 30000, // 30 seconds
  });

  // Comments to display
  const displayComments = detailedPost?.comments && Array.isArray(detailedPost.comments) 
    ? detailedPost.comments 
    : commentsArray;

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', API_ENDPOINTS.LIKES.TOGGLE, {
        postId: post.id
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.POSTS.FEED] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.POSTS.DETAIL(post.id)] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.POSTS.GET_BY_USER(post.user.id)] });
    }
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', API_ENDPOINTS.COMMENTS.CREATE, {
        postId: post.id,
        content
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.POSTS.FEED] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.POSTS.DETAIL(post.id)] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.POSTS.GET_BY_USER(post.user.id)] });
      setNewComment('');
      setExpandedComments(true);
      if (onCommentAdded) onCommentAdded();
    }
  });

  const handleLike = () => {
    if (!likeMutation.isPending) {
      likeMutation.mutate();
    }
  };

  const handleComment = () => {
    if (newComment.trim() && !commentMutation.isPending) {
      commentMutation.mutate(newComment.trim());
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const toggleComments = () => {
    setExpandedComments(!expandedComments);
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', API_ENDPOINTS.POSTS.DELETE(post.id));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.POSTS.FEED] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    if (!deleteMutation.isPending) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow">
      {/* Post header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${post.user.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.profilePicture} alt={post.user.fullName} />
              <AvatarFallback>{getInitials(post.user.fullName)}</AvatarFallback>
            </Avatar>
          </Link>

          <div>
            <div className="flex items-center space-x-1">
              <Link href={`/profile/${post.user.id}`}>
                <h4 className="font-semibold text-sm">{post.user.fullName}</h4>
              </Link>
              <CheckCircle className="text-primary h-4 w-4" />
            </div>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {post.content && (
          <p className="mt-3 text-sm whitespace-pre-wrap break-words">{post.content}</p>
        )}
      </div>

      {/* Post media */}
      {post.mediaUrl && post.mediaUrl.length > 0 && (
        <div>
          <img 
            src={post.mediaUrl} 
            alt="Post content"
            className="w-full max-h-96 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Post actions */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("p-1", post.userLiked && "text-red-500")}
              onClick={handleLike}
              disabled={likeMutation.isPending}
            >
              {likeMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-1" />
              ) : (
                <Heart className={cn("h-5 w-5 mr-1", post.userLiked && "fill-current")} />
              )}
              <span className="text-sm">{post.likes}</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1"
              onClick={toggleComments}
            >
              <MessageSquare className="h-5 w-5 mr-1" />
              <span className="text-sm">{commentsCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="p-1">
              <Share2 className="h-5 w-5" />
            </Button>

            {post.user.id === user?.id && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-blue-500"
                  onClick={() => setEditingPost(true)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-red-500"
                  onClick={handleDelete}
                >
                  <Trash className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("p-1", isBookmarked && "text-primary")}
            onClick={toggleBookmark}
          >
            <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
          </Button>
        </div>

        {/* Comments section */}
        {expandedComments && (
          <div className="border-t border-gray-100 pt-3">
            {commentsLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="bg-gray-100 py-2 px-3 rounded-2xl w-3/4">
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {displayComments.length > 0 ? (
                  <div className="space-y-3">
                    {displayComments.map(comment => (
                      <div key={comment.id} className="flex items-center space-x-3">
                        <Link href={`/profile/${comment.user.id}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.profilePicture} alt={comment.user.fullName} />
                            <AvatarFallback>{getInitials(comment.user.fullName)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="bg-gray-100 py-2 px-3 rounded-2xl">
                          <Link href={`/profile/${comment.user.id}`}>
                            <div className="font-semibold text-xs">{comment.user.fullName}</div>
                          </Link>
                          <p className="text-xs mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">No comments yet</p>
                )}
              </>
            )}

            {/* Comment input */}
            <div className="flex items-center mt-3 focus-within:border-primary">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user?.profilePicture} alt={user?.fullName || 'Your profile'} />
                <AvatarFallback>{user ? getInitials(user.fullName) : 'You'}</AvatarFallback>
              </Avatar>

              <div className="flex-1 flex items-center border rounded-full pr-1 focus-within:border-primary">
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  className="text-sm py-2 px-3 flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                  disabled={commentMutation.isPending}
                />

                <Button 
                  className="text-primary font-medium text-sm h-8 w-8 p-0 rounded-full"
                  onClick={handleComment}
                  disabled={!newComment.trim() || commentMutation.isPending}
                >
                  {commentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;