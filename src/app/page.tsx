'use client'

import dynamic from 'next/dynamic'

// The arena is a fully client-side, real-time app (sockets + localStorage),
// so it is loaded with SSR disabled to keep behavior deterministic.
const GameApp = dynamic(
  () => import('@/components/game/GameApp').then((m) => m.GameApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-amber-400"
          role="status"
          aria-label="Loading Two-Thirds Arena"
        />
      </div>
    ),
  }
)

export default function Page() {
  return <GameApp />
}
