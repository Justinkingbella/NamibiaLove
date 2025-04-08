import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { NAMIBIA_CITIES, OCCUPATIONS, INTEREST_TAGS, MAX_BIO_LENGTH } from '@/lib/constants';
import { ProfilePictureUpload } from '@/components/profile/profile-picture-upload';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

// Validation schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  bio: z.string().max(MAX_BIO_LENGTH, `Bio must be ${MAX_BIO_LENGTH} characters or less`).optional(),
  age: z.string().refine(val => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 18), {
    message: "Age must be 18 or older",
  }).optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  interests: z.array(z.string()).max(5, "You can select up to 5 interests").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileEditPage: React.FC = () => {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      bio: user?.bio || '',
      age: user?.age ? String(user.age) : '',
      gender: user?.gender || '',
      location: user?.location || '',
      occupation: user?.occupation || '',
      interests: user?.interests || [],
    },
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || '',
        bio: user.bio || '',
        age: user.age ? String(user.age) : '',
        gender: user.gender || '',
        location: user.location || '',
        occupation: user.occupation || '',
        interests: user.interests || [],
      });
      
      setSelectedInterests(user.interests || []);
    }
  }, [user, form]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Convert age to number if provided
      const ageValue = data.age ? parseInt(data.age) : undefined;
      
      await updateProfile({
        ...data,
        age: ageValue,
        interests: selectedInterests,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      // Redirect back to profile page
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Error is handled in the updateProfile function
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle interest selection
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else {
        if (prev.length >= 5) {
          toast({
            title: "Maximum reached",
            description: "You can select up to 5 interests",
          });
          return prev;
        }
        return [...prev, interest];
      }
    });
  };

  // Handle profile picture update
  const handleProfilePictureUpdate = (newImageUrl: string) => {
    // The ProfilePictureUpload component already updates the user's profile picture
    // in the database, so we don't need to do anything here
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your profile...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-fuchsia-500 py-4 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
        </div>
        
        <div className="flex justify-between items-center relative z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-bold text-white">Edit Profile</h1>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Profile Picture Section */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Profile Picture</CardTitle>
                <CardDescription>Choose a photo that shows your face clearly</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-2">
                <ProfilePictureUpload
                  currentImage={user.profilePicture}
                  username={user.username}
                  onImageUpdated={handleProfilePictureUpdate}
                />
              </CardContent>
            </Card>
            
            {/* Personal Information Section */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Your age" 
                            min={18}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Non-binary">Non-binary</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NAMIBIA_CITIES.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OCCUPATIONS.map(occupation => (
                            <SelectItem key={occupation} value={occupation}>{occupation}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about yourself..." 
                          className="resize-none" 
                          maxLength={MAX_BIO_LENGTH}
                          {...field} 
                        />
                      </FormControl>
                      <div className="flex justify-end">
                        <p className="text-xs text-gray-500">
                          {field.value?.length || 0}/{MAX_BIO_LENGTH}
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Interests Section */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Interests</CardTitle>
                <CardDescription>Select up to 5 interests</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedInterests.map(interest => (
                    <Badge 
                      key={interest} 
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer hover:bg-secondary/80"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest} ✕
                    </Badge>
                  ))}
                  {selectedInterests.length === 0 && (
                    <p className="text-sm text-gray-500 py-1">No interests selected</p>
                  )}
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {INTEREST_TAGS.filter(tag => !selectedInterests.includes(tag)).map(interest => (
                    <Badge 
                      key={interest} 
                      variant="outline"
                      className="px-3 py-1 cursor-pointer hover:bg-secondary/30"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-6 font-semibold transition-all hover:from-pink-600 hover:to-purple-600 shadow-md"
              disabled={authLoading || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};

export default ProfileEditPage;