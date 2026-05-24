// src/hooks/useSocketRoom.ts
import { useEffect } from 'react'
import { getSocket } from '../services/socket'
import type { AckResponse } from '@miapp/shared'

export function useSocketRoom(roomId: string) {
  useEffect(() => {
    const socket = getSocket()

    if (!socket) return;
    if (!roomId) return

    socket.emit('join-room', roomId, (res: AckResponse) => {
      if (!res.ok) {
        console.error('Error al unirse a la room:', res.code)
      }
    })

    return () => {
      socket.emit('leave-room', roomId)
    }
  }, [roomId])
}