import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, User, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Avatar3DProps {
  isCurrentUser: boolean;
  avatarData?: any;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ isCurrentUser, avatarData }) => {
  const { toast } = useToast();

  const handleCreate = () => {
    toast({
      title: "Coming Soon",
      description: "3D avatar builder will be available soon!",
    });
  };

  const handleEdit = () => {
    toast({
      title: "Coming Soon",
      description: "3D avatar editor will be available soon!",
    });
  };

  return (
    <Card className="overflow-hidden border-blue-200">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">3D Avatar</h3>
          </div>
          
          {isCurrentUser && (
            <Button 
              variant="outline"
              size="sm" 
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={avatarData ? handleEdit : handleCreate}
            >
              {avatarData ? (
                <>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" /> Create
                </>
              )}
            </Button>
          )}
        </div>

        {avatarData ? (
          <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-lg p-2 flex justify-center items-center h-[140px]">
            {/* This would be where the actual 3D avatar renders */}
            <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center">
              <User className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-lg">
            <User className="h-12 w-12 text-blue-300 mb-2" />
            <p className="text-center text-gray-500">
              {isCurrentUser 
                ? "Create your 3D avatar for a unique profile" 
                : "This user hasn't created a 3D avatar yet"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Avatar3D;