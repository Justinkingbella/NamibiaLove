import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  MessageSquare, 
  Palette, 
  Settings2,
  Moon,
  Sun,
  HeartHandshake,
  Sparkles,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThemeOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

interface MessageSettingsProps {
  isCurrentUser: boolean;
}

const MessageSettings: React.FC<MessageSettingsProps> = ({ isCurrentUser }) => {
  const { toast } = useToast();

  const themes: ThemeOption[] = [
    { 
      id: 'default', 
      name: 'Default', 
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'text-blue-500',
      gradient: 'from-blue-100 to-blue-50'
    },
    { 
      id: 'dark', 
      name: 'Dark Mode', 
      icon: <Moon className="h-6 w-6" />,
      color: 'text-gray-700',
      gradient: 'from-gray-200 to-gray-100'
    },
    { 
      id: 'romantic', 
      name: 'Romantic', 
      icon: <HeartHandshake className="h-6 w-6" />,
      color: 'text-pink-500',
      gradient: 'from-pink-100 to-pink-50'
    },
    { 
      id: 'vibrant', 
      name: 'Vibrant', 
      icon: <Sparkles className="h-6 w-6" />,
      color: 'text-purple-500',
      gradient: 'from-purple-100 to-purple-50'
    },
    { 
      id: 'energetic', 
      name: 'Energetic', 
      icon: <Zap className="h-6 w-6" />,
      color: 'text-yellow-500',
      gradient: 'from-yellow-100 to-yellow-50'
    },
  ];

  const [selectedTheme, setSelectedTheme] = useState<string>('default');

  const saveSettings = () => {
    toast({
      title: "Theme Saved",
      description: "Your message theme preference has been saved.",
    });
  };

  // Only show if this is the current user's profile
  if (!isCurrentUser) return null;

  return (
    <Card className="overflow-hidden border-teal-200">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-gray-800">Message Appearance</h3>
          </div>
          
          <Button 
            variant="outline"
            size="sm" 
            className="text-teal-600 border-teal-200 hover:bg-teal-50"
            onClick={saveSettings}
          >
            <Settings2 className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>

        <ScrollArea className="h-[150px] pr-4">
          <div className="space-y-3">
            {themes.map((theme) => (
              <div 
                key={theme.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all
                  ${selectedTheme === theme.id ? 
                    `bg-gradient-to-r ${theme.gradient} border border-${theme.color.split('-')[0]}-200` : 
                    'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div className={`mr-3 ${theme.color}`}>
                  {theme.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{theme.name}</h4>
                  <p className="text-xs text-gray-500">Change your chat appearance</p>
                </div>
                {selectedTheme === theme.id && (
                  <CheckCircle className="h-5 w-5 text-teal-500" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MessageSettings;