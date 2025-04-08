import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Check, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { apiRequest } from '@/lib/queryClient';

interface ProfilePictureUploadProps {
  currentImage?: string | null;
  username: string;
  onImageUpdated: (newImageUrl: string) => void;
}

export function ProfilePictureUpload({ 
  currentImage, 
  username, 
  onImageUpdated 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or GIF image.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('profilePicture', fileInputRef.current.files[0]);
    
    try {
      const response = await apiRequest('POST', '/api/users/profile-picture', formData, true);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
        
        // Update parent component with new image URL
        onImageUpdated(data.profilePicture);
        
        // Clear the preview and file input
        setPreviewImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.message || "Failed to upload profile picture");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const cancelUpload = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-32 h-32 rounded-full overflow-hidden relative group">
        <Avatar className="w-full h-full border-4 border-primary/30">
          <AvatarImage 
            src={previewImage || currentImage || undefined} 
            alt={username}
            className="object-cover w-full h-full" 
          />
          <AvatarFallback className="text-2xl bg-primary/10">
            {getUserInitials(username)}
          </AvatarFallback>
        </Avatar>
        
        <Label
          htmlFor="profile-picture"
          className="absolute inset-0 flex items-center justify-center bg-black/40 
                    opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Camera className="w-8 h-8 text-white" />
        </Label>
      </div>
      
      <input
        ref={fileInputRef}
        id="profile-picture"
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      
      {previewImage && (
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={cancelUpload}
            disabled={isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProfilePictureUpload;