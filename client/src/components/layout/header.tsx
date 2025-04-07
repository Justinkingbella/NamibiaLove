import React from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Bell, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, APP_NAME } from '@/lib/constants';

const Header: React.FC = () => {
  const [location] = useLocation();
  
  // Get unread message count
  const { data: unreadData } = useQuery({
    queryKey: [API_ENDPOINTS.MESSAGES.GET_UNREAD_COUNT],
    staleTime: 10000, // 10 seconds
  });
  
  const unreadCount = unreadData?.count || 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary font-sans">{APP_NAME}</h1>
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" aria-label="Search" asChild>
            <Link href="/discover">
              <Search className="h-5 w-5 text-gray-600" />
            </Link>
          </Button>
          
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {/* We'll add notifications in the future */}
              {/* <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-accent text-white">
                3
              </Badge> */}
            </div>
          </Button>
          
          <Button variant="ghost" size="icon" aria-label="Messages" asChild>
            <Link href="/chat">
              <div className="relative">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-accent text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
