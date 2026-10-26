'use client'

import { motion } from 'framer-motion'
import { Crown, Medal } from 'lucide-react'
import type { HostState } from '../types'

export function HostLeaderboard({ state }: { state: HostState }) {
  const ranked = [...state.players].sort((a, b) => b.totalScore - a.totalScore)
  const top = ranked.slice(0, 10)
  const finalists = ranked.slice(0, 2)
  const rest = ranked.length - top.length

  return (
    <div className="flex h-full flex-col justify-center gap-6 p-8 lg:p-12">
      <header className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">After three rounds</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight lg:text-5xl">The leaderboard</h1>
      </header>

      <div className="mx-auto grid w-full max-w-3xl gap-2.5">
        {top.map((p, i) => {
          const isFinalist = i < 2
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.09, type: 'spring', stiffness: 140, damping: 17 }}
              className={`flex items-center gap-4 rounded-2xl border px-5 py-3 ${
                isFinalist
                  ? 'border-amber-500/50 bg-amber-400/10'
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <span className={`w-8 text-center text-xl font-black ${isFinalist ? 'text-amber-300' : 'text-zinc-600'}`}>
                {i + 1}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-black text-zinc-200">
                {p.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="truncate text-lg font-black text-zinc-100">{p.name}</span>
              {i === 0 && <Crown className="h-5 w-5 text-amber-400" aria-label="Leader" />}
              {i === 1 && <Medal className="h-5 w-5 text-zinc-400" aria-label="Runner up" />}
              <span className={`ml-auto text-2xl font-black tabular-nums ${isFinalist ? 'text-amber-300' : 'text-zinc-300'}`}>
                {p.totalScore}
              </span>
            </motion.div>
          )
        })}
        {rest > 0 && (
          <p className="text-center text-xs font-semibold text-zinc-600">+ {rest} more players on the board</p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
        className="mx-auto rounded-3xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-400/15 via-amber-400/5 to-transparent px-10 py-5 text-center"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400">Finalists</p>
        <p className="mt-1.5 text-2xl font-black text-zinc-50">
          {finalists[0]?.name ?? '—'} <span className="text-amber-400">vs</span> {finalists[1]?.name ?? '—'}
        </p>
        <p className="mt-1 text-sm font-bold text-zinc-400">
          You two are playing for {state.prize}. Everyone else — you&apos;re the jury now.
        </p>
      </motion.div>
    </div>
  )
}
