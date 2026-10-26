'use client'

import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

/**
 * Singleton socket.io connection to the game service.
 * NEVER use a port in the URL — the gateway routes via the XTransformPort query param.
 */
export function getGameSocket(): Socket {
  if (!socket) {
    socket = io('/?XTransformPort=3003', {
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
