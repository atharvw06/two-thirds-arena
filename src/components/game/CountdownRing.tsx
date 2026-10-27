'use client'

import { useEffect, useState } from 'react'

/** Big circular countdown ring driven by an absolute end timestamp + explicit window length. */
export function CountdownRing({
  endsAt,
  totalMs = 30000,
  size = 200,
  stroke = 10,
  label = 'seconds left',
}: {
  endsAt: number | null
  totalMs?: number
  size?: number
  stroke?: number
  label?: string
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!endsAt) return
    const t = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(t)
  }, [endsAt])

  const remaining = endsAt ? Math.max(0, endsAt - now) : 0
  const seconds = Math.ceil(remaining / 1000)
  const windowMs = Math.max(1000, totalMs)
  const frac = endsAt ? Math.min(1, Math.max(0, remaining / windowMs)) : 0

  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  // Urgency scales with the window (last third of the clock, clamped 4–10s)
  const urgentMs = Math.max(4000, Math.min(10000, windowMs / 3))
  const urgent = remaining <= urgentMs

  return (
    <div className="relative inline-flex items-center justify-center" role="timer" aria-label={`${seconds} ${label}`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-zinc-800" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          className={`transition-all duration-200 ${urgent ? 'text-rose-500' : 'text-amber-400'}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-black tabular-nums leading-none ${urgent ? 'text-rose-400' : 'text-zinc-50'}`} style={{ fontSize: size * 0.32 }}>
          {endsAt ? seconds : '—'}
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      </div>
    </div>
  )
}
