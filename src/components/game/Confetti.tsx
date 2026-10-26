'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#fbbf24', '#34d399', '#fb7185', '#f472b6', '#e4e4e7', '#fdba74']

/** Lightweight confetti burst — no external deps, framer-motion powered. */
export function Confetti({ count = 90, active = true }: { count?: number; active?: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.9,
        duration: 2.4 + Math.random() * 2.2,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 720 - 360,
        drift: (Math.random() - 0.5) * 18,
      })),
    [count]
  )

  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-4%] block rounded-[2px]"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 1.5, backgroundColor: p.color }}
          initial={{ y: 0, x: 0, opacity: 0, rotate: 0 }}
          animate={{ y: '108vh', x: p.drift, opacity: [0, 1, 1, 0.9], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
