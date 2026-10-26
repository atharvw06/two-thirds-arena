'use client'

import { motion } from 'framer-motion'
import { ChevronRight, MonitorPlay, Smartphone, BrainCircuit, Users, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Landing({ onJoin, onHost }: { onJoin: () => void; onHost: () => void }) {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center overflow-hidden px-6 py-10">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[300px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex w-full flex-col items-center text-center"
      >
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">
          <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" />
          A live game theory experiment
        </p>

        <h1 className="font-black leading-[0.95] tracking-tight">
          <span className="block text-5xl sm:text-7xl">TWO-THIRDS</span>
          <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-6xl text-transparent sm:text-8xl">
            ARENA
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base text-zinc-400 sm:text-lg">
          Guess <span className="font-bold text-zinc-200">two-thirds of the average</span> of the whole class.
          Outsmart the crowd across three rounds — then the top two players face off in a{' '}
          <span className="font-bold text-zinc-200">Split or Steal</span> finale for the prize.
        </p>

        <div className="mt-10 grid w-full max-w-md gap-3">
          <Button
            size="lg"
            onClick={onJoin}
            className="h-16 w-full bg-amber-400 text-lg font-black tracking-wide text-zinc-950 hover:bg-amber-300"
          >
            <Smartphone className="mr-2 h-6 w-6" aria-hidden="true" />
            JOIN THE GAME
            <ChevronRight className="ml-1 h-6 w-6" aria-hidden="true" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onHost}
            className="h-14 w-full border-zinc-700 bg-zinc-900 text-base font-bold text-zinc-200 hover:bg-zinc-800 hover:text-zinc-50"
          >
            <MonitorPlay className="mr-2 h-5 w-5" aria-hidden="true" />
            HOST ON PROJECTOR
          </Button>
        </div>

        <div className="mt-12 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { icon: Users, title: 'Everyone plays', desc: 'The whole class joins from their phones in seconds.' },
            { icon: BrainCircuit, title: 'You are the data', desc: 'Debriefs are built from your own class\u2019s live numbers.' },
            { icon: Trophy, title: 'Real stakes', desc: 'Points stack up. Top two duel for the prize box.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-left">
              <Icon className="mb-3 h-5 w-5 text-amber-400" aria-hidden="true" />
              <p className="text-sm font-bold text-zinc-100">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  )
}
