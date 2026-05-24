// src/hooks/useSocket.ts
import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { getSocket } from '../services/socket'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@miapp/shared'

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<AppSocket | null>(null)

  useEffect(() => {
    const socket = getSocket() as AppSocket

    if (!socket) return
    socketRef.current = socket

    setIsConnected(socket.connected)

    function onConnect()    { setIsConnected(true)  }
    function onDisconnect() { setIsConnected(false) }
    function onConnectError(err: Error) {
      console.error('Socket error:', err.message)
    }

    socket.on('connect',       onConnect)
    socket.on('disconnect',    onDisconnect)
    socket.on('connect_error', onConnectError)

    return () => {
      socket.off('connect',       onConnect)
      socket.off('disconnect',    onDisconnect)
      socket.off('connect_error', onConnectError)
    }
  }, [])

  return { socket: socketRef.current, isConnected }
}