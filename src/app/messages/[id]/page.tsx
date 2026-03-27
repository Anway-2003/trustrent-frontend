'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Send, ArrowLeft, User, MoreVertical, Phone, Video,
  Check, CheckCheck, Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ConversationData {
  id: string;
  user1: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  user2: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  property?: {
    id: string;
    title: string;
    city: string;
    monthlyRent: number;
  };
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Unwrap params Promise using React.use()
  const resolvedParams = use(params);
  const conversationId = resolvedParams.id;
  
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize Socket.IO
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const socket = useSocket({ 
    enabled: !!user && !!token, 
    token 
  });
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket.isConnected || !conversationId) return;

    // Join conversation room
    socket.joinConversation(conversationId);

    // Listen for new messages
    const handleNewMessage = (message: any) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          createdAt: message.createdAt,
          status: message.status,
          sender: {
            id: message.senderId,
            firstName: 'Unknown', // Would be populated from user data
            lastName: 'User',
          }
        }]);
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setIsTyping(false);
      }
    };

    // Listen for message status updates (DELIVERED/READ)
    const handleMessageStatusUpdate = (data: { messageId: string; status: 'DELIVERED' | 'READ' }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, status: data.status }
          : msg
      ));
    };

    // Set up event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('message_status_update', handleMessageStatusUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('message_status_update', handleMessageStatusUpdate);
      socket.leaveConversation(conversationId);
    };
  }, [socket.isConnected, conversationId, user?.id]);

  // Load conversation and messages
  useEffect(() => {
    if (user && conversationId) {
      loadConversation();
    }
  }, [user, conversationId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as delivered when user joins conversation
  useEffect(() => {
    if (user && conversation && messages.length > 0 && socket.isConnected) {
      markMessagesAsDelivered();
    }
  }, [user, conversation, messages, socket.isConnected]);

  // Mark messages as read when conversation is viewed (after a short delay)
  useEffect(() => {
    if (user && conversation && messages.length > 0 && socket.isConnected) {
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 1000); // 1 second delay to simulate reading time

      return () => clearTimeout(timer);
    }
  }, [user, conversation, messages, socket.isConnected]);

  const loadConversation = async () => {
    try {
      setIsLoadingConversation(true);
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      const data = await response.json();
      if (data.success) {
        setConversation(data.data.conversation);
        setMessages(data.data.messages);
      } else {
        setError(data.error || 'Errore nel caricamento della conversazione');
      }
    } catch (err) {
      setError('Errore di connessione. Riprova.');
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: messageContent }),
      });

      const data = await response.json();
      if (data.success) {
        // Add new message to the list
        setMessages(prev => [...prev, data.data]);
        
        // Send real-time update via Socket.IO
        if (socket.isConnected && conversation && user) {
          const otherUser = conversation.user1.id === user.id ? conversation.user2 : conversation.user1;
          socket.sendMessage({
            conversationId,
            content: messageContent,
            receiverId: otherUser.id,
          });
        }
      } else {
        setError(data.error || 'Errore nell\'invio del messaggio');
        setNewMessage(messageContent); // Restore message on error
      }
    } catch (err) {
      setError('Errore di connessione. Riprova.');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Handle typing indicators
    if (socket.isConnected && conversation && user) {
      const otherUser = conversation.user1.id === user.id ? conversation.user2 : conversation.user1;
      
      // Start typing
      socket.startTyping(conversationId, otherUser.id);
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Stop typing after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        socket.stopTyping(conversationId, otherUser.id);
      }, 4000);
      
      setTypingTimeout(timeout as unknown as NodeJS.Timeout);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Check className="h-4 w-4 text-gray-400" />;
      case 'DELIVERED':
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case 'READ':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // eventually mark messages as delivered when user receives them
  const markMessagesAsDelivered = () => {
    if (!user || !socket.isConnected) return;

    // Find messages that are only SENT and were sent to current user
    const undeliveredMessages = messages.filter(
      msg => msg.receiverId === user.id && msg.status === 'SENT'
    );

    // Mark as delivered via Socket.IO
    undeliveredMessages.forEach(msg => {
      socket.markMessageAsDelivered(msg.id, conversationId);
    });
  };

  const markMessagesAsRead = () => {
    if (!user || !socket.isConnected) return;

    // Find unread messages received by current user
    const unreadMessages = messages.filter(
      msg => msg.receiverId === user.id && msg.status !== 'READ'
    );

    // Mark as read via Socket.IO
    unreadMessages.forEach(msg => {
      socket.markMessageAsRead(msg.id, conversationId);
    });
  };

  if (isLoading || isLoadingConversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conversazione non trovata</h2>
          <Link href="/messages" className="text-blue-600 hover:text-blue-500">
            Torna ai messaggi
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = conversation.user1.id === user.id ? conversation.user2 : conversation.user1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/messages" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {otherUser.avatar ? (
                    <img 
                      src={otherUser.avatar} 
                      alt="Avatar" 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {otherUser.firstName} {otherUser.lastName}
                  </h1>
                  {conversation.property && (
                    <p className="text-sm text-gray-500">
                      {conversation.property.title} - {conversation.property.city}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Property Info Banner */}
      {conversation.property && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="font-medium text-blue-900">Proprietà:</span>
                  <span className="ml-2 text-blue-800">{conversation.property.title}</span>
                  <span className="ml-2 text-blue-600">€{conversation.property.monthlyRent}/mese</span>
                </div>
              </div>
              <Link
                href={`/properties/${conversation.property.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Visualizza Proprietà
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nessun messaggio ancora.</p>
              <p className="text-gray-400 text-sm mt-1">Inizia la conversazione!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === user.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 shadow border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {formatTimestamp(message.createdAt)}
                      </span>
                      {isOwnMessage && (
                        <div className="ml-2">
                          {getStatusIcon(message.status)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">sta scrivendo...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Scrivi un messaggio..."
                className="block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
