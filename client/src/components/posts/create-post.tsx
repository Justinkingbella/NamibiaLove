
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Image, Send } from 'lucide-react';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string }) => {
      const response = await apiRequest('POST', API_ENDPOINTS.POSTS.CREATE, postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.POSTS.FEED] });
      setContent('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createPostMutation.mutate({ content: content.trim() });
    }
  };

  return (
    <Card className="mb-6 p-4">
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-4 resize-none"
          rows={3}
        />
        <div className="flex justify-between items-center">
          <Button variant="outline" type="button" className="text-gray-500">
            <Image className="h-5 w-5" />
          </Button>
          <Button 
            type="submit"
            disabled={!content.trim() || createPostMutation.isPending}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          >
            {createPostMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Post
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePost;
