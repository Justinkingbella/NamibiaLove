import React from 'react';
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  Mail, 
  User, 
  Heart,
  Info,
  GraduationCap,
  Music,
  Utensils,
  Film,
  Book,
  Users,
  Globe
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import OnlineStatus, { OnlineStatusType } from './online-status';

interface UserProps {
  user: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    bio?: string;
    age?: number;
    gender?: string;
    location?: string;
    occupation?: string;
    interests?: string[];
    createdAt?: string;
    personalityType?: string;
  };
  isCurrentUser: boolean;
}

const UserInfo: React.FC<UserProps> = ({ user, isCurrentUser }) => {
  // Format account creation date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Simulate online status - would come from API in real app
  const onlineStatus: OnlineStatusType = isCurrentUser ? 'online' : 'offline';
  const lastActive = isCurrentUser ? undefined : new Date(Date.now() - 3600000); // 1 hour ago

  const interestIcons: Record<string, React.ReactNode> = {
    'Music': <Music className="h-3 w-3" />,
    'Food': <Utensils className="h-3 w-3" />,
    'Movies': <Film className="h-3 w-3" />,
    'Books': <Book className="h-3 w-3" />,
    'Travel': <Globe className="h-3 w-3" />,
    'Education': <GraduationCap className="h-3 w-3" />,
    'Socializing': <Users className="h-3 w-3" />
  };

  // Get an appropriate icon for each interest
  const getInterestIcon = (interest: string) => {
    for (const [key, icon] of Object.entries(interestIcons)) {
      if (interest.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return <Heart className="h-3 w-3" />; // Default icon
  };

  return (
    <div className="w-full">
      <Card className="overflow-hidden border-indigo-200 hover:shadow-lg transition-all duration-300">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 flex justify-between items-center border-b border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
            <Info className="h-5 w-5 mr-2 text-indigo-600" />
            About {isCurrentUser ? 'Me' : user.fullName.split(' ')[0]}
          </h3>
          <OnlineStatus status={onlineStatus} lastActive={lastActive} />
        </div>
        
        <CardContent className="pt-5">
          {user.bio && (
            <div className="mb-4">
              <p className="text-gray-700 italic">"{user.bio}"</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-4 w-4 text-indigo-500" />
                <span className="font-medium">Gender:</span> 
                <span>{user.gender || 'Not specified'}</span>
              </div>
              
              {user.age && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">Age:</span>
                  <span>{user.age} years old</span>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">Location:</span>
                  <span>{user.location}, Namibia</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {user.occupation && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">Occupation:</span>
                  <span>{user.occupation}</span>
                </div>
              )}
              
              {user.personalityType && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">Personality:</span>
                  <span>{user.personalityType}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {user.interests && user.interests.length > 0 && (
        <Card className="overflow-hidden border-teal-200">
          <div className="bg-gradient-to-r from-teal-50 to-green-50 px-6 py-4">
            <h3 className="text-lg font-semibold text-teal-800 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-teal-600" />
              Interests & Hobbies
            </h3>
          </div>
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-gradient-to-r from-teal-50 to-teal-100 text-teal-800 border-teal-200 px-3 py-1"
                >
                  <span className="flex items-center">
                    <span className="mr-1.5 text-teal-600">{getInterestIcon(interest)}</span>
                    {interest}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="overflow-hidden border-amber-200">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-amber-800 flex items-center">
            <User className="h-5 w-5 mr-2 text-amber-600" />
            Account Information
          </h3>
        </div>
        <CardContent className="pt-5">
          <div className="space-y-3 text-gray-700">
            <div className="flex items-center">
              <span className="font-medium w-36">Username:</span> 
              <span>@{user.username}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center">
              <span className="font-medium w-36">Member since:</span> 
              <span>{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserInfo;
