import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Loader2, Search, Filter, MapPin, Briefcase, Heart } from 'lucide-react';
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

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: [API_ENDPOINTS.USERS.LIST],
    staleTime: 60000,
  });

  const otherUsers = users?.filter(u => u.id !== user?.id) || [];

  const filteredUsers = otherUsers.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAge = !filterAge || 
      (u.age !== undefined && 
        ((filterAge === '18-25' && u.age >= 18 && u.age <= 25) ||
         (filterAge === '26-35' && u.age >= 26 && u.age <= 35) ||
         (filterAge === '36-45' && u.age >= 36 && u.age <= 45) ||
         (filterAge === '46+' && u.age >= 46)));
    const matchesGender = !filterGender || u.gender === filterGender;
    const matchesLocation = !filterLocation || 
      (u.location && u.location.toLowerCase().includes(filterLocation.toLowerCase()));

    return matchesSearch && matchesAge && matchesGender && matchesLocation;
  });

  return (
    <MainLayout>
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover</h1>
            <p className="text-gray-500">Find your perfect match</p>
          </div>

          <div className="flex gap-2 mb-6">
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
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Select value={filterAge} onValueChange={setFilterAge}>
                <SelectTrigger>
                  <SelectValue placeholder="Age Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any age</SelectItem>
                  <SelectItem value="18-25">18-25</SelectItem>
                  <SelectItem value="26-35">26-35</SelectItem>
                  <SelectItem value="36-45">36-45</SelectItem>
                  <SelectItem value="46+">46+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any gender</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
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
            </motion.div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
              {filteredUsers.map((user, index) => (
                <Link href={`/profile/${user.id}`} key={user.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group cursor-pointer ${
                      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                    }`}
                  >
                    <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 bg-white">
                      <div className={`relative ${index === 0 ? 'h-96' : 'h-64'}`}>
                        <img 
                          src={user.profilePicture || "https://images.unsplash.com/photo-1518399681705-1c1a55e5e883?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bmFtaWJpYXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60"} 
                          alt={user.fullName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="text-xl font-semibold mb-1">
                            {user.fullName}{user.age ? `, ${user.age}` : ''}
                          </h3>
                          <div className="flex items-center gap-3 text-sm">
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
                        </div>
                      </div>
                      {user.interests && user.interests.length > 0 && (
                        <CardContent className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {user.interests.slice(0, 3).map((interest, i) => (
                              <span 
                                key={i} 
                                className="px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-medium"
                              >
                                {interest}
                              </span>
                            ))}
                            {user.interests.length > 3 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                +{user.interests.length - 3}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Discover;