import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Gift, Plus, Heart, Star, Coffee, Flower, Diamond, Gem, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GiftAreaProps {
  isCurrentUser: boolean;
  userId: number;
}

interface Gift {
  id: number;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const GiftArea: React.FC<GiftAreaProps> = ({ isCurrentUser, userId }) => {
  const { toast } = useToast();
  
  // Mock data for gifts
  const [gifts, setGifts] = useState<Gift[]>([
    { id: 1, name: "Rose", icon: <Flower className="h-6 w-6" />, count: 5, color: "text-red-500" },
    { id: 2, name: "Heart", icon: <Heart className="h-6 w-6" />, count: 12, color: "text-pink-500" },
    { id: 3, name: "Star", icon: <Star className="h-6 w-6" />, count: 8, color: "text-yellow-500" },
    { id: 4, name: "Coffee", icon: <Coffee className="h-6 w-6" />, count: 3, color: "text-brown-500" },
    { id: 5, name: "Diamond", icon: <Diamond className="h-6 w-6" />, count: 1, color: "text-blue-500" },
  ]);

  const sendGift = () => {
    toast({
      title: "Coming Soon",
      description: "Gift sending feature will be available soon!",
    });
  };

  return (
    <Card className="overflow-hidden border-purple-200">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Gifts Received</h3>
          </div>
          
          {!isCurrentUser && (
            <Button 
              variant="outline"
              size="sm" 
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
              onClick={sendGift}
            >
              <Plus className="h-4 w-4 mr-1" /> Send Gift
            </Button>
          )}
        </div>

        {gifts.length > 0 ? (
          <ScrollArea className="h-[130px] pr-4">
            <div className="grid grid-cols-3 gap-3">
              {gifts.map((gift) => (
                <div 
                  key={gift.id} 
                  className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-xl border border-purple-100"
                >
                  <div className={`mb-1 ${gift.color}`}>
                    {gift.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{gift.name}</span>
                  <span className="text-xs text-gray-500">×{gift.count}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-purple-50 rounded-lg">
            <Sparkles className="h-12 w-12 text-purple-300 mb-2" />
            <p className="text-center text-gray-500">
              {isCurrentUser ? "You haven't received any gifts yet" : "This user hasn't received any gifts yet"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GiftArea;