import { getIO } from './index';

export const emitToUser = (
  userId: string | number,
  event: string,
  payload: any
) => {
  const io = getIO();

  io.to(`user:${userId}`).emit(event, payload);
};

export const emitGlobal = (
  event: string,
  payload: any
) => {
  const io = getIO();

  io.emit(event, payload);
};