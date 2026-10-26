'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { CountdownRing } from '../CountdownRing'
import type { HostState } from '../types'

const ROUND_SUB: Record<number, string> = {
  1: 'First instincts — no strategy talk.',
  2: 'You have seen the data. Adapt.',
  3: 'Endgame. Everything you know… apply it.',
}

export function HostRoundOpen({ state }: { state: HostState }) {
  const round = state.round
  const allIn = state.eligibleCount > 0 && state.submittedCount === state.eligibleCount
  const pct = state.eligibleCount > 0 ? (state.submittedCount / state.eligibleCount) * 100 : 0

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 16 }}
        className="text-center"
      >
        <p className="text-xs font-black uppercase tracking-[0.4em] text-amber-400">Round {round} of 3</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight lg:text-7xl">Pick a number</h1>
        <p className="mt-3 text-xl font-bold text-zinc-400 lg:text-2xl">
          0 – 100 · closest to <span className="text-amber-300">⅔ of the class average</span> wins
        </p>
        <p className="mt-2 text-sm font-semibold text-zinc-500">{ROUND_SUB[round]}</p>
      </motion.div>

      <CountdownRing endsAt={state.endsAt} totalMs={45000} size={220} label="seconds left" />

      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="inline-flex items-center gap-2 text-zinc-300">
            <Lock className="h-4 w-4 text-amber-400" aria-hidden="true" />
            {allIn ? 'Everyone is locked in!' : 'Locked in'}
          </span>
          <span className="tabular-nums text-zinc-200">
            {state.submittedCount} / {state.eligibleCount}
          </span>
        </div>
        <div className="mt-2 h-4 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className={`h-full rounded-full ${allIn ? 'bg-emerald-400' : 'bg-amber-400'}`}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: Math.min(state.eligibleCount, 20) }).map((_, i) => (
            <motion.span
              key={i}
              className={`h-2 w-2 rounded-full ${i < state.submittedCount ? 'bg-emerald-400' : 'bg-zinc-700'}`}
              animate={i < state.submittedCount ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            />
          ))}
        </div>
        {allIn && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm font-black uppercase tracking-[0.25em] text-emerald-400"
          >
            Revealing…
          </motion.p>
        )}
      </div>
    </div>
  )
}
