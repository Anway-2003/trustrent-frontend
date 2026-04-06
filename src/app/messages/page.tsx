'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, User as UserIcon, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: User;
  receiver: User;
}

// Next.js 15 madhe useSearchParams vaprtana Suspense lagto, mhanun ha chota component banavla
function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, isLoggedIn, isLoading: authLoading } = useAuth();
  
  // URL madhun '?user=123' ghene
  const targetUserId = searchParams?.get('user');

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Scroll bar nehemi khali thevnyasathi
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Check Auth
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  // 2. Fetch Chat History & Target User Name
  useEffect(() => {
    if (currentUser?.id && targetUserId) {
      fetchTargetUserDetails();
      fetchChatHistory();
      
      // Dar 5 second la navin messages check karne (Simple Polling - WhatsApp sarka)
      const interval = setInterval(fetchChatHistory, 5000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [currentUser, targetUserId]);

  // Scroll to bottom jevha navin message yeil
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Demo sathi aapan saglya users madhun target user shodhtoy
  const fetchTargetUserDetails = async () => {
    try {
      const response = await fetch('https://trustrent-backend.onrender.com/api/users');
      if (response.ok) {
        const allUsers: User[] = await response.json();
        const foundUser = allUsers.find(u => u.id === targetUserId);
        if (foundUser) setTargetUser(foundUser);
      }
    } catch (err) {
      console.error("Could not fetch user details", err);
    }
  };

  const fetchChatHistory = async () => {
    if (!currentUser?.id || !targetUserId) return;
    try {
      const response = await fetch(`https://trustrent-backend.onrender.com/api/messages/history/${currentUser.id}/${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?.id || !targetUserId) return;

    const messageText = newMessage;
    setNewMessage(''); // Input lagech rikam karne fast feeling sathi

    try {
      const response = await fetch('https://trustrent-backend.onrender.com/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: targetUserId,
          content: messageText
        })
      });

      if (response.ok) {
        fetchChatHistory(); // Message gelyavar parat history magavne
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Is backend running?');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!targetUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Messages</h2>
        <p className="text-gray-500 max-w-md">
          Go to a property and click "Contact Owner" to start a conversation with a landlord.
        </p>
        <button onClick={() => router.push('/properties')} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Browse Properties
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[75vh] mt-6 border border-gray-200">
      {/* Chat Header */}
      <div className="bg-blue-600 p-4 flex items-center text-white">
        <button onClick={() => router.back()} className="mr-4 hover:bg-blue-700 p-2 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
          <UserIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-lg">
            {targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : 'Property Owner'}
          </h2>
          <p className="text-blue-100 text-xs">Typically replies within a few hours</p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Say hi to start the conversation! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender.id === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}>
                  <p className="text-sm md:text-base break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

// Main Page Component
export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
          <ChatContent />
        </Suspense>
      </main>
    </div>
  );
}