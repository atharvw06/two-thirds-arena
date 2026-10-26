'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Gift, Pencil, ScanLine, Smartphone, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { HostState } from '../types'

export function HostLobby({ state, act }: { state: HostState; act: (a: string, v?: string) => void }) {
  // Computed inline: the room code is stable for the session.
  const joinUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/?room=${state.code}` : ''
  const [prize, setPrize] = useState('')
  const [editing, setEditing] = useState(false)

  return (
    <div className="grid h-full grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1.2fr_1fr] lg:p-10">
      {/* left: join instructions */}
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">Get your phone ready</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight lg:text-5xl">Join the arena</h1>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-400/10 to-transparent px-10 py-8"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400">room code</p>
          <p className="text-7xl font-black tracking-[0.25em] text-amber-300 lg:text-8xl" aria-label={`Room code ${state.code}`}>
            {state.code}
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="rounded-2xl bg-white p-3 shadow-2xl">
            {joinUrl ? <QRCodeSVG value={joinUrl} size={150} level="M" /> : <div className="h-[150px] w-[150px]" />}
          </div>
          <div className="text-left">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-zinc-200">
              <ScanLine className="h-4 w-4 text-amber-400" aria-hidden="true" /> Scan to jump straight in
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <Smartphone className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
              or open <span className="select-all font-mono text-xs font-bold text-zinc-200">{joinUrl}</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500">Enter the code + a nickname. That&apos;s it.</p>
          </div>
        </div>

        {/* prize setting */}
        <div className="w-full max-w-md">
          {editing ? (
            <div className="flex gap-2">
              <Input
                value={prize}
                onChange={(e) => setPrize(e.target.value.slice(0, 40))}
                className="h-11 border-zinc-700 bg-zinc-950 font-bold"
                aria-label="Prize name"
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => {
                  if (prize.trim()) act('set-prize', prize.trim())
                  setEditing(false)
                }}
                className="bg-emerald-500 font-black text-zinc-950 hover:bg-emerald-400"
              >
                <Check className="h-4 w-4" aria-hidden="true" /> Save
              </Button>
            </div>
          ) : (
            <button
              onClick={() => {
                setPrize(state.prize)
                setEditing(true)
              }}
              className="mx-auto flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm font-bold text-zinc-300 hover:border-amber-500/40"
            >
              <Gift className="h-4 w-4 text-amber-400" aria-hidden="true" />
              Grand prize: <span className="text-amber-300">{state.prize}</span>
              <Pencil className="h-3 w-3 text-zinc-500" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* right: live player feed */}
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4">
          <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-300">
            <Users className="h-4 w-4 text-amber-400" aria-hidden="true" /> In the room
          </span>
          <motion.span
            key={state.playerCount}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black tabular-nums text-amber-300"
          >
            {state.playerCount}
          </motion.span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/30 p-3 game-scroll">
          {state.players.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="text-sm font-bold text-zinc-500">Waiting for players…</p>
              <p className="text-xs text-zinc-600">The list fills up live as phones join.</p>
            </div>
          ) : (
            <ul className="grid gap-2">
              {state.players.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  className="flex items-center gap-3 rounded-xl bg-zinc-800/50 px-4 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs font-black text-amber-300">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="truncate text-sm font-bold text-zinc-200">{p.name}</span>
                  {!p.connected && <span className="text-[10px] font-bold uppercase text-zinc-600">offline</span>}
                  <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" aria-label="Connected" />
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-center text-xs font-semibold text-zinc-600">
          Once everyone&apos;s in, hit <span className="font-black text-amber-400">START THE SHOW</span> (or press →)
        </p>
      </div>
    </div>
  )
}
