/*
    Archivo: auth.ts
    Descripcion: middleware para verificar el token en el socket 
    Autor: Marilyn Castro
    Fecha creacion: 15/05/2026
    Version: 1.0.0
*/

import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  usuario: string;
  permisos: string[];
}

export function authMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    return next(new Error('AUTH_MISSING'));
  }

  try {
    const payload = jwt.verify(token, process.env.SECRET!) as TokenPayload;
    socket.data.userId = payload.usuario;
    socket.data.roles  = payload.permisos;
    next();
  } catch {
    next(new Error('AUTH_INVALID'));
  }
}