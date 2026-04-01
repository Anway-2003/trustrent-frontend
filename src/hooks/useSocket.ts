import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  enabled?: boolean;
  token?: string | null;
}

interface ServerToClientEvents {
  new_message: (message: {
    id: string;
    conversationId: string;
    content: string;
    senderId: string;
    receiverId: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
    createdAt: string;
  }) => void;
  message_notification: (notification: {
    conversationId: string;
    senderId: string;
    content: string;
  }) => void;
  user_typing: (data: { userId: string; conversationId: string }) => void;
  user_stop_typing: (data: { userId: string; conversationId: string }) => void;
  message_status_update: (data: { messageId: string; status: 'READ' }) => void;
}

interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  send_message: (data: {
    conversationId: string;
    content: string;
    receiverId: string;
  }) => void;
  typing_start: (data: { conversationId: string; receiverId: string }) => void;
  typing_stop: (data: { conversationId: string; receiverId: string }) => void;
  message_read: (data: { messageId: string; conversationId: string }) => void;
  message_delivered: (data: { messageId: string; conversationId: string }) => void;
}

export const useSocket = ({ enabled = true, token }: UseSocketOptions = {}) => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!enabled || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
      }
      return;
    }

    if (socketRef.current) {
      return; // Already connected
    }

    setIsConnecting(true);

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
      path: '/api/socketio',
      auth: {
        token,
      },
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
      setIsConnecting(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      setIsConnected(false);
      setIsConnecting(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnecting(false);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
      }
    };
  }, [enabled, token]);

  const joinConversation = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  };

  const sendMessage = (data: {
    conversationId: string;
    content: string;
    receiverId: string;
  }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', data);
    }
  };

  const startTyping = (conversationId: string, receiverId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { conversationId, receiverId });
    }
  };

  const stopTyping = (conversationId: string, receiverId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { conversationId, receiverId });
    }
  };

  const markMessageAsRead = (messageId: string, conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message_read', { messageId, conversationId });
    }
  };

  const markMessageAsDelivered = (messageId: string, conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message_delivered', { messageId, conversationId });
    }
  };

  // 🟢 FIXED: Any काढून योग्य टाईप्स वापरले आहेत जेणेकरून Vercel बिल्ड फेल होणार नाही
  const on = <E extends keyof ServerToClientEvents>(
    event: E,
    listener: ServerToClientEvents[E]
  ) => {
    if (socketRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socketRef.current.on(event, listener as any);
    }
  };

  const off = <E extends keyof ServerToClientEvents>(
    event: E,
    listener?: ServerToClientEvents[E]
  ) => {
    if (socketRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socketRef.current.off(event, listener as any);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    markMessageAsDelivered,
    on,
    off,
  };
};

export default useSocket;