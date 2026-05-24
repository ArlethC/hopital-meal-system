/*
    Archivo: register.handler.ts
    Descripcion: handlers principal 
    Autor: Marilyn Castro
    Fecha creacion: 19/05/2026
    Version: 1.0.0
*/

import { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from '@miapp/shared';
import { registerRoomHandlers } from './room.handler';
import { registerMessageHandlers } from './message.handler';


type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;


export function registerHandlers(io: TypedServer, socket: TypedSocket) {
  const userId = socket.data.userId;
  
  registerRoomHandlers(io, socket);
  registerMessageHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`Desconectado: ${userId} — ${reason}`);
  });
}