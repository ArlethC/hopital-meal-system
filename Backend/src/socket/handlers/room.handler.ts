/*
    Archivo: room.handler.ts
    Descripcion: handler para manejar las conexiones a las rooms
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
import { canJoinRoom } from '../rooms';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export function registerRoomHandlers(io: TypedServer, socket: TypedSocket) {

  socket.on("join-room", async (roomId, ack) => {
    const allowed = await canJoinRoom(
      socket.data.userId,
      roomId,
      socket.data.roles
    );

    if (!allowed) {
      return ack({ ok: false, code: "FORBIDDEN" });
    }

    await socket.join(roomId);

    ack({ ok: true });

    socket.to(roomId).emit("room:joined", { roomId });
  });

  socket.on("leave-room", async (roomId) => {
    await socket.leave(roomId);

    socket.to(roomId).emit("room:left", { roomId });
  });
}