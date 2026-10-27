'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, Check, Crown, Eye, Loader2, Lock, Pencil, SplitSquareHorizontal,
  Swords, Timer, TrendingUp, Trophy, Users, Wifi, WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { getGameSocket } from './socket'
import { useSocketConnected } from './use-connected'
import { FINALE_SECONDS, ROUND_SECONDS, fmtNum, type PlayerState } from './types'

const LS = {
  id: 'gt3.playerId',
  code: 'gt3.roomCode',
  name: 'gt3.playerName',
}

const fade = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -14 } }

export function PlayerView({ initialRoom, onExit }: { initialRoom: string; onExit: () => void }) {
  const socketRef = useRef(getGameSocket())
  const connected = useSocketConnected()
  const [state, setState] = useState<PlayerState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // ---- join form state (prefilled from storage at mount; client-only app) ----
  const [init] = useState(() => {
    try {
      return {
        name: localStorage.getItem(LS.name) ?? '',
        code: localStorage.getItem(LS.code) ?? '',
        id: localStorage.getItem(LS.id) ?? '',
      }
    } catch {
      return { name: '', code: '', id: '' }
    }
  })
  const [name, setName] = useState(init.name)
  const [room, setRoom] = useState(initialRoom || init.code)

  useEffect(() => {
    const socket = socketRef.current
    if (init.id && (initialRoom || init.code)) {
      socket.emit('player:hello', { code: (initialRoom || init.code).toUpperCase(), playerId: init.id })
    }

    const onState = (s: PlayerState) => {
      setState(s)
      setError(null)
      setBusy(false)
      try {
        localStorage.setItem(LS.id, s.you.id)
        localStorage.setItem(LS.code, s.code)
        localStorage.setItem(LS.name, s.you.name)
      } catch {}
    }
    const onJoinError = (e: { message?: string }) => {
      setBusy(false)
      setError(e?.message ?? 'Could not join.')
      try {
        localStorage.removeItem(LS.id)
      } catch {}
    }
    const onReset = () => {
      setState(null)
      setError('The host started a fresh session — rejoin with the new room code.')
      try {
        localStorage.removeItem(LS.id)
      } catch {}
    }

    socket.on('player:state', onState)
    socket.on('join:error', onJoinError)
    socket.on('room:reset', onReset)

    return () => {
      socket.off('player:state', onState)
      socket.off('join:error', onJoinError)
      socket.off('room:reset', onReset)
    }
  }, [initialRoom, init])

  const handleJoin = useCallback(() => {
    if (!name.trim() || room.trim().length !== 4 || busy) return
    setBusy(true)
    socketRef.current.emit('player:hello', { code: room.toUpperCase(), name: name.trim() })
  }, [name, room, busy])

  const exit = useCallback(() => {
    try {
      localStorage.removeItem(LS.id)
    } catch {}
    onExit()
  }, [onExit])

  // ---------------- Join screen ----------------
  if (!state) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <motion.div {...fade} className="space-y-6">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">Two-Thirds Arena</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Join the class game</h1>
          </div>

          <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="space-y-2">
              <label htmlFor="nick" className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Nickname
              </label>
              <Input
                id="nick"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 14))}
                placeholder="e.g. Ananya"
                autoComplete="off"
                className="h-12 border-zinc-700 bg-zinc-950 text-base font-bold"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="room" className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Room code (on the big screen)
              </label>
              <Input
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
                placeholder="ABCD"
                className="h-12 border-zinc-700 bg-zinc-950 text-center text-2xl font-black tracking-[0.4em]"
                autoComplete="off"
                inputMode="text"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300" role="alert">
                {error}
              </p>
            )}

            <Button
              onClick={handleJoin}
              disabled={!connected || !name.trim() || room.length !== 4 || busy}
              className="h-14 w-full bg-amber-400 text-lg font-black text-zinc-950 hover:bg-amber-300"
            >
              {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> : null}
              {connected ? 'ENTER THE ARENA' : 'CONNECTING…'}
            </Button>
            <button onClick={exit} className="flex w-full items-center justify-center gap-1 pt-1 text-xs font-semibold text-zinc-500 hover:text-zinc-300">
              <ArrowLeft className="h-3 w-3" aria-hidden="true" /> back
            </button>
          </div>

          <p className="text-center text-xs leading-relaxed text-zinc-600">
            Keep this tab open — you&apos;ll play every round from here. If your WiFi blips, just reload: you&apos;ll rejoin automatically.
          </p>
        </motion.div>
      </main>
    )
  }

  // ---------------- In-game ----------------
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-4">
      {/* header */}
      <header className="flex items-center justify-between gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="rounded-md bg-amber-400/15 px-2 py-1 text-[10px] font-black tracking-[0.2em] text-amber-300">
            {state.code}
          </span>
          <span className="truncate text-sm font-bold text-zinc-200">{state.you.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-black tabular-nums text-zinc-100">
            <TrendingUp className="h-3 w-3 text-amber-400" aria-hidden="true" />
            {state.you.totalScore}
          </span>
          {connected ? (
            <Wifi className="h-3.5 w-3.5 text-emerald-400" aria-label="Connected" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 animate-pulse text-rose-400" aria-label="Reconnecting" />
          )}
        </div>
      </header>

      {!connected && (
        <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-center text-xs font-bold text-rose-300" role="alert">
          Connection lost — reconnecting…
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={state.phase} {...fade} transition={{ duration: 0.25 }} className="mt-5 flex flex-1 flex-col">
          <PhaseScreen state={state} socketRef={socketRef} />
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

// ================= Phase screens =================

function PhaseScreen({ state, socketRef }: { state: PlayerState; socketRef: React.RefObject<ReturnType<typeof getGameSocket>> }) {
  switch (state.phase) {
    case 'lobby':
      return <WaitingRoom state={state} />
    case 'howto':
      return <HowTo state={state} />
    case 'r1_open':
    case 'r2_open':
      return <GuessPanel key={state.round} state={state} socketRef={socketRef} />
    case 'r1_reveal':
    case 'r2_reveal':
    case 'r1_debrief':
    case 'r2_debrief':
      return <RoundResultCard state={state} />
    case 'leaderboard':
    case 'finale_intro':
      return <LeaderboardCard state={state} />
    case 'finale_vote':
      return <FinaleVote state={state} socketRef={socketRef} />
    case 'finale_reveal':
    case 'finale_debrief':
      return <FinaleResultCard state={state} />
    case 'wrap':
      return <WrapCard state={state} />
    default:
      return <WaitingRoom state={state} />
  }
}

function WaitingRoom({ state }: { state: PlayerState }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-400/30 bg-emerald-400/10"
      >
        <Check className="h-12 w-12 text-emerald-400" strokeWidth={3} aria-hidden="true" />
      </motion.div>
      <div>
        <h2 className="text-2xl font-black">You&apos;re in, {state.you.name}!</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Watch the big screen. The show starts when your host kicks things off.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm font-bold text-zinc-300">
        <Users className="h-4 w-4 text-amber-400" aria-hidden="true" />
        {state.playerCount} player{state.playerCount === 1 ? '' : 's'} in the room
      </div>
    </div>
  )
}

function HowTo({ state }: { state: PlayerState }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <h2 className="text-center text-2xl font-black">How to play</h2>
      {[
        'Pick any number from 0 to 100 — decimals allowed.',
        `We average the whole class. The target is two-thirds of that average.`,
        'Closest to the target wins the round and stacks points.',
        `3 rounds. Top two on the leaderboard duel for ${state.prize} — Split or Steal.`,
      ].map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.12 }}
          className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-zinc-950">
            {i + 1}
          </span>
          <p className="text-sm font-semibold leading-relaxed text-zinc-300">{t}</p>
        </motion.div>
      ))}
      <p className="mt-2 text-center text-xs text-zinc-500">Tip: there is no &quot;right&quot; answer — only what beats the crowd.</p>
    </div>
  )
}

