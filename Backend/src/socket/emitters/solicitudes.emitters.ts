/*
    Archivo: solicitudes.emitters.ts
    Descripcion: enviar mensajes para actualizar la pantalla de resumen de solicitudes en el cliente
    Autor: Marilyn Castro
    Fecha creacion: 20/05/2026
    Version: 1.0.0
*/

import { getIO } from '../index';

const SOLICITUD_PANTALLA = 'dietas-screen';

export async function actualizarPantallaSolicitudes() {
  const io = getIO();

  io.to(SOLICITUD_PANTALLA)
    .emit('room:message');
}