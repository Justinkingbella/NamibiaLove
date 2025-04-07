import { useState, useEffect, useRef, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(userId: number | null, options: UseWebSocketOptions = {}) {
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  // Establish connection
  const connect = useCallback(() => {
    if (!userId) return;
    
    setStatus('connecting');
    
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      setStatus('open');
      setReconnectAttempts(0);
      
      // Authenticate socket with userId
      socket.send(JSON.stringify({
        type: 'authenticate',
        userId
      }));
      
      if (onOpen) onOpen();
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    };
    
    socket.onclose = () => {
      setStatus('closed');
      
      if (onClose) onClose();
      
      if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, reconnectInterval);
      }
    };
    
    socket.onerror = (error) => {
      setStatus('error');
      if (onError) onError(error);
      socket.close();
    };
    
    socketRef.current = socket;
    
    // Clean up on unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [
    userId,
    onMessage,
    onOpen,
    onClose,
    onError,
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
    reconnectAttempts
  ]);

  useEffect(() => {
    connect();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // Send message function
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((receiverId: number, isTyping: boolean = true) => {
    return sendMessage({
      type: 'typing',
      receiverId,
      isTyping
    });
  }, [sendMessage]);

  // Send chat message
  const sendChatMessage = useCallback((receiverId: number, content: string) => {
    return sendMessage({
      type: 'message',
      receiverId,
      content
    });
  }, [sendMessage]);

  // Mark messages as read
  const markMessagesAsRead = useCallback((senderId: number) => {
    return sendMessage({
      type: 'read_messages',
      senderId
    });
  }, [sendMessage]);

  return {
    status,
    sendMessage,
    sendTyping,
    sendChatMessage,
    markMessagesAsRead,
    reconnect: connect,
    reconnectAttempts
  };
}