function GuessPanel({
  state,
  socketRef,
}: {
  state: PlayerState
  socketRef: React.RefObject<ReturnType<typeof getGameSocket>>
}) {
  const initialGuess = state.you.yourGuess ?? 50
  const [draft, setDraft] = useState<number>(initialGuess)
  const [typed, setTyped] = useState<string>(String(initialGuess))
  const [locked, setLocked] = useState(state.you.yourGuess !== null)
  const round = state.round

  const lockIn = useCallback(() => {
    const v = Math.min(100, Math.max(0, Number(typed)))
    if (!Number.isFinite(v)) return
    setDraft(v)
    socketRef.current.emit('player:guess', { guess: v })
    setLocked(true)
  }, [typed, socketRef])

  const setBoth = (v: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(v * 100) / 100))
    setDraft(clamped)
    setTyped(String(clamped))
  }

  const submitted = state.you.yourGuess !== null

  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      {state.endsAt && <TimerBar endsAt={state.endsAt} totalMs={(ROUND_SECONDS[round] ?? 60) * 1000} />}

      <div className="text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400">Round {round} of 2</p>
        <h2 className="mt-1 text-2xl font-black leading-tight">
          Pick a number
          <span className="block text-base font-bold text-zinc-400">0 – 100</span>
        </h2>
      </div>

      {/* big number */}
      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-b from-amber-400/10 to-transparent p-5 text-center">
        <p className="text-6xl font-black tabular-nums text-amber-300">{typed === '' ? '—' : typed}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">your guess</p>
      </div>

      {/* Quick preset buttons */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {[0, 15, 22, 33, 50, 67, 100].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              if (!locked || !submitted) setBoth(preset)
            }}
            disabled={locked && submitted}
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-bold text-zinc-300 transition-colors hover:border-amber-400 hover:text-amber-300 active:scale-95 disabled:opacity-40"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <Slider
          value={[draft]}
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => setBoth(v[0])}
          disabled={locked && submitted}
          aria-label="Your guess from 0 to 100"
          className="py-2"
        />

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              value={typed}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '' || /^(\d{0,3}(\.\d{0,2})?)$/.test(raw)) setTyped(raw)
              }}
              onBlur={() => {
                const v = Number(typed)
                setBoth(Number.isFinite(v) ? v : 50)
              }}
              disabled={locked && submitted}
              inputMode="decimal"
              aria-label="Type your guess"
              className="h-14 border-zinc-700 bg-zinc-950 text-center text-2xl font-black tabular-nums text-amber-300"
            />
          </div>

          {locked && submitted ? (
            <Button
              variant="outline"
              onClick={() => setLocked(false)}
              className="h-14 gap-2 border-zinc-700 bg-zinc-900 px-5 text-base font-bold text-zinc-200"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" /> Change
            </Button>
          ) : (
            <Button
              onClick={lockIn}
              disabled={typed === '' || !Number.isFinite(Number(typed))}
              className="h-14 gap-2 bg-amber-400 px-6 text-base font-black text-zinc-950 hover:bg-amber-300 active:scale-95"
            >
              <Lock className="h-4 w-4" aria-hidden="true" /> Lock in
            </Button>
          )}
        </div>
      </div>

      {submitted && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center">
          <p className="text-sm font-bold text-emerald-300">
            Locked: {fmtNum(state.you.yourGuess ?? 0)} · {state.submittedCount}/{state.eligibleCount} in
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-400/70">You can still change it until the host reveals results.</p>
        </div>
      )}
    </div>
  )
}

