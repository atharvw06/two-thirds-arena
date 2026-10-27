'use client'

import { motion } from 'framer-motion'
import { BrainCircuit, Trophy } from 'lucide-react'
import type { HostState } from '../types'

const CONCEPTS = [
  { title: 'Utility Theory', desc: 'Payoffs are utils, not money — fairness and guilt move equilibria.' },
  { title: 'Strategic Interdependence', desc: 'Your best move depends on what everyone else does.' },
  { title: 'Level-k Reasoning', desc: 'How many steps ahead of the crowd are you? The crowd is ~1–2.' },
  { title: 'Iterated Dominance', desc: 'Cross off what can never win; keep crossing — only 0 survives.' },
  { title: 'Nash Equilibrium', desc: 'No one gains by deviating alone. Here: everyone guesses 0.' },
  { title: 'Bounded Rationality', desc: 'Real humans stop reasoning a few steps short of perfection.' },
  { title: 'Backward Induction', desc: 'The spiral engine — the same logic that solves sequential game trees.' },
  { title: 'Social Preferences', desc: 'Why the finale ended the way it did.' },
]

export function HostWrap({ state }: { state: HostState }) {
  const winner =
    state.finale.outcome === 'one-steals'
      ? state.finale.finalists.find((f) => f.id === state.finale.stealerId)?.name
      : state.finale.outcome === 'both-split'
        ? `${state.finale.finalists[0]?.name ?? ''} & ${state.finale.finalists[1]?.name ?? ''}`
        : null

  return (
    <div className="flex h-full flex-col items-center justify-center gap-7 overflow-y-auto p-8 lg:p-12">
      <div className="text-center">
        <Trophy className="mx-auto h-12 w-12 text-amber-400" aria-hidden="true" />
        <h1 className="mt-3 text-4xl font-black tracking-tight lg:text-6xl">
          You weren&apos;t learning game theory.
          <span className="block text-amber-300">You were the game theory.</span>
        </h1>
        <p className="mt-3 text-sm font-semibold text-zinc-400 lg:text-base">
          {state.playerCount} players, 3 rounds, {state.results[1]?.n ?? 0}+ live data points — every debrief today was
          computed from this room.
        </p>
        {winner && (
          <p className="mt-3 inline-block rounded-full border border-amber-500/40 bg-amber-400/10 px-5 py-2 text-sm font-black text-amber-200">
            {state.finale.outcome === 'both-split' ? 'Prize shared by' : 'Prize taken by'}: {winner}
          </p>
        )}
      </div>

      <div className="grid w-full max-w-4xl gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {CONCEPTS.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <p className="inline-flex items-center gap-1.5 text-sm font-black text-zinc-100">
              <BrainCircuit className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              {c.title}
            </p>
            <p className="mt-1.5 text-xs font-semibold leading-relaxed text-zinc-500">{c.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-4xl rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-left">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Visesh & Team Wrap · The 3 Final Takeaways</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-zinc-900/60 p-2.5">
            <span className="font-bold text-amber-300">1. Strategic Interdependence:</span>
            <p className="text-xs text-zinc-300">Your best move always depends on what others do (Keynesian Beauty Contest).</p>
          </div>
          <div className="rounded-xl bg-zinc-900/60 p-2.5">
            <span className="font-bold text-amber-300">2. The Spiral to Zero:</span>
            <p className="text-xs text-zinc-300">Iterated dominance collapses common knowledge to zero (the unique Nash Equilibrium).</p>
          </div>
          <div className="rounded-xl bg-zinc-900/60 p-2.5">
            <span className="font-bold text-amber-300">3. Bounded Rationality:</span>
            <p className="text-xs text-zinc-300">Real humans reason 1–2 steps ahead. Knowing the room beats knowing only the formula!</p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">
        Two-Thirds Arena · thanks for playing
      </p>
    </div>
  )
}
