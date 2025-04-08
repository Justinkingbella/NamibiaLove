import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Heart, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  fullName: string;
  username: string;
  profilePicture?: string;
}

interface SecretLoverProps {
  isCurrentUser: boolean;
}

const SecretLover: React.FC<SecretLoverProps> = ({ isCurrentUser }) => {
  const [secretLover, setSecretLover] = useState<User | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const { toast } = useToast();

  // This would normally fetch data from the API
  // For now we'll use a placeholder example
  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  const addSecretLover = () => {
    toast({
      title: "Coming Soon",
      description: "Secret lovers feature will be available soon!",
    });
  };

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-red-50 border-pink-200 overflow-hidden">
      <div className="absolute top-4 right-4">
        <Lock className="h-5 w-5 text-pink-400" />
      </div>
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-pink-700">Secret Crush</h3>
        </div>

        {isCurrentUser ? (
          <div>
            {secretLover ? (
              <div className="text-center">
                <div className="relative mx-auto w-24 mb-4">
                  <Avatar className="w-24 h-24 border-2 border-pink-300">
                    {isRevealed ? (
                      <>
                        <AvatarImage 
                          src={secretLover.profilePicture} 
                          alt={secretLover.fullName} 
                        />
                        <AvatarFallback className="bg-pink-100 text-pink-800">
                          {getInitials(secretLover.fullName)}
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-pink-100 text-pink-800">
                        <Lock className="h-8 w-8" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white border-pink-200 hover:bg-pink-50"
                    onClick={toggleReveal}
                  >
                    {isRevealed ? (
                      <EyeOff className="h-4 w-4 text-pink-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-pink-600" />
                    )}
                  </Button>
                </div>
                {isRevealed ? (
                  <p className="font-medium text-pink-800">{secretLover.fullName}</p>
                ) : (
                  <p className="font-medium text-pink-800">************</p>
                )}
                <p className="text-sm text-pink-600">Tap the eye to reveal</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-pink-100 text-pink-500 rounded-full p-8 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-12 w-12" />
                </div>
                <p className="text-sm text-pink-700 mb-4">Add someone as your secret crush</p>
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-pink-50 border-pink-200 text-pink-700"
                  onClick={addSecretLover}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Add Secret Crush
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-pink-100 rounded-full p-8 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-12 w-12 text-pink-500" />
            </div>
            <p className="text-sm text-pink-700">
              This user's secret crush is private
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecretLover;