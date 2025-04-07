import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Loader2, Search, Filter, MapPin, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from '@/lib/utils';
import { motion } from 'framer-motion';

interface User {
  id: number;
  fullName: string;
  age?: number;
  gender?: string;
  location?: string;
  occupation?: string;
  profilePicture?: string;
  interests?: string[];
}

const Discover: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAge, setFilterAge] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: [API_ENDPOINTS.USERS.LIST],
    staleTime: 60000, // 1 minute
  });

  // Filter out current user
  const otherUsers = users?.filter(u => u.id !== user?.id) || [];

  // Apply filters
  const filteredUsers = otherUsers.filter(u => {
    // Search by name
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by age
    const matchesAge = !filterAge || 
      (u.age !== undefined && 
        ((filterAge === '18-25' && u.age >= 18 && u.age <= 25) ||
         (filterAge === '26-35' && u.age >= 26 && u.age <= 35) ||
         (filterAge === '36-45' && u.age >= 36 && u.age <= 45) ||
         (filterAge === '46+' && u.age >= 46)));
    
    // Filter by gender
    const matchesGender = !filterGender || u.gender === filterGender;
    
    // Filter by location
    const matchesLocation = !filterLocation || 
      (u.location && u.location.toLowerCase().includes(filterLocation.toLowerCase()));
    
    return matchesSearch && matchesAge && matchesGender && matchesLocation;
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setFilterAge('');
    setFilterGender('');
    setFilterLocation('');
  };

  return (
    <MainLayout>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleFilters}
              className={showFilters ? "bg-primary/10 text-primary" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div 
              className="mt-3 p-3 border rounded-md bg-gray-50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Age Range</label>
                  <Select value={filterAge} onValueChange={setFilterAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any age</SelectItem>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="26-35">26-35</SelectItem>
                      <SelectItem value="36-45">36-45</SelectItem>
                      <SelectItem value="46+">46+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Gender</label>
                  <Select value={filterGender} onValueChange={setFilterGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any gender</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Location</label>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any location</SelectItem>
                    <SelectItem value="Windhoek">Windhoek</SelectItem>
                    <SelectItem value="Swakopmund">Swakopmund</SelectItem>
                    <SelectItem value="Walvis Bay">Walvis Bay</SelectItem>
                    <SelectItem value="Otjiwarongo">Otjiwarongo</SelectItem>
                    <SelectItem value="Oshakati">Oshakati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map(user => (
                  <Link href={`/profile/${user.id}`} key={user.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={user.profilePicture || "https://images.unsplash.com/photo-1518399681705-1c1a55e5e883?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bmFtaWJpYXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60"} 
                          alt={`${user.fullName}'s profile cover`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex">
                          <div className="-mt-12 mr-4">
                            <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                              <AvatarImage 
                                src={user.profilePicture} 
                                alt={user.fullName} 
                              />
                              <AvatarFallback className="text-lg font-medium">
                                {getInitials(user.fullName)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 pt-1">
                            <h3 className="font-semibold text-lg">
                              {user.fullName}{user.age ? `, ${user.age}` : ''}
                            </h3>
                            
                            <div className="flex flex-col gap-1 mt-2 text-sm text-gray-600">
                              {user.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  <span>{user.location}</span>
                                </div>
                              )}
                              
                              {user.occupation && (
                                <div className="flex items-center gap-1">
                                  <Briefcase size={14} />
                                  <span>{user.occupation}</span>
                                </div>
                              )}
                            </div>
                            
                            {user.interests && user.interests.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {user.interests.slice(0, 3).map((interest, i) => (
                                  <span 
                                    key={i} 
                                    className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                                  >
                                    {interest}
                                  </span>
                                ))}
                                {user.interests.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    +{user.interests.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                No users found matching your criteria
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Discover;
