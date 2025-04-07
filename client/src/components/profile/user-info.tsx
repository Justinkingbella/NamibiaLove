import React from 'react';
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  Mail, 
  User, 
  Heart
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  };
}

const UserInfo: React.FC<UserProps> = ({ user }) => {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">About</h3>
          
          <div className="space-y-3">
            {user.bio && (
              <p className="text-sm text-gray-700">{user.bio}</p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400" />
              <span>{user.gender || 'Not specified'}</span>
            </div>
            
            {user.age && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{user.age} years old</span>
              </div>
            )}
            
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{user.location}, Namibia</span>
              </div>
            )}
            
            {user.occupation && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span>{user.occupation}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{user.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {user.interests && user.interests.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <span className="font-medium">Username:</span> @{user.username}
            </div>
            <div>
              <span className="font-medium">Member since:</span> {formatDate(user.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserInfo;
