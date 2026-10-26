'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, FastForward, Loader2, MonitorPlay, RotateCcw, Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getGameSocket } from './socket'
import { useSocketConnected } from './use-connected'
import { PHASES, PHASE_LABELS, type HostState, type Phase } from './types'
import { HostLobby } from './host-screens/Lobby'
import { HostHowto } from './host-screens/Howto'
import { HostRoundOpen } from './host-screens/RoundOpen'
import { HostRoundReveal } from './host-screens/RoundReveal'
import { HostDebrief } from './host-screens/Debrief'
import { HostLeaderboard } from './host-screens/Leaderboard'
import { HostFinaleIntro, HostFinaleVote, HostFinaleReveal, HostFinaleDebrief } from './host-screens/Finale'
import { HostWrap } from './host-screens/Wrap'

const TIMED_MS: Partial<Record<Phase, number>> = {
  r1_open: 45000,
  r2_open: 45000,
  r3_open: 45000,
  finale_vote: 40000,
}

export function HostView({ onExit }: { onExit: () => void }) {
  const socketRef = useRef(getGameSocket())
  const connected = useSocketConnected()
  const [state, setState] = useState<HostState | null>(null)

  useEffect(() => {
    const socket = socketRef.current
    let stored = ''
    try {
      stored = localStorage.getItem('gt3.hostRoom') ?? ''
    } catch {}
    socket.emit('host:hello', stored ? { code: stored } : {})

    const onState = (s: HostState) => {
      setState(s)
      try {
        localStorage.setItem('gt3.hostRoom', s.code)
      } catch {}
    }
    socket.on('host:state', onState)
    return () => {
      socket.off('host:state', onState)
    }
  }, [])

  const act = useCallback((action: string, value?: string) => {
    socketRef.current.emit('host:action', { action, value })
  }, [])

  // Presenter-friendly keyboard: arrows / PgUp / PgDn (works with clickers)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        act('next')
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        act('back')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [act])

  if (!state) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-100">
        <Loader2 className="h-10 w-10 animate-spin text-amber-400" aria-hidden="true" />
        <p className="text-sm font-bold text-zinc-400">
          {connected ? 'Setting up the arena…' : 'Connecting to game service…'}
        </p>
      </div>
    )
  }

  const phase = state.phase
  const idx = state.phaseIndex
  const isTimed = TIMED_MS[phase] !== undefined

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* top status bar */}
      <header className="flex items-center justify-between border-b border-zinc-900 px-5 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
            Two-Thirds Arena
          </span>
          <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-[10px] font-black tracking-[0.2em] text-amber-300">
            {state.code}
          </span>
          {!connected && (
            <span className="animate-pulse text-[10px] font-bold uppercase tracking-widest text-rose-400">
              reconnecting…
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400">
            <Users className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            {state.playerCount} players
          </span>
          <button
            onClick={onExit}
            className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-300"
          >
            exit host
          </button>
        </div>
      </header>

      {/* stage */}
      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <PhaseScreen state={state} act={act} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* control bar */}
      <footer className="flex items-center justify-between gap-3 border-t border-zinc-900 bg-zinc-900/60 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => act('back')}
            disabled={idx === 0}
            aria-label="Previous screen"
            className="h-11 w-11 border-zinc-700 bg-zinc-900"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Reset options"
                className="h-11 w-11 border-zinc-700 bg-zinc-900 text-zinc-400"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-zinc-800 bg-zinc-900">
              <DropdownMenuItem onClick={() => act('restart')} className="font-semibold text-zinc-200">
                Encore — same players, scores reset
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => act('reset')} className="font-semibold text-rose-300">
                Full wipe — new class must rejoin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">
            {PHASE_LABELS[phase]}
          </span>
          <div className="flex items-center gap-1" aria-hidden="true">
            {PHASES.map((p, i) => (
              <span
                key={p}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-amber-400' : i < idx ? 'w-1.5 bg-zinc-600' : 'w-1.5 bg-zinc-800'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTimed ? (
            <Button
              onClick={() => act('skip-timer')}
              className="h-11 gap-2 bg-rose-600 px-5 font-black text-zinc-50 hover:bg-rose-500"
            >
              <FastForward className="h-4 w-4" aria-hidden="true" />
              SKIP TIMER
            </Button>
          ) : null}
          <Button
            onClick={() => act('next')}
            disabled={idx === PHASES.length - 1}
            className="h-11 gap-1 bg-amber-400 px-6 font-black text-zinc-950 hover:bg-amber-300"
          >
            {phase === 'lobby' ? (
              <>
                <MonitorPlay className="h-4 w-4" aria-hidden="true" /> START THE SHOW
              </>
            ) : (
              <>
                NEXT <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  )
}

function PhaseScreen({ state, act }: { state: HostState; act: (a: string, v?: string) => void }) {
  switch (state.phase) {
    case 'lobby':
      return <HostLobby state={state} act={act} />
    case 'howto':
      return <HostHowto state={state} />
    case 'r1_open':
    case 'r2_open':
    case 'r3_open':
      return <HostRoundOpen state={state} />
    case 'r1_reveal':
    case 'r2_reveal':
    case 'r3_reveal':
      return <HostRoundReveal state={state} />
    case 'r1_debrief':
    case 'r2_debrief':
    case 'r3_debrief':
      return <HostDebrief state={state} />
    case 'leaderboard':
      return <HostLeaderboard state={state} />
    case 'finale_intro':
      return <HostFinaleIntro state={state} />
    case 'finale_vote':
      return <HostFinaleVote state={state} />
    case 'finale_reveal':
      return <HostFinaleReveal state={state} />
    case 'finale_debrief':
      return <HostFinaleDebrief state={state} />
    case 'wrap':
      return <HostWrap state={state} />
    default:
      return <HostLobby state={state} />
  }
}
