'use client'

import { motion } from 'framer-motion'
import { fmtNum, type RoundResult } from './types'

const BIN_SIZE = 5
const BINS = 21 // 0-4, 5-9, ... 95-100

function binOf(guess: number) {
  return Math.min(BINS - 1, Math.floor(guess / BIN_SIZE))
}

/**
 * Animated SVG histogram of the class's guesses.
 * `marks` renders labelled vertical markers (e.g. level-k ladder, mean, target).
 */
export function Histogram({
  result,
  height = 300,
  compact = false,
  marks = [],
  title,
}: {
  result: RoundResult | null
  height?: number
  compact?: boolean
  marks?: { at: number; label: string; color: 'amber' | 'emerald' | 'rose' | 'zinc' }[]
  title?: string
}) {
  if (!result || result.n === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-zinc-800 text-sm font-semibold text-zinc-500"
        style={{ height }}
      >
        No guesses this round
      </div>
    )
  }

  const counts = new Array(BINS).fill(0) as number[]
  const winnerIds = new Set(result.winners.map((w) => w.id))
  const winnerBins = new Set<number>()
  for (const g of result.guesses) {
    const b = binOf(g.guess)
    counts[b]++
    if (winnerIds.has(g.id)) winnerBins.add(b)
  }
  const maxCount = Math.max(...counts, 1)
  const W = 1000
  const H = 400
  const padL = 8
  const padR = 8
  const padT = 46
  const padB = 40
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const barW = plotW / BINS

  const xOf = (v: number) => padL + (v / 100) * plotW
  const colorOf = { amber: '#fbbf24', emerald: '#34d399', rose: '#fb7185', zinc: '#a1a1aa' }

  return (
    <figure className="w-full">
      {title && (
        <figcaption className="mb-2 text-center text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
          {title}
        </figcaption>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }} role="img" aria-label="Histogram of guesses">
        {/* horizontal gridlines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={padL} x2={W - padR} y1={padT + plotH * (1 - f)} y2={padT + plotH * (1 - f)} stroke="#27272a" strokeWidth={1} strokeDasharray="4 8" />
        ))}

        {/* bars */}
        {counts.map((c, i) => {
          const h = (c / maxCount) * plotH
          const hasWinner = winnerBins.has(i)
          return (
            <motion.rect
              key={i}
              x={padL + i * barW + barW * 0.12}
              width={barW * 0.76}
              rx={Math.min(6, barW * 0.3)}
              fill={hasWinner ? '#34d399' : '#fbbf24'}
              opacity={hasWinner ? 0.95 : 0.7}
              initial={{ y: padT + plotH, height: 0 }}
              animate={{ y: padT + plotH - h, height: h }}
              transition={{ delay: 0.05 + i * 0.03, type: 'spring', stiffness: 120, damping: 18 }}
            />
          )
        })}

        {/* count labels on top of non-zero bars */}
        {counts.map((c, i) =>
          c > 0 && !compact ? (
            <motion.text
              key={`t${i}`}
              x={padL + i * barW + barW / 2}
              y={padT + plotH - (c / maxCount) * plotH - 8}
              textAnchor="middle"
              fontSize={22}
              fontWeight={800}
              fill={winnerBins.has(i) ? '#6ee7b7' : '#d4d4d8'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.03 }}
            >
              {c}
            </motion.text>
          ) : null
        )}

        {/* markers (mean / target / level-k) */}
        {marks.map((m, i) => {
          const x = xOf(m.at)
          return (
            <g key={`${m.label}-${i}`}>
              <motion.line
                x1={x}
                x2={x}
                y1={padT - 14}
                y2={padT + plotH}
                stroke={colorOf[m.color]}
                strokeWidth={3}
                strokeDasharray="10 6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.15 }}
              />
              <motion.text
                x={x}
                y={padT - 22}
                textAnchor="middle"
                fontSize={24}
                fontWeight={800}
                fill={colorOf[m.color]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.15 }}
              >
                {m.label}
              </motion.text>
            </g>
          )
        })}

        {/* x axis */}
        <line x1={padL} x2={W - padR} y1={padT + plotH} y2={padT + plotH} stroke="#3f3f46" strokeWidth={2} />
        {[0, 25, 50, 75, 100].map((v) => (
          <text key={v} x={xOf(v)} y={padT + plotH + 32} textAnchor="middle" fontSize={24} fontWeight={700} fill="#71717a">
            {v}
          </text>
        ))}
      </svg>
      <p className="sr-only">
        Mean guess {fmtNum(result.mean)}, two-thirds of mean {fmtNum(result.target)},{' '}
        {result.winners.map((w) => `${w.name} (${w.guess})`).join(', ')} closest.
      </p>
    </figure>
  )
}
