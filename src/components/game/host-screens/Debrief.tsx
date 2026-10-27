'use client'

import { motion } from 'framer-motion'
import { BrainCircuit, Lightbulb, MoveLeft, Quote, TrendingDown } from 'lucide-react'
import { Histogram } from '../Histogram'
import { fmtNum, type HostState } from '../types'

/** Approximate level-k depth of a guess (guess ≈ 50·(2/3)^k). */
function levelOf(g: number): number {
  if (g <= 0.5) return 8 // "infinity"
  const k = Math.log(g / 50) / Math.log(2 / 3)
  return Math.max(0, k)
}

const LADDER = [
  { k: 'L0', v: 50, label: 'Random / gut feel' },
  { k: 'L1', v: 33.3, label: 'One step ahead of the crowd' },
  { k: 'L2', v: 22.2, label: 'Two steps ahead' },
  { k: 'L3', v: 14.8, label: 'Three steps ahead' },
  { k: 'L∞', v: 0, label: 'Perfectly rational' },
]

export function HostDebrief({ state }: { state: HostState }) {
  if (state.phase === 'r1_debrief') return <DebriefLevelK state={state} />
  if (state.phase === 'r2_debrief') return <DebriefSpiral state={state} />
  return <DebriefNash state={state} />
}

// ---------------- ROUND 1: Level-k ----------------

