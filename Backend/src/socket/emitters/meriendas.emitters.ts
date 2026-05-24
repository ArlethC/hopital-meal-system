/*
    Archivo: meriendas.emitters.ts
    Descripcion: enviar mensajes para actualizar la pantalla de resumen de meriendas en el cliente
    Autor: Marilyn Castro
    Fecha creacion: 20/05/2026
    Version: 1.0.0
*/

import { getIO } from '../index';

const MERIENDAS_PANTALLA = 'meriendas-screen';

export async function actualizarPantallaMeriendas() {
  const io = getIO();

  io.to(MERIENDAS_PANTALLA)
    .emit('room:message');
}