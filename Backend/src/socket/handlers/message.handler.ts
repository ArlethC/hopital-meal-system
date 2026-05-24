/*
    Archivo: message.handler.ts
    Descripcion: handler para enviar mensajes en el socket 
    Autor: Marilyn Castro
    Fecha creacion: 19/05/2026
    Version: 1.0.0
*/

import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from '@miapp/shared';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

const SendMessageSchema = z.object({
  roomId:  z.string().min(1).max(100),
  content: z.string().min(1).max(2000),
});

export function registerMessageHandlers(io: TypedServer, socket: TypedSocket) {

  socket.on("send-message", async (payload, ack) => {

    const parsed = SendMessageSchema.safeParse(payload);

    if (!parsed.success) {
      return ack({ ok: false, code: "INVALID_PAYLOAD" });
    }

    const { roomId, content } = parsed.data;

    if (!socket.rooms.has(roomId)) {
      return ack({ ok: false, code: "NOT_IN_ROOM" });
    }

    const message = {
      id: crypto.randomUUID(),
      roomId,
      senderId: socket.data.userId,
      content,
      createdAt: new Date().toISOString(),
    };

    io.to(roomId).emit("room:message", message);

    ack({ ok: true });
  });
}