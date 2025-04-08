import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock } from 'lucide-react';

export type OnlineStatusType = 'online' | 'busy' | 'away' | 'offline';

interface OnlineStatusProps {
  status: OnlineStatusType;
  lastActive?: Date;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  status, 
  lastActive 
}) => {
  const getStatusColor = (status: OnlineStatusType) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: OnlineStatusType) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'busy':
        return 'Busy';
      case 'away':
        return 'Away';
      case 'offline':
        return lastActive ? `Last online ${formatLastActive(lastActive)}` : 'Offline';
      default:
        return 'Offline';
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`rounded-full flex items-center ${status === 'offline' ? 'bg-white' : 'bg-white'}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full mr-1.5 ${getStatusColor(status)}`}></span>
            <span className="text-xs">
              {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : status}
            </span>
            {status === 'offline' && lastActive && (
              <Clock className="h-3 w-3 ml-1 text-gray-400" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText(status)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OnlineStatus;