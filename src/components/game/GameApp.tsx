'use client'

import { useCallback, useEffect, useState } from 'react'
import { getGameSocket } from '@/components/game/socket'
import { Landing } from '@/components/game/Landing'
import { PlayerView } from '@/components/game/PlayerView'
import { HostView } from '@/components/game/HostView'

type Mode = 'landing' | 'player' | 'host'

/**
 * Client-only app shell (loaded with ssr:false so window is always available).
 * Reads URL params once to decide the starting mode:
 *   ?host=1      → projector host console
 *   ?room=CODE   → player join flow with the code prefilled
 */
export function GameApp() {
  const [init] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const room = (params.get('room') ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    let hostStored = false
    try {
      hostStored = localStorage.getItem('gt3.hostMode') === '1'
    } catch {
      /* storage unavailable */
    }
    // Priority: explicit URL params, then remembered host mode (refresh-proof projector)
    const mode: Mode =
      params.get('host') === '1' ? 'host' : room ? 'player' : hostStored ? 'host' : 'landing'
    return { mode, room }
  })
  const [mode, setMode] = useState<Mode>(init.mode)

  // Warm the socket connection early so joining feels instant.
  useEffect(() => {
    getGameSocket()
  }, [])

  const startHost = useCallback(() => {
    try {
      localStorage.setItem('gt3.hostMode', '1')
      localStorage.removeItem('gt3.playerId')
    } catch {
      /* storage unavailable */
    }
    setMode('host')
  }, [])

  const startPlayer = useCallback(() => {
    try {
      localStorage.removeItem('gt3.hostMode')
    } catch {
      /* storage unavailable */
    }
    setMode('player')
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {mode === 'landing' && <Landing onJoin={startPlayer} onHost={startHost} />}
      {mode === 'player' && <PlayerView initialRoom={init.room} onExit={() => setMode('landing')} />}
      {mode === 'host' && <HostView onExit={() => setMode('landing')} />}
    </div>
  )
}
