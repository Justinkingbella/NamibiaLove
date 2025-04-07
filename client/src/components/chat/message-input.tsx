import React, { useState } from 'react';
import { Image, Smile, Send, Paperclip, Loader2 } from 'lucide-react';
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
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Image className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 mx-2">
          <Input
            type="text"
            placeholder="Type a message..."
            className="w-full border border-gray-300 rounded-full py-2 px-4 focus-visible:ring-1 focus-visible:ring-primary"
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
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
        >
          <Smile className="h-5 w-5" />
        </Button>
        
        <Button
          size="icon"
          className={cn(
            "rounded-full",
            value.trim() ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
          )}
          onClick={onSend}
          disabled={!value.trim() || disabled}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
