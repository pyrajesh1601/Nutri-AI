import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token){
      jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function(err, decoded) {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
    }
    else {
      next(new Error('Authentication error'));
    }    
  });

  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.decoded.id}`);
    
    // Join a personal room for private notifications
    socket.join(socket.decoded.id);

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${socket.decoded.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