function TimerBar({ endsAt, totalMs = 30000 }: { endsAt: number; totalMs?: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [])
  const remaining = Math.max(0, endsAt - now)
  const seconds = Math.ceil(remaining / 1000)
  // Urgency scales with the window (last third of the clock, clamped 4–10s)
  const urgent = remaining <= Math.max(4000, Math.min(10000, totalMs / 3))
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5" role="timer">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400">
        <Timer className="h-3.5 w-3.5" aria-hidden="true" /> time left
      </span>
      <span className={`text-lg font-black tabular-nums ${urgent ? 'text-rose-400' : 'text-zinc-100'}`}>{seconds}s</span>
    </div>
  )
}

function RoundResultCard({ state }: { state: PlayerState }) {
  const r = state.result
  const phase = state.phase
  if (!r || r.yourGuess === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <Eye className="h-12 w-12 text-zinc-600" aria-hidden="true" />
        <h2 className="text-xl font-black">Round {state.round} results</h2>
        <p className="max-w-xs text-sm text-zinc-400">You didn&apos;t submit this round — check the big screen for the class results.</p>
      </div>
    )
  }
  const debriefText: Record<string, string> = {
    r1_debrief: 'Most crowds think 1–2 levels deep. Perfectly rational would be 0 — real humans stop somewhere in between.',
    r2_debrief: 'Any number above 66.67 can never win. Cut it, and the ceiling drops to 44.4, then 29.6… the spiral goes to 0.',
    r3_debrief: 'The Nash equilibrium is everyone guessing 0. But did the winner actually pick 0? That gap is bounded rationality.',
  }
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <div className="text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400">Round {state.round} results</p>
        {r.youWon ? (
          <motion.h2 initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="mt-1 text-3xl font-black text-emerald-400">
            YOU WON THE ROUND
          </motion.h2>
        ) : (
          <h2 className="mt-1 text-2xl font-black">The target was {fmtNum(r.target)}</h2>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">you</p>
          <p className="mt-1 text-2xl font-black tabular-nums">{fmtNum(r.yourGuess)}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/25 bg-amber-400/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">target</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-amber-300">{fmtNum(r.target)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">off by</p>
          <p className="mt-1 text-2xl font-black tabular-nums">{fmtNum(r.yourDiff ?? 0)}</p>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-center"
      >
        <p className="text-3xl font-black text-emerald-300">+{r.yourPoints} pts</p>
        <p className="mt-1 text-xs font-semibold text-emerald-400/80">total: {state.you.totalScore}</p>
      </motion.div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">closest of {r.n}</p>
        <p className="mt-1 text-sm font-bold text-zinc-200">
          {r.winners.map((w) => w.name).join(' & ')} ({r.winners.map((w) => fmtNum(w.guess)).join(', ')})
        </p>
        <p className="mt-1 text-xs text-zinc-500">class average was {fmtNum(r.mean)}</p>
      </div>

      {debriefText[phase] && (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm font-semibold leading-relaxed text-zinc-400">
          {debriefText[phase]}
        </p>
      )}
    </div>
  )
}

function LeaderboardCard({ state }: { state: PlayerState }) {
  const isFinaleIntro = state.phase === 'finale_intro'
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <div className="text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400">Leaderboard</p>
        <h2 className="mt-1 text-2xl font-black">
          {isFinaleIntro ? 'Finalists decided' : `You're rank #${state.leaderboard.myRank ?? '—'}`}
        </h2>
      </div>
      <ol className="space-y-2">
        {state.leaderboard.top.map((row) => {
          const isYou = row.name === state.you.name
          const isFinalist = isFinaleIntro && row.rank <= 2
          return (
            <li
              key={`${row.rank}-${row.name}`}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                isFinalist
                  ? 'border-amber-500/40 bg-amber-400/10'
                  : isYou
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              <span className="flex items-center gap-2.5 text-sm font-bold text-zinc-200">
                <span className="w-5 text-center font-black text-zinc-500">{row.rank}</span>
                {row.name}
                {isFinalist && <Crown className="h-4 w-4 text-amber-400" aria-hidden="true" />}
              </span>
              <span className="text-sm font-black tabular-nums text-zinc-100">{row.score}</span>
            </li>
          )
        })}
      </ol>
      {isFinaleIntro && (
        <p className="text-center text-sm leading-relaxed text-zinc-400">
          {state.you.isFinalist
            ? 'You are a finalist! Get ready — your Split or Steal decision is next.'
            : `${state.finale.finalists.map((f) => f.name).join(' vs ')} — the top two battle for ${state.prize}.`}
        </p>
      )}
    </div>
  )
}

