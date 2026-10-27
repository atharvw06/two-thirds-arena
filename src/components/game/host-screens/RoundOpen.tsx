'use client'

import { motion } from 'framer-motion'
import { Lock, Sparkles, FastForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CountdownRing } from '../CountdownRing'
import { ROUND_SECONDS, type HostState } from '../types'

const ROUND_SUB: Record<number, string> = {
  1: 'First instincts — no strategy talk. What does the crowd think?',
  2: 'You have seen the data once. The room is adapting. How low will you go?',
}

export function HostRoundOpen({ state, act }: { state: HostState; act?: (a: string, v?: string) => void }) {
  const round = state.round
  const allIn = state.eligibleCount > 0 && state.submittedCount === state.eligibleCount
  const pct = state.eligibleCount > 0 ? (state.submittedCount / state.eligibleCount) * 100 : 0

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 lg:p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 16 }}
        className="text-center"
      >
        <p className="text-xs font-black uppercase tracking-[0.4em] text-amber-400">Round {round} of 2</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight lg:text-7xl">Pick a number</h1>
        <p className="mt-3 text-xl font-bold text-zinc-400 lg:text-2xl">
          0 – 100 · closest to <span className="text-amber-300">⅔ of the class average</span> wins
        </p>
        <p className="mt-2 text-sm font-semibold text-zinc-500">{ROUND_SUB[round] ?? 'Choose wisely.'}</p>
      </motion.div>

      <CountdownRing endsAt={state.endsAt} totalMs={(ROUND_SECONDS[round] ?? 30) * 1000} size={200} label="seconds left" />

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

        {/* Presenter Cue & Hybrid Control */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {act && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => act('add_sample')}
                className="h-8 border-zinc-700 bg-zinc-900 text-xs font-bold text-zinc-300 hover:border-amber-400"
              >
                <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-400" />
                Fill Sample Guesses (Wi-Fi Fallback)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => act('skip')}
                className="h-8 border-rose-500/40 bg-rose-500/10 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
              >
                <FastForward className="mr-1 h-3.5 w-3.5 text-rose-400" />
                Force Reveal Now
              </Button>
            </div>
          )}

          <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              {round === 1 ? 'Saraswati Cue' : 'Aditi Cue'}
            </p>
            <p className="text-xs font-semibold text-zinc-300">
              {round === 1
                ? '“Lock it in! Every second you hesitate, somebody out there is guessing what you will pick.”'
                : '“You have seen round one. If everyone knows 33 is the Level-1 pick, what is your move now?”'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
