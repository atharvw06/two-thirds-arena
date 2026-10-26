'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { getGameSocket } from './socket'

/**
 * Live socket connection status via useSyncExternalStore — the canonical
 * React way to subscribe to external mutable state without effects.
 */
export function useSocketConnected(): boolean {
  const subscribe = useCallback((cb: () => void) => {
    const socket = getGameSocket()
    socket.on('connect', cb)
    socket.on('disconnect', cb)
    return () => {
      socket.off('connect', cb)
      socket.off('disconnect', cb)
    }
  }, [])

  return useSyncExternalStore(
    subscribe,
    () => getGameSocket().connected,
    () => true
  )
}
