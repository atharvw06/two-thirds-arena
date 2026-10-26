'use client'

import { motion } from 'framer-motion'
import { Gift, Lock, Swords, Timer } from 'lucide-react'
import { CountdownRing } from '../CountdownRing'
import { Confetti } from '../Confetti'
import type { HostState } from '../types'

function FinalistCard({
  name,
  score,
  state,
  delay = 0,
  tall = false,
}: {
  name: string
  score: number
  state: 'pending' | 'locked' | 'split' | 'steal'
  delay?: number
  tall?: boolean
}) {
  const tone =
    state === 'split'
      ? 'border-emerald-500/50 bg-emerald-500/10'
      : state === 'steal'
        ? 'border-rose-500/50 bg-rose-500/10'
        : 'border-zinc-800 bg-zinc-900/50'
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 140, damping: 16 }}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-3xl border-2 px-6 text-center ${tone} ${
        tall ? 'min-h-[300px] sm:min-h-[340px]' : 'min-h-[190px]'
      }`}
    >
      <p className="text-2xl font-black text-zinc-50 sm:text-3xl">{name}</p>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{score} pts</p>
      {state === 'pending' && (
        <span className="mt-2 inline-flex animate-pulse items-center gap-1.5 text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
          <Timer className="h-3.5 w-3.5" aria-hidden="true" /> deciding…
        </span>
      )}
      {state === 'locked' && (
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.25em] text-amber-400">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" /> locked in
        </span>
      )}
      {state === 'split' && (
        <span className="mt-2 text-3xl font-black uppercase tracking-widest text-emerald-300 sm:text-4xl">split</span>
      )}
      {state === 'steal' && (
        <span className="mt-2 text-3xl font-black uppercase tracking-widest text-rose-400 sm:text-4xl">steal</span>
      )}
    </motion.div>
  )
}

// ---------------- INTRO ----------------

export function HostFinaleIntro({ state }: { state: HostState }) {
  const [f1, f2] = state.finale.finalists
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-8 p-8">
      <Confetti count={40} active />
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.4em] text-rose-400">The grand finale</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight lg:text-7xl">
          SPLIT <span className="text-zinc-600">or</span> STEAL
        </h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-400/10 px-6 py-2.5"
        >
          <Gift className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <span className="text-lg font-black text-amber-200">{state.prize}</span>
        </motion.div>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-4">
        <FinalistCard name={f1?.name ?? 'Player 1'} score={f1?.score ?? 0} state="pending" delay={0.25} tall />
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 12 }}
        >
          <Swords className="h-10 w-10 text-rose-400" aria-hidden="true" />
        </motion.div>
        <FinalistCard name={f2?.name ?? 'Player 2'} score={f2?.score ?? 0} state="pending" delay={0.35} tall />
      </div>

      <p className="max-w-2xl text-center text-sm font-semibold leading-relaxed text-zinc-400">
        Both finalists choose in secret on their phones. <span className="font-bold text-emerald-300">Both split</span> →
        they share the prize. <span className="font-bold text-rose-300">One steals</span> → the stealer takes everything.{' '}
        <span className="font-bold text-rose-300">Both steal</span> → the prize is destroyed. Choose wisely.
      </p>
    </div>
  )
}

// ---------------- VOTE ----------------

export function HostFinaleVote({ state }: { state: HostState }) {
  const [f1, f2] = state.finale.finalists
  const c1 = state.finale.choices[f1?.id ?? ''] ? 'locked' : 'pending'
  const c2 = state.finale.choices[f2?.id ?? ''] ? 'locked' : 'pending'
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.4em] text-rose-400">Final in progress</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight lg:text-5xl">They are deciding…</h1>
        <p className="mt-2 text-sm font-semibold text-zinc-500">
          {state.prize} · decisions are made in secret on their phones
        </p>
      </div>

      <CountdownRing endsAt={state.endsAt} totalMs={40000} size={190} label="to decide" />

      <div className="grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-4">
        <FinalistCard name={f1?.name ?? 'Player 1'} score={f1?.score ?? 0} state={c1} />
        <Swords className="h-8 w-8 text-zinc-700" aria-hidden="true" />
        <FinalistCard name={f2?.name ?? 'Player 2'} score={f2?.score ?? 0} state={c2} delay={0.1} />
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
        no peeking — choices reveal only when both are locked
      </p>
    </div>
  )
}

// ---------------- REVEAL ----------------

export function HostFinaleReveal({ state }: { state: HostState }) {
  const [f1, f2] = state.finale.finalists
  const outcome = state.finale.outcome
  const stealerId = state.finale.stealerId
  const stealer = state.finale.finalists.find((f) => f.id === stealerId)
  const victim = state.finale.finalists.find((f) => f.id !== stealerId)

  const headline =
    outcome === 'both-split'
      ? { text: 'THEY SPLIT THE PRIZE', sub: `Honesty pays — ${state.prize} is shared between both finalists.`, tone: 'text-emerald-300' }
      : outcome === 'one-steals'
        ? { text: `${(stealer?.name ?? 'The stealer').toUpperCase()} STEALS IT ALL`, sub: `${victim?.name ?? 'The other finalist'} walks away with nothing. Cold.`, tone: 'text-rose-400' }
        : { text: 'MUTUAL DESTRUCTION', sub: 'Both stole. Nobody wins. The house keeps the prize.', tone: 'text-rose-500' }

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-8 overflow-hidden p-8">
      <Confetti active count={outcome === 'both-split' ? 120 : 60} />

      <motion.h1
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.3 }}
        className={`text-center text-5xl font-black tracking-tight lg:text-7xl ${headline.tone}`}
      >
        {headline.text}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="max-w-xl text-center text-lg font-bold text-zinc-300"
      >
        {headline.sub}
      </motion.p>

      <div className="grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-4">
        <FinalistCard
          name={f1?.name ?? 'Player 1'}
          score={f1?.score ?? 0}
          state={state.finale.choices[f1?.id ?? ''] === 'split' ? 'split' : 'steal'}
          delay={0.9}
        />
        <Swords className="h-8 w-8 text-zinc-700" aria-hidden="true" />
        <FinalistCard
          name={f2?.name ?? 'Player 2'}
          score={f2?.score ?? 0}
          state={state.finale.choices[f2?.id ?? ''] === 'split' ? 'split' : 'steal'}
          delay={1.05}
        />
      </div>
    </div>
  )
}

// ---------------- DEBRIEF ----------------

export function HostFinaleDebrief({ state }: { state: HostState }) {
  return (
    <div className="flex h-full flex-col justify-center gap-6 p-8 lg:p-12">
      <header className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">Finale debrief</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight lg:text-4xl">
          Why did they <span className="text-emerald-300">split</span>?
        </h1>
      </header>

      <div className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        {/* payoff matrix */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
            the money payoff matrix
          </p>
          <table className="w-full border-collapse text-center text-sm">
            <thead>
              <tr>
                <th className="w-1/4" />
                <th className="border-b border-zinc-800 pb-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  they split
                </th>
                <th className="border-b border-zinc-800 pb-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  they steal
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="pr-3 text-right text-xs font-black uppercase tracking-widest text-zinc-400">you split</th>
                <td className="border border-emerald-500/30 bg-emerald-500/10 p-3 font-bold text-emerald-300">
                  both get half
                </td>
                <td className="border border-zinc-800 p-3 font-bold text-zinc-400">they get all</td>
              </tr>
              <tr>
                <th className="pr-3 text-right text-xs font-black uppercase tracking-widest text-zinc-400">you steal</th>
                <td className="border border-zinc-800 p-3 font-bold text-zinc-400">you get all</td>
                <td className="border border-rose-500/40 bg-rose-500/10 p-3 font-bold text-rose-300">
                  nobody gets anything
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-center text-[11px] font-semibold text-zinc-500">
            Steal never does worse than Split — and sometimes better. It <span className="text-rose-300">weakly dominates</span>.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3">
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-400">the &ldquo;rational&rdquo; answer</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-300">
              In pure money terms, two perfectly rational players both steal — the Nash equilibrium — and the prize dies.
              Game theory&apos;s coldest prediction: <span className="font-bold text-rose-300">(Steal, Steal) → zero</span>.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">the human answer</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-300">
              Yet real finalists split all the time. Why? Because{' '}
              <span className="font-bold text-emerald-300">utility ≠ money</span>. Fairness, guilt, honour and reputation
              all live inside your utility function u(x). When someone splits, they aren&apos;t being irrational — they are
              maximizing <span className="font-bold text-zinc-100">their true utility</span>, not their bank balance.
            </p>
          </div>
          <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-xs font-semibold leading-relaxed text-zinc-400">
            This is <span className="text-zinc-200">utility theory</span> in one decision: the numbers in a payoff matrix
            are utils, not rupees. Change what people value, and the equilibrium moves.
          </p>
        </div>
      </div>
    </div>
  )
}
