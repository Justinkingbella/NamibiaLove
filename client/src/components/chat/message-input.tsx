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
    <div className="sticky bottom-0 left-0 right-0 bg-white">
      <div className="flex items-center py-2 px-3">
        <div className="flex-1 pr-2">
          <Input
            type="text"
            placeholder="Write your message here"
            className="w-full rounded-2xl px-4 py-3 focus-visible:ring-1 focus-visible:ring-primary border-gray-200 shadow-sm"
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
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 border-none bg-gray-100"
          >
            <Smile className="h-5 w-5 text-gray-600" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 border-none bg-gray-100"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </Button>
          
          <Button
            size="icon"
            className={cn(
              "rounded-full w-10 h-10 ml-1",
              value.trim() ? "bg-primary hover:bg-primary/90 text-white" : "bg-gray-200 text-gray-500"
            )}
            onClick={onSend}
            disabled={!value.trim() || disabled}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" fill="currentColor" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