function DebriefLevelK({ state }: { state: HostState }) {
  const r = state.results[1] ?? null
  const crowdDepth = r ? levelOf(r.mean) : 0
  const winner = r?.winners[0] ?? null
  const dominated = r ? r.guesses.filter((g) => g.guess > 100 / 1.5).length : 0

  return (
    <div className="flex h-full flex-col gap-3 p-6 lg:p-8">
      <header className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">Round 1 debrief</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight lg:text-4xl">
          How deep did this class think?
        </h1>
      </header>

      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex min-h-0 flex-col justify-center rounded-3xl border border-zinc-800 bg-zinc-900/40 p-3">
          <Histogram
            result={r}
            height={300}
            marks={[
              { at: 50, label: 'L0', color: 'zinc' },
              { at: 33.3, label: 'L1', color: 'zinc' },
              { at: 22.2, label: 'L2', color: 'zinc' },
              { at: 14.8, label: 'L3', color: 'zinc' },
              { at: Math.min(100, r?.mean ?? 0), label: 'avg', color: 'amber' },
              { at: Math.min(100, r?.target ?? 0), label: 'target', color: 'emerald' },
            ]}
          />
        </div>

        <div className="flex flex-col justify-center gap-3">
          <div className="space-y-1.5">
            {LADDER.map((l, i) => (
              <motion.div
                key={l.k}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`flex items-center justify-between rounded-xl border px-4 py-2 ${
                  l.k === 'L∞'
                    ? 'border-rose-500/30 bg-rose-500/10'
                    : 'border-zinc-800 bg-zinc-900/50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 text-sm font-black text-amber-300">{l.k}</span>
                  <span className="text-xs font-semibold text-zinc-300">{l.label}</span>
                </span>
                <span className="text-sm font-black tabular-nums text-zinc-200">{l.v}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4"
          >
            <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
              <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" /> live read on your class
            </p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-zinc-200">
              Class average: <span className="text-amber-300">{fmtNum(r?.mean ?? 0, 1)}</span> → the crowd reasoned about{' '}
              <span className="text-amber-300">{crowdDepth.toFixed(1)} levels deep</span>
              {winner ? (
                <>
                  {' '}· winner <span className="text-emerald-300">{winner.name}</span> ({fmtNum(winner.guess, 1)}) was at
                  level <span className="text-emerald-300">{levelOf(winner.guess) >= 8 ? '∞' : levelOf(winner.guess).toFixed(1)}</span>
                </>
              ) : null}
              .
            </p>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-400">
              {dominated > 0 ? (
                <>
                  And {dominated} player{dominated === 1 ? '' : 's'} picked above 66.67 — a number that can never win. Optimism is
                  not a strategy.
                </>
              ) : (
                <>Nobody picked above 66.67 — this class came to play.</>
              )}
            </p>
          </motion.div>

          <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3.5 text-xs font-semibold leading-relaxed text-zinc-400">
            Key idea: there is no &quot;right answer&quot; — your best number depends on what you think{' '}
            <span className="text-zinc-200">everyone else</span> picks. That interdependence is the heart of game theory.
          </p>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Aditi Cue · Level-K Explanation</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-300">
              &ldquo;Level-0 is gut feel (~50). Level-1 undercuts that (~33). Level-2 undercuts Level-1 (~22). Our class landed at Level {crowdDepth.toFixed(1)} thinking. The winner didn&apos;t solve math—they modeled the human room!&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------- ROUND 2: Number spiral ----------------

function DebriefSpiral({ state }: { state: HostState }) {
  const r1 = state.results[1] ?? null
  const r2 = state.results[2] ?? null
  const m1 = r1?.mean ?? 0
  const m2 = r2?.mean ?? 0
  const drop = m1 > 0 ? Math.round(((m1 - m2) / m1) * 100) : 0

  const chain: number[] = [100]
  for (let i = 0; i < 9; i++) chain.push(Math.round((chain[chain.length - 1] * 2 * 10) / 3) / 10)

  return (
    <div className="flex h-full flex-col gap-3 p-6 lg:p-8">
      <header className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">Round 2 debrief</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight lg:text-4xl">The number spiral</h1>
      </header>

      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex min-h-0 flex-col justify-center gap-2 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-3">
          <div className="grid flex-1 grid-cols-2 items-center gap-3">
            <Histogram result={r1} height={210} compact title="Round 1" marks={r1 ? [{ at: Math.min(100, r1.mean), label: `avg ${fmtNum(r1.mean, 1)}`, color: 'zinc' }] : []} />
            <Histogram result={r2} height={210} compact title="Round 2" marks={r2 ? [{ at: Math.min(100, r2.mean), label: `avg ${fmtNum(r2.mean, 1)}`, color: 'amber' }] : []} />
          </div>
          {r1 && r2 && m1 > m2 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center justify-center gap-2 text-center text-sm font-black text-emerald-300"
            >
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
              average fell {fmtNum(m1, 1)} → {fmtNum(m2, 1)} (−{drop}%) · you just ran the spiral, live
            </motion.p>
          ) : null}
        </div>

        <div className="flex flex-col justify-center gap-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">iterate &ldquo;× ⅔&rdquo; forever</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2">
              {chain.map((v, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className={`rounded-lg px-2.5 py-1 text-sm font-black tabular-nums ${
                      i === 0
                        ? 'bg-zinc-800 text-zinc-300'
                        : i === chain.length - 1
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-400/15 text-amber-300'
                    }`}
                  >
                    {v}
                  </span>
                  {i < chain.length - 1 && <MoveLeft className="h-3 w-3 text-zinc-600" aria-hidden="true" />}
                </motion.span>
              ))}
              <span className="text-sm font-black text-rose-300">→ 0</span>
            </div>
          </div>

          <ol className="space-y-1.5 text-xs font-semibold leading-relaxed text-zinc-300">
            <li className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3.5 py-2.5">
              <span className="font-black text-amber-300">1.</span> Even if everyone picked 100, the target is 66.67. Any guess
              above that <span className="text-zinc-100">can never win</span> — crossed off.
            </li>
            <li className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3.5 py-2.5">
              <span className="font-black text-amber-300">2.</span> But if nobody guesses above 66.67, the max average is 66.67,
              so the max target is <span className="text-zinc-100">44.4</span> — cross off everything above that too.
            </li>
            <li className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3.5 py-2.5">
              <span className="font-black text-amber-300">3.</span> Repeat forever: 66.7 → 44.4 → 29.6 → 19.8 → …{' '}
              <span className="text-zinc-100">only 0 survives</span>. Iterated elimination of dominated strategies.
            </li>
          </ol>

          <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3.5 text-xs font-semibold leading-relaxed text-zinc-400">
            <span className="inline-flex items-center gap-1 font-black text-zinc-200">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" /> Sequential-games link:
            </span>{' '}
            this &ldquo;unwind the chain&rdquo; logic is the same engine as <span className="text-zinc-200">backward induction</span>{' '}
            — solving a game tree from the last move backwards. Same idea, different clothes.
          </p>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Visesh / Aditi Cue · The Spiral to 0</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-300">
              &ldquo;Any guess above 66.7 can never win. Once removed, the new ceiling drops to 44.4 → 29.6 → ... all the way to 0. Zero is the unique Nash Equilibrium. But if you guessed 0, you lost! Why? Because bounded rationality means real people stop thinking a few steps in.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------- ROUND 3: Nash trap ----------------

function DebriefNash({ state }: { state: HostState }) {
  const r = state.results[3] ?? null
  const zeros = r ? r.guesses.filter((g) => g.guess <= 0.5).length : 0
  const winner = r?.winners[0] ?? null
  const winnerIsZero = winner ? winner.guess <= 0.5 : false

  return (
    <div className="flex h-full flex-col justify-center gap-5 p-8 lg:p-12">
      <header className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">Round 3 debrief</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight lg:text-5xl">The Nash trap</h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-auto max-w-3xl rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center"
      >
        <p className="text-lg font-bold leading-relaxed text-zinc-100 lg:text-xl">
          If everyone in this room were <span className="text-rose-300">perfectly rational</span> — and knew everyone else
          was too — every single person would pick <span className="text-rose-300 font-black">0</span>.
        </p>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-400">
          If all pick 0, the target is ⅔ × 0 = 0, and nobody can do better by deviating alone. That is the{' '}
          <span className="text-zinc-100 font-bold">Nash equilibrium</span>: a profile of moves where no one wants to
          unilaterally switch. The only one this game has.
        </p>
      </motion.div>

      <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">picked exactly 0</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-rose-300">{zeros} / {r?.n ?? 0}</p>
          <p className="mt-1 text-[11px] font-semibold text-zinc-500">humans, famously imperfect</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">winner guessed</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-emerald-300">{winner ? fmtNum(winner.guess, 1) : '—'}</p>
          <p className="mt-1 text-[11px] font-semibold text-zinc-500">{winner?.name ?? 'no winner'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">class average</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-amber-300">{fmtNum(r?.mean ?? 0, 1)}</p>
          <p className="mt-1 text-[11px] font-semibold text-zinc-500">still far from 0</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-[auto_1fr]"
      >
        <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <Quote className="h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
          <p className="text-xs font-semibold italic leading-relaxed text-zinc-300">
            It is not a case of choosing those which are really the prettiest, but of choosing the ones you think most
            likely to catch the fancy of the other competitors… We have reached the third degree, where we devote our
            intelligences to anticipating what average opinion expects the average opinion to be.
            <span className="mt-1 block not-italic font-bold text-zinc-500">— John Maynard Keynes, on stock markets</span>
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-semibold leading-relaxed text-zinc-400">
            <span className="font-black text-zinc-200">Bounded rationality:</span> real people reason finitely — a step or
            three, then stop.{' '}
            {winner && !winnerIsZero ? (
              <>
                Guessing 0 today would have <span className="text-zinc-200">lost</span>. Your winner didn&apos;t model the
                theory — they modelled <span className="text-zinc-200">this room</span>. Smart means knowing your crowd.
              </>
            ) : (
              <>
                Strategy is about modelling the <span className="text-zinc-200">players you actually have</span>, not the
                players a textbook wishes you had.
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
