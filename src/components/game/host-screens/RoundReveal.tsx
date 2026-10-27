'use client'

import { motion } from 'framer-motion'
import { Crown, Sigma, Target } from 'lucide-react'
import { Histogram } from '../Histogram'
import { fmtNum, type HostState } from '../types'

export function HostRoundReveal({ state }: { state: HostState }) {
  const r = state.results[state.round] ?? null
  const dominated = r ? r.guesses.filter((g) => g.guess > 100 / 1.5).length : 0 // > 66.67
  const dominatedPct = r && r.n > 0 ? Math.round((dominated / r.n) * 100) : 0

  return (
    <div className="flex h-full flex-col gap-4 p-6 lg:p-8">
      <header className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">Round {state.round} reveal</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight lg:text-4xl">The class has spoken</h1>
      </header>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex min-h-0 flex-col justify-center rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4">
          <Histogram
            result={r}
            height={330}
            marks={[
              { at: Math.min(100, r?.mean ?? 0), label: `avg ${fmtNum(r?.mean ?? 0, 1)}`, color: 'zinc' },
              { at: Math.min(100, r?.target ?? 0), label: `target ${fmtNum(r?.target ?? 0, 1)}`, color: 'amber' },
            ]}
          />
        </div>

        <div className="flex flex-col justify-center gap-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <Sigma className="h-3 w-3" aria-hidden="true" /> average
              </p>
              <p className="mt-1 text-4xl font-black tabular-nums">{fmtNum(r?.mean ?? 0, 1)}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4 text-center">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
                <Target className="h-3 w-3" aria-hidden="true" /> ⅔ of avg
              </p>
              <p className="mt-1 text-4xl font-black tabular-nums text-amber-300">{fmtNum(r?.target ?? 0, 1)}</p>
            </div>
          </motion.div>

          {r && r.winners.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75, type: 'spring', stiffness: 160, damping: 15 }}
              className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center"
            >
              <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
                <Crown className="h-3.5 w-3.5" aria-hidden="true" /> closest {r.winners.length > 1 ? `(${r.winners.length} winners)` : ''}
              </p>
              <p className="mt-2 truncate text-2xl font-black text-emerald-300">
                {r.winners.map((w) => w.name).join(' & ')}
              </p>
              <p className="mt-1 text-sm font-bold text-emerald-400/80">
                guessed {r.winners.map((w) => fmtNum(w.guess, 1)).join(', ')} · +{r.points[r.winners[0].id] ?? 0} pts
              </p>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 text-center text-sm font-bold text-zinc-500">
              No guesses this round
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95 }}
            className="grid grid-cols-3 gap-2 text-center"
          >
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-2 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">guesses</p>
              <p className="text-lg font-black tabular-nums">{r?.n ?? 0}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-2 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">min / max</p>
              <p className="text-lg font-black tabular-nums">
                {fmtNum(r?.min ?? 0, 0)} / {fmtNum(r?.max ?? 0, 0)}
              </p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-2 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-rose-400/80">&gt; 66.7 (hopeless)</p>
              <p className="text-lg font-black tabular-nums text-rose-300">
                {dominated} <span className="text-xs font-bold">({dominatedPct}%)</span>
              </p>
            </div>
          </motion.div>

          {/* Presenter Cue Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Presenter Line · Saraswati</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-200">
              &ldquo;The class average was <span className="text-amber-300 font-bold">{fmtNum(r?.mean ?? 0, 1)}</span>, making the target <span className="text-emerald-300 font-bold">{fmtNum(r?.target ?? 0, 1)}</span>! Why did {r?.winners[0]?.name ?? 'the winner'} win? Because they didn&apos;t think about the number—they thought about <span className="text-amber-300 font-bold">us</span>. Aditi, take the room down the rabbit hole.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
