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
      <Card className="overflow-hidden border-indigo-200 hover:shadow-lg transition-all duration-300 px-3">
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
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-sky-50/50 to-blue-50/50 p-4 rounded-xl flex items-center gap-3 border border-sky-100/20 hover:shadow-md transition-all">
                <div className="bg-sky-100/50 p-2 rounded-lg">
                  <User className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <span className="text-sm text-sky-600 font-medium block">Gender</span>
                  <span className="text-gray-700">{user.gender || 'Not specified'}</span>
                </div>
              </div>

              {user.age && (
                <div className="bg-gradient-to-br from-green-50/50 to-lime-50/50 p-4 rounded-xl flex items-center gap-3 border border-green-100/20 hover:shadow-md transition-all">
                  <div className="bg-green-100/50 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm text-green-600 font-medium block">Age</span>
                    <span className="text-gray-700">{user.age} years old</span>
                  </div>
                </div>
              )}

              {user.location && (
                <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 p-4 rounded-xl flex items-center gap-3 border border-emerald-100/20 hover:shadow-md transition-all">
                  <div className="bg-emerald-100/50 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-sm text-emerald-600 font-medium block">Location</span>
                    <span className="text-gray-700">{user.location}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {user.email && (
                <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4 rounded-xl flex items-center gap-3 border border-amber-100/20 hover:shadow-md transition-all">
                  <div className="bg-amber-100/50 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-sm text-amber-600 font-medium block">Email</span>
                    <span className="text-gray-700 break-all">{user.email}</span>
                  </div>
                </div>
              )}

              {user.occupation && (
                <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/50 p-4 rounded-xl flex items-center gap-3 border border-rose-100/20 hover:shadow-md transition-all">
                  <div className="bg-rose-100/50 p-2 rounded-lg">
                    <Briefcase className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <span className="text-sm text-rose-600 font-medium block">Occupation</span>
                    <span className="text-gray-700">{user.occupation}</span>
                  </div>
                </div>
              )}

              {user.interests && user.interests.length > 0 && (
                <div className="bg-gradient-to-br from-violet-50/50 to-purple-50/50 p-4 rounded-xl border border-violet-100/20 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-violet-100/50 p-2 rounded-lg">
                      <Heart className="h-5 w-5 text-violet-600" />
                    </div>
                    <span className="text-sm text-violet-600 font-medium">Interests</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.interests.map((interest, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-white/50 text-violet-700 border border-violet-200/50 hover:bg-violet-50/50"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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

      <Card className="overflow-hidden border-amber-200 mt-2 px-3">
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