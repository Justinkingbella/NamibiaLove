import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Crown, Clock, ArrowRight, Check } from 'lucide-react';

interface SubscriptionStatusProps {
  isCurrentUser: boolean;
  isPremium: boolean;
  expiresAt?: Date;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  isCurrentUser, 
  isPremium,
  expiresAt
}) => {
  // Format expiration date
  const formatExpiryDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className={`overflow-hidden ${isPremium ? 'border-amber-300' : 'border-gray-200'}`}>
      <div className={`w-full h-1 ${isPremium ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gray-200'}`}></div>
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Crown className={`h-5 w-5 ${isPremium ? 'text-amber-500' : 'text-gray-400'}`} />
            <h3 className="text-lg font-semibold text-gray-800">
              Membership
            </h3>
          </div>
          
          {isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-none">
              Premium
            </Badge>
          )}
        </div>

        {isPremium ? (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Unlimited matches</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Priority in search results</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Advanced filters</span>
              </div>
              
              {isCurrentUser && expiresAt && (
                <div className="flex items-center mt-3 text-amber-700 text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Renews on {formatExpiryDate(expiresAt)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-4">
              {isCurrentUser 
                ? "Upgrade to Premium to unlock all features" 
                : "This user is using the free version"}
            </p>
            
            {isCurrentUser && (
              <Button asChild className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white">
                <Link href="/subscribe">
                  Upgrade to Premium <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;