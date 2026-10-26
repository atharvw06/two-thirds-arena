'use client'

import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'
import type { HostState } from '../types'

const STEPS = [
  {
    n: 1,
    title: 'Pick a number',
    desc: 'Any number from 0 to 100. Decimals allowed. No talking once the timer starts.',
  },
  {
    n: 2,
    title: 'We average the class',
    desc: 'Every phone in this room submits. We compute the mean of ALL guesses.',
  },
  {
    n: 3,
    title: 'Target = two-thirds of the average',
    desc: 'Average 60? Target is 40. Average 30? Target is 20. You want to be closest to the target.',
  },
  {
    n: 4,
    title: 'Points, three rounds, a finale',
    desc: 'Closest scores big. Three rounds stack up — 30, 25, then 20 seconds on the clock. The top two duel for the prize in Split or Steal.',
  },
]

export function HostHowto({ state }: { state: HostState }) {
  return (
    <div className="flex h-full flex-col justify-center gap-8 p-8 lg:p-14">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">The rules</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight lg:text-6xl">
          Guess <span className="text-amber-300">two-thirds</span> of the average
        </h1>
        <p className="mt-3 text-base text-zinc-400 lg:text-lg">
          The famous <span className="font-bold text-zinc-200">&ldquo;beauty contest&rdquo;</span> game — invented by Keynes,
          tortured on students ever since.
        </p>
      </div>

      <ol className="grid gap-4 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.12 }}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-xl font-black text-zinc-950">
              {s.n}
            </span>
            <h2 className="mt-4 text-lg font-black">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.desc}</p>
          </motion.li>
        ))}
      </ol>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="mx-auto flex items-center gap-3 rounded-full border border-amber-500/40 bg-amber-400/10 px-8 py-4"
      >
        <Gift className="h-6 w-6 text-amber-300" aria-hidden="true" />
        <p className="text-lg font-black text-amber-200">
          Grand prize: {state.prize} — on the line in the finale
        </p>
      </motion.div>
    </div>
  )
}
