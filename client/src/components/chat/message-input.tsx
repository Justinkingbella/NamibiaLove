import React, { useState } from 'react';
import { Mic, Smile, Send, Paperclip, Loader2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  isLoading = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  
  const handleVoiceMessage = () => {
    setIsRecording(!isRecording);
  };
  
  return (
    <div className="bg-white p-1.5 shadow-md border-t border-gray-100">
      <div className="flex items-center gap-2">
        {isRecording ? (
          <div className="flex-1 voice-message">
            <Mic className="h-5 w-5 text-primary animate-pulse" />
            <div className="bg-primary/10 h-6 w-full rounded-full overflow-hidden flex items-center">
              <div className="h-full w-1/3 bg-primary/30 animate-pulse rounded-full"></div>
            </div>
            <span className="text-xs text-gray-500 min-w-[32px] text-center">0:15</span>
          </div>
        ) : (
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Message..."
              className="w-full rounded-full px-4 py-2.5 focus-visible:ring-1 focus-visible:ring-primary border-gray-100 bg-white shadow-sm pl-10"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !disabled) {
                  e.preventDefault();
                  onSend();
                }
              }}
              disabled={disabled}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
            >
              <Smile className="h-5 w-5 text-gray-400" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
            >
              <Image className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        )}
        
        <Button
          size="icon"
          variant={isRecording ? "destructive" : "outline"}
          className="rounded-full w-10 h-10 border-none bg-white shadow-md"
          onClick={isRecording ? handleVoiceMessage : undefined}
        >
          {isRecording ? (
            <div className="h-4 w-4 rounded bg-destructive"></div>
          ) : (
            <Mic className="h-5 w-5 text-primary" onClick={handleVoiceMessage} />
          )}
        </Button>
        
        {value.trim() && !isRecording && (
          <Button
            size="icon"
            className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90 text-white shadow-md"
            onClick={onSend}
            disabled={!value.trim() || disabled}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
