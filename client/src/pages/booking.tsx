import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS, NAMIBIA_CITIES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MapPin, Loader2, CalendarIcon, Clock } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Modal from '@/components/common/modal';

interface User {
  id: number;
  fullName: string;
  location?: string;
  profilePicture?: string;
}

const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return {
    value: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    label: `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  };
});

const BookingPage: React.FC = () => {
  const [match, params] = useRoute<{ id: string }>('/booking/:id');
  const [, setNavigation] = useLocation();
  const { user } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('19:00');
  const [location, setLocation] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const recipientId = match ? parseInt(params.id) : null;

  // Fetch recipient details
  const { data: recipient, isLoading: recipientLoading } = useQuery<User>({
    queryKey: [API_ENDPOINTS.USERS.DETAIL(recipientId || 0)],
    enabled: !!recipientId,
    staleTime: 300000, // 5 minutes
  });

  // Book date mutation
  const bookDateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !recipientId) {
        throw new Error('Missing required fields');
      }
      
      // Combine date and time
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      dateTime.setHours(hours, minutes);
      
      const finalLocation = location === 'custom' ? customLocation : location;
      
      const response = await apiRequest('POST', API_ENDPOINTS.DATE_BOOKINGS.CREATE, {
        recipientId,
        date: dateTime.toISOString(),
        location: finalLocation,
        note,
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.DATE_BOOKINGS.LIST] });
      setShowSuccessModal(true);
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Failed to book date",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast({
        title: "Missing date",
        description: "Please select a date for your date",
        variant: "destructive",
      });
      return;
    }
    
    if (!location || (location === 'custom' && !customLocation)) {
      toast({
        title: "Missing location",
        description: "Please select or enter a location for your date",
        variant: "destructive",
      });
      return;
    }
    
    bookDateMutation.mutate();
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setNavigation('/');
  };

  if (recipientLoading || !recipient) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 font-sans">Schedule a Date</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="font-medium mb-2">With</h3>
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={recipient.profilePicture} alt={recipient.fullName} />
                <AvatarFallback>{getInitials(recipient.fullName)}</AvatarFallback>
              </Avatar>
              
              <div className="ml-3">
                <h4 className="font-semibold">{recipient.fullName}</h4>
                {recipient.location && (
                  <div className="text-xs text-gray-500">{recipient.location}, Namibia</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Date & Time</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block text-xs text-gray-500 mb-1">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="block text-xs text-gray-500 mb-1">Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Location</h3>
            <div className="space-y-3">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Craft Café, Windhoek">Craft Café, Windhoek</SelectItem>
                  <SelectItem value="The Wine Bar, Windhoek">The Wine Bar, Windhoek</SelectItem>
                  <SelectItem value="Swakopmund Beach">Swakopmund Beach</SelectItem>
                  <SelectItem value="Walvis Bay Waterfront">Walvis Bay Waterfront</SelectItem>
                  <SelectItem value="custom">Enter custom location</SelectItem>
                </SelectContent>
              </Select>
              
              {location === 'custom' && (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Enter a location"
                    className="pl-9"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Note</h3>
            <Textarea
              placeholder="Add a personal note (optional)"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary h-20 resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-400 hover:opacity-90 text-white py-3 rounded-lg font-medium"
            disabled={bookDateMutation.isPending}
          >
            {bookDateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Send Date Request"
            )}
          </Button>
        </form>
        
        <Modal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccess}
          title="Date Request Sent!"
        >
          <div className="p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Date Request Sent!</h3>
            <p className="text-gray-600 mb-6">
              Your date request has been sent to {recipient.fullName}. You'll be notified when they respond.
            </p>
            
            <Button onClick={handleCloseSuccess} className="w-full">
              Done
            </Button>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default BookingPage;