function FinaleVote({
  state,
  socketRef,
}: {
  state: PlayerState
  socketRef: React.RefObject<ReturnType<typeof getGameSocket>>
}) {
  const choose = (choice: 'split' | 'steal') => {
    socketRef.current.emit('player:finale:choice', { choice })
  }
  const chosen = state.you.yourChoice

  if (!state.you.isFinalist) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <Swords className="h-14 w-14 text-rose-400" aria-hidden="true" />
        <h2 className="text-2xl font-black">Split or Steal</h2>
        <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
          {state.finale.finalists.map((f) => f.name).join(' & ')} are deciding right now. Watch the big screen…
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-bold text-zinc-400">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" /> audience view
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      {state.endsAt && <TimerBar endsAt={state.endsAt} totalMs={FINALE_SECONDS * 1000} />}
      <div className="text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-400">The Finale</p>
        <h2 className="mt-1 text-2xl font-black leading-tight">
          {state.prize}
          <span className="block text-base font-bold text-zinc-400">Split it… or steal it all</span>
        </h2>
      </div>

      {chosen ? (
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3 text-center">
          <div
            className={`rounded-3xl border p-8 ${
              chosen === 'split' ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'
            }`}
          >
            <p className="text-3xl font-black uppercase tracking-widest">
              {chosen === 'split' ? 'SPLIT' : 'STEAL'}
            </p>
            <p className={`mt-2 text-sm font-bold ${chosen === 'split' ? 'text-emerald-300' : 'text-rose-300'}`}>
              choice locked
            </p>
          </div>
          <p className="text-xs leading-relaxed text-zinc-500">
            No take-backs. When both finalists have decided, the reveal hits the big screen.
          </p>
        </motion.div>
      ) : (
        <>
          <p className="text-center text-sm leading-relaxed text-zinc-400">
            Both pick in secret. <span className="font-bold text-zinc-200">Both split</span> → share the prize.{' '}
            <span className="font-bold text-zinc-200">One steals</span> → stealer takes everything.{' '}
            <span className="font-bold text-zinc-200">Both steal</span> → nobody gets anything.
          </p>
          <div className="grid gap-3">
            <Button
              onClick={() => choose('split')}
              className="h-20 bg-emerald-500 text-xl font-black text-zinc-950 hover:bg-emerald-400"
            >
              <SplitSquareHorizontal className="mr-2 h-7 w-7" aria-hidden="true" />
              SPLIT
            </Button>
            <Button
              onClick={() => choose('steal')}
              className="h-20 bg-rose-600 text-xl font-black text-zinc-50 hover:bg-rose-500"
            >
              <Swords className="mr-2 h-7 w-7" aria-hidden="true" />
              STEAL
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function FinaleResultCard({ state }: { state: PlayerState }) {
  const f = state.finale
  const outcomeText: Record<string, { title: string; desc: string; tone: string }> = {
    'both-split': {
      title: 'BOTH SPLIT',
      desc: `The prize is shared — honesty pays (this time).`,
      tone: 'text-emerald-300',
    },
    'one-steals': {
      title: 'STOLEN!',
      desc: `${f.finalists.find((x) => x.id === f.stealerId)?.name ?? 'One finalist'} takes the entire prize.`,
      tone: 'text-rose-400',
    },
    'both-steal': {
      title: 'PRIZE DESTROYED',
      desc: 'Both stole. Mutual destruction — the house keeps the prize.',
      tone: 'text-rose-400',
    },
  }
  const o = f.outcome ? outcomeText[f.outcome] : null
  const me = state.you.name
  const iAmStealer = f.stealerId !== null && state.you.isFinalist && f.outcome === 'one-steals'
  const iWasRobbed = state.you.isFinalist && f.outcome === 'one-steals' && f.stealerId !== null && !iAmStealer

  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400">Finale result</p>
        {o ? <h2 className={`mt-1 text-3xl font-black ${o.tone}`}>{o.title}</h2> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {f.finalists.map((fin) => {
          const choice = f.choices[fin.id]
          const isStealer = f.stealerId === fin.id
          return (
            <div
              key={fin.id}
              className={`rounded-2xl border p-4 text-center ${
                choice === 'split'
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : isStealer
                    ? 'border-rose-500/40 bg-rose-500/10'
                    : 'border-rose-500/20 bg-rose-500/5'
              }`}
            >
              <p className="truncate text-sm font-bold text-zinc-200">{fin.name === me ? 'You' : fin.name}</p>
              <p
                className={`mt-1 text-xl font-black uppercase ${
                  choice === 'split' ? 'text-emerald-300' : 'text-rose-400'
                }`}
              >
                {choice ?? '—'}
              </p>
            </div>
          )
        })}
      </div>

      {o && <p className="text-center text-sm font-semibold leading-relaxed text-zinc-400">{o.desc}</p>}

      {state.you.isFinalist && f.outcome === 'both-split' && (
        <p className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-center text-sm font-bold text-emerald-300">
          You split the prize — collect your half!
        </p>
      )}
      {iAmStealer && (
        <p className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-center text-sm font-bold text-rose-300">
          You took the whole prize. Bold.
        </p>
      )}
      {iWasRobbed && (
        <p className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-center text-sm font-bold text-rose-300">
          You got robbed. Feel free to glare across the room.
        </p>
      )}

      {state.phase === 'finale_debrief' && (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm font-semibold leading-relaxed text-zinc-400">
          Money logic says &quot;always steal&quot; — yet people split. Your utility isn&apos;t just cash: fairness, guilt and
          reputation are in there too. That&apos;s utility theory in one decision.
        </p>
      )}
    </div>
  )
}

function WrapCard({ state }: { state: PlayerState }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <Trophy className="h-16 w-16 text-amber-400" aria-hidden="true" />
      <h2 className="text-3xl font-black">That&apos;s game theory, live.</h2>
      <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
        You finished with <span className="font-black text-amber-300">{state.you.totalScore} points</span>
        {state.leaderboard.myRank ? ` — rank #${state.leaderboard.myRank} of ${state.playerCount}` : ''}. You weren&apos;t
        just learning the theory today. You <span className="font-bold text-zinc-200">were</span> the theory.
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {['Utility Theory', 'Level-k', 'Iterated Dominance', 'Nash Equilibrium', 'Bounded Rationality'].map((c) => (
          <span key={c} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-[11px] font-bold text-zinc-400">
            {c}
          </span>
        ))}
      </div>
      <p className="text-xs text-zinc-600">Thanks for playing — Two-Thirds Arena</p>
    </div>
  )
}
