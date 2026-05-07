/*
    Archivo: notoficacionService.tsx
    Descripcion: Componente para enviar notificaciones cuando la sesion del usuario termina.
    Autor: Marilyn Castro
    Fecha creacion: 31/07/2025
    Version: 1.0.0
*/
import type { Message } from '../hooks/notificacionHook';

let externalNotify: ((message: Omit<Message, 'id'>) => void) | null = null;

export const setNotify = (notifyFn: (message: Omit<Message, 'id'>) => void) => {
  externalNotify = notifyFn;
};

export const notifyExternally = (message: Omit<Message, 'id'>) => {
  if (externalNotify) {
    externalNotify(message);
  } else {
    console.warn("⚠️ notifyExternally fue llamado antes de que NotificationProvider estuviera inicializado");
  }
};
