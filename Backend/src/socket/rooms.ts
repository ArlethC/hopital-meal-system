/*
    Archivo: rooms.ts
    Descripcion: funciones para gestionar las rooms del socket
    Autor: Marilyn Castro
    Fecha creacion: 20/05/2026
    Version: 1.0.0
*/

export async function canJoinRoom(
  userId: string,
  roomId: string,
  roles: string[]
): Promise<boolean> {
  if (roomId.startsWith('dietas:') && !roles.includes('cocina')) {
    return false;
  }

  if (roomId.startsWith('meriendas:') && !roles.includes('cocina')) {
    return false;
  }

  return true;
}