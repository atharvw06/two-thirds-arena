'use client'

import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

/**
 * Singleton socket.io connection to the unified game server.
 * Connects directly to the current origin on standard /socket.io path.
 */
export function getGameSocket(): Socket {
  if (!socket) {
    socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    })
  }
  return socket
}

export function peekGameSocket(): Socket | null {
  return socket
}
