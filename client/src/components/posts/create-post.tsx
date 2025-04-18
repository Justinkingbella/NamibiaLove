
import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatePostProps {
  post?: {
    id: number;
    content: string;
    mediaUrls?: string[];
  };
  isEditing?: boolean;
  onClose?: () => void;
}

const CreatePost = ({ post, isEditing, onClose }: CreatePostProps) => {
  const [content, setContent] = useState(post?.content || '');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(post?.mediaUrls || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest(
        'POST',
        isEditing ? `${API_ENDPOINTS.POSTS.UPDATE}/${post?.id}` : API_ENDPOINTS.POSTS.CREATE,
        formData,
        true
      );
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.POSTS.FEED] });
      setContent('');
      setImages([]);
      setPreviewUrls([]);
      toast({
        title: isEditing ? "Post updated" : "Post created",
        description: isEditing ? "Your post has been updated successfully" : "Your post has been created successfully",
      });
      if (onClose) {
        onClose();
      }
      return data;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    const formData = new FormData();
    formData.append('content', content.trim());
    images.forEach(image => {
      formData.append('images', image);
    });

    createPostMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] resize-none"
      />
      
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img src={url} alt={`Preview ${index}`} className="rounded-lg w-full h-32 object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          multiple
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-500"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        
        <Button 
          type="submit"
          disabled={(!content.trim() && images.length === 0) || createPostMutation.isPending}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
        >
          {createPostMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {isEditing ? 'Update' : 'Post'}
        </Button>
      </div>
    </form>
  );
};

export default CreatePost;
