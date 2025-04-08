import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { API_ENDPOINTS, INTEREST_TAGS, NAMIBIA_CITIES, OCCUPATIONS, MAX_IMAGE_SIZE } from '@/lib/constants';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Upload, User, X } from 'lucide-react';
import { getInitials } from '@/lib/utils';

// Define schema for each step
const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  age: z.string().refine((val) => {
    const numVal = parseInt(val);
    return !isNaN(numVal) && numVal >= 18 && numVal <= 100;
  }, { message: 'Age must be between 18 and 100' }),
  gender: z.string().min(1, 'Please select a gender'),
  location: z.string().min(1, 'Please select a location'),
});

const aboutYouSchema = z.object({
  bio: z.string().max(150, 'Bio must be at most 150 characters'),
  occupation: z.string().optional(),
});

const profilePictureSchema = z.object({
  profilePicture: z.string().optional(),
});

const interestsSchema = z.object({
  interests: z.array(z.string()).min(1, 'Select at least 1 interest').max(5, 'You can select up to 5 interests'),
});

// Define merged schema for all steps
const combinedSchema = personalInfoSchema.merge(aboutYouSchema).merge(profilePictureSchema).merge(interestsSchema);

type FormData = z.infer<typeof combinedSchema>;

const OnboardingPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profilePicture || null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Initialize form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      age: user?.age?.toString() || '',
      gender: user?.gender || '',
      location: user?.location || '',
      bio: user?.bio || '',
      occupation: user?.occupation || '',
      profilePicture: user?.profilePicture || '',
      interests: user?.interests || [],
    },
    mode: 'onChange',
  });

  // Loading state
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle file selection for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setProfileImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
      form.setValue('profilePicture', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle interest selection
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        const newInterests = prev.filter(i => i !== interest);
        form.setValue('interests', newInterests);
        return newInterests;
      } else {
        if (prev.length >= 5) {
          toast({
            title: "Maximum reached",
            description: "You can select up to 5 interests",
          });
          return prev;
        }
        const newInterests = [...prev, interest];
        form.setValue('interests', newInterests);
        return newInterests;
      }
    });
  };

  // Navigate between steps
  const nextStep = async () => {
    let isValid = false;
    
    // Validate current step
    switch (step) {
      case 1:
        isValid = await form.trigger(['fullName', 'age', 'gender', 'location']);
        break;
      case 2:
        isValid = await form.trigger(['bio', 'occupation']);
        break;
      case 3:
        // Profile picture is optional
        isValid = true;
        break;
      case 4:
        isValid = await form.trigger(['interests']);
        break;
    }
    
    if (!isValid) return;
    
    if (step < 4) {
      setStep(step + 1);
      setProgress((step + 1) * 25);
    } else {
      // Final step: submit the form
      const formData = form.getValues();
      try {
        setIsUpdating(true);
        // Convert age string to number
        const profileData = {
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined
        };
        await updateProfile(profileData);
        setLocation('/profile');
      } catch (error) {
        console.error('Profile update error:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setProgress((step - 1) * 25);
    }
  };

  return (
    <div className="fixed inset-0 max-w-md mx-auto bg-white flex flex-col">
      <header className="p-4 border-b">
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <Button variant="ghost" size="icon" onClick={prevStep}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-10"></div>
          )}
          
          <h1 className="text-lg font-semibold">Complete Your Profile</h1>
          
          <div className="w-10"></div>
        </div>
        
        <Progress value={progress} className="mt-2" />
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <Form {...form}>
          <form className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">Personal Information</h2>
                  <p className="text-gray-500 text-sm mt-1">Let others know who you are</p>
                </div>

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
                          max={100} 
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
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NAMIBIA_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: About You */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">About You</h2>
                  <p className="text-gray-500 text-sm mt-1">Tell others about yourself</p>
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write a short bio about yourself" 
                          className="resize-none" 
                          maxLength={150}
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-right text-xs text-gray-500">
                        {field.value?.length || 0}/150
                      </div>
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
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your occupation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OCCUPATIONS.map((occupation) => (
                            <SelectItem key={occupation} value={occupation}>{occupation}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Profile Picture */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">Profile Picture</h2>
                  <p className="text-gray-500 text-sm mt-1">Add a photo of yourself</p>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    {profileImagePreview ? (
                      <AvatarImage src={profileImagePreview} alt="Profile picture" />
                    ) : (
                      <AvatarFallback className="bg-primary/10">
                        <User className="h-16 w-16 text-primary/40" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex flex-col items-center">
                    <label htmlFor="profilePicture" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>{profileImagePreview ? 'Change Photo' : 'Upload Photo'}</span>
                      </div>
                      <input
                        id="profilePicture"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Maximum file size: {MAX_IMAGE_SIZE / (1024 * 1024)}MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Interests */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">Your Interests</h2>
                  <p className="text-gray-500 text-sm mt-1">Select up to 5 interests</p>
                </div>

                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {INTEREST_TAGS.map((interest) => (
                          <Badge
                            key={interest}
                            className={`cursor-pointer transition-colors ${
                              selectedInterests.includes(interest)
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => toggleInterest(interest)}
                          >
                            {interest}
                            {selectedInterests.includes(interest) && (
                              <X className="ml-1 h-3 w-3" />
                            )}
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-center text-sm text-gray-500">
                  Selected: {selectedInterests.length}/5
                </div>
              </div>
            )}
          </form>
        </Form>
      </main>

      <footer className="p-6 border-t">
        <Button 
          className="w-full" 
          onClick={nextStep}
          disabled={isUpdating}
        >
          {isUpdating && (
            <div className="mr-2 h-4 w-4 animate-spin">
              <div className="h-full w-full rounded-full border-2 border-t-transparent border-white" />
            </div>
          )}
          {step < 4 ? 'Continue' : 'Complete Profile'}
          {step < 4 && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </footer>
    </div>
  );
};

export default OnboardingPage;