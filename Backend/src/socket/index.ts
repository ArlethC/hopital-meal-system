/*
    Archivo: index.ts
    Descripcion: archivo principal del socket
    Autor: Marilyn Castro
    Fecha creacion: 15/05/2026
    Version: 1.0.0
*/

import { Server } from 'socket.io';
import http from 'http';
import { authMiddleware } from './auth';
import { registerHandlers } from './handlers/register.handler';

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
    maxHttpBufferSize: 64 * 1024,
  });

  io.use(authMiddleware);

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    registerHandlers(io, socket);
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO no inicializado');
  }

  return io;
};