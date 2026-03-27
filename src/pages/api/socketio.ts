import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { verify } from 'jsonwebtoken';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket.IO server already running');
  } else {
    console.log('Initializing Socket.IO server...');
    
    const io = new ServerIO(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Authentication middleware
    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        console.log('Socket auth attempt with token:', token ? 'Token provided' : 'No token');
        
        if (!token) {
          console.log('Authentication failed: No token provided');
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload;
        console.log('Token decoded successfully for user:', decoded.id);
        
        socket.data.userId = decoded.id;
        socket.data.email = decoded.email;
        next();
      } catch (err) {
        console.error('Socket authentication error:', err);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      const userId = socket.data.userId;
      console.log(`User ${userId} connected to Socket.IO`);
      
      if (!userId) {
        console.error('User ID is undefined in socket connection');
        socket.disconnect();
        return;
      }

      // Join user to their personal room for notifications
      socket.join(`user:${userId}`);

      // Join conversation room
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${userId} left conversation ${conversationId}`);
      });

      // Handle sending messages
      socket.on('send_message', (data: {
        conversationId: string;
        content: string;
        receiverId: string;
      }) => {
        // Broadcast message to conversation room
        socket.to(`conversation:${data.conversationId}`).emit('new_message', {
          id: `${userId}-${data.conversationId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, // eventually replace with actual message ID from DB
          conversationId: data.conversationId,
          content: data.content,
          senderId: userId,
          receiverId: data.receiverId,
          status: 'SENT',
          createdAt: new Date().toISOString(),
        });

        // Send notification to receiver
        socket.to(`user:${data.receiverId}`).emit('message_notification', {
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
        });
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { conversationId: string; receiverId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
          userId,
          conversationId: data.conversationId,
        });
      });

      socket.on('typing_stop', (data: { conversationId: string; receiverId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_stop_typing', {
          userId,
          conversationId: data.conversationId,
        });
      });

      // Handle message delivery status (when receiver comes online or joins conversation)
      socket.on('message_delivered', (data: { messageId: string; conversationId: string; senderId: string }) => {
        // Notify the sender that their message was delivered
        socket.to(`user:${data.senderId}`).emit('message_status_update', {
          messageId: data.messageId,
          status: 'DELIVERED',
        });
        
        // Also emit to conversation room
        socket.to(`conversation:${data.conversationId}`).emit('message_status_update', {
          messageId: data.messageId,
          status: 'DELIVERED',
        });
      });

      // Handle message status updates
      socket.on('message_read', (data: { messageId: string; conversationId: string; senderId: string }) => {
        // Notify the sender that their message was read
        socket.to(`user:${data.senderId}`).emit('message_status_update', {
          messageId: data.messageId,
          status: 'READ',
        });
        
        // Also emit to conversation room
        socket.to(`conversation:${data.conversationId}`).emit('message_status_update', {
          messageId: data.messageId,
          status: 'READ',
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected from Socket.IO`);
      });
    });

    res.socket.server.io = io;
  }
  
  res.end();
};

export default SocketHandler;
