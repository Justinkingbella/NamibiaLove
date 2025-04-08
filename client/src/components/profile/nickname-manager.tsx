import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PenLine, Check, X, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NicknameManagerProps {
  isCurrentUser: boolean;
  targetUser: {
    id: number;
    fullName: string;
    username: string;
  };
  initialNickname?: string;
}

const NicknameManager: React.FC<NicknameManagerProps> = ({ 
  isCurrentUser, 
  targetUser,
  initialNickname
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(initialNickname || '');
  const [tempNickname, setTempNickname] = useState(nickname);
  const { toast } = useToast();

  const saveNickname = () => {
    // Here you would make an API call to save the nickname
    setNickname(tempNickname);
    setIsEditing(false);
    toast({
      title: "Nickname Saved",
      description: `Nickname for ${targetUser.fullName} has been updated.`,
    });
  };

  const cancelEdit = () => {
    setTempNickname(nickname);
    setIsEditing(false);
  };

  // Don't show this component on current user's own profile
  if (isCurrentUser) return null;

  return (
    <Card className="overflow-hidden border-yellow-200">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-800">Nickname</h3>
          </div>
          
          {!isEditing ? (
            <Button 
              variant="outline"
              size="sm" 
              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              onClick={() => setIsEditing(true)}
            >
              <PenLine className="h-4 w-4 mr-1" /> {nickname ? 'Edit' : 'Add'}
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={cancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="sm" 
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={saveNickname}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <Input
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              placeholder="Enter a nickname"
              className="border-yellow-200 focus-visible:ring-yellow-400"
            />
            <p className="text-xs text-gray-500">
              This nickname is only visible to you when chatting with this person
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 rounded-lg p-6 text-center">
            {nickname ? (
              <>
                <p className="text-xl font-medium text-yellow-700 mb-1">{nickname}</p>
                <p className="text-sm text-gray-500">Your nickname for {targetUser.fullName}</p>
              </>
            ) : (
              <p className="text-gray-500">
                Add a special nickname for {targetUser.fullName}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NicknameManager;