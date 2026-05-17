import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    const userId = socket.handshake.auth.userId;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO no inicializado');
  }

  return io;
};