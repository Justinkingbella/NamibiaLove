import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPin } from 'lucide-react';
import { formatEventDate, getInitials } from '@/lib/utils';

interface User {
  id: number;
  fullName: string;
  profilePicture?: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  location: string;
  date: string;
  imageUrl?: string;
  eventType: string;
  creator: User;
  attendeeCount: number;
  userStatus: string;
}

const EventList: React.FC = () => {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: [API_ENDPOINTS.EVENTS.LIST],
    staleTime: 60000, // 1 minute
  });

  // Filter to only future events and get first 2
  const upcomingEvents = events?.filter(event => new Date(event.date) > new Date()).slice(0, 2);

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex space-x-4 pb-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-64 rounded-lg overflow-hidden shadow-md bg-white flex-shrink-0">
                <Skeleton className="w-full h-32" />
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!upcomingEvents?.length) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold font-sans">Upcoming Events</h2>
        <Link href="/events" className="text-orange-400 font-medium text-sm">
          See All
        </Link>
      </div>
      
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex space-x-4 pb-2">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="w-64 rounded-lg overflow-hidden shadow-md bg-white flex-shrink-0">
              <img 
                src={event.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHNvY2lhbCUyMGdhdGhlcmluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"} 
                alt={event.title} 
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={event.eventType === 'Dating' 
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                      : 'bg-orange-100 text-orange-800 border-orange-200'
                    }
                  >
                    {event.eventType}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, event.attendeeCount))].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs">
                        {i+1}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    +{event.attendeeCount} going
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventList;
