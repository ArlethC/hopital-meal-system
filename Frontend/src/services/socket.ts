/*
    Archivo: socket.tsx
    Descripcion: creación del socket.
    Autor: Marilyn Castro
    Fecha creacion: 22/05/2026
    Version: 1.0.0
*/
import { io, Socket } from 'socket.io-client'
import type {ServerToClientEvents, ClientToServerEvents } from '@miapp/shared';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  return socket
}

export function initSocket(token: string): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket?.connected) return socket

  socket = io({
    path: '/socket.io',
    auth: { token },       
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}