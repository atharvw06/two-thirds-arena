// Shared client-side type mirrors of the game service state payloads.

export type Phase =
  | 'lobby' | 'howto'
  | 'r1_open' | 'r1_reveal' | 'r1_debrief'
  | 'r2_open' | 'r2_reveal' | 'r2_debrief'
  | 'r3_open' | 'r3_reveal' | 'r3_debrief'
  | 'leaderboard' | 'finale_intro' | 'finale_vote' | 'finale_reveal' | 'finale_debrief' | 'wrap'

export type FinaleChoice = 'split' | 'steal'
export type FinaleOutcome = 'both-split' | 'one-steals' | 'both-steal'

export const PHASES: Phase[] = [
  'lobby', 'howto',
  'r1_open', 'r1_reveal', 'r1_debrief',
  'r2_open', 'r2_reveal', 'r2_debrief',
  'r3_open', 'r3_reveal', 'r3_debrief',
  'leaderboard', 'finale_intro', 'finale_vote', 'finale_reveal', 'finale_debrief', 'wrap',
]

// Timer ceilings per round — must mirror mini-services/game-service/index.ts.
// The clock is a ceiling: rounds auto-reveal early once everyone locks in.
export const ROUND_SECONDS: Record<number, number> = { 1: 30, 2: 25, 3: 20 }
export const FINALE_SECONDS = 25

export const PHASE_LABELS: Record<Phase, string> = {
  lobby: 'Lobby',
  howto: 'How To Play',
  r1_open: 'Round 1 · Live',
  r1_reveal: 'Round 1 · Reveal',
  r1_debrief: 'Round 1 · Level-K',
  r2_open: 'Round 2 · Live',
  r2_reveal: 'Round 2 · Reveal',
  r2_debrief: 'Round 2 · The Spiral',
  r3_open: 'Round 3 · Live',
  r3_reveal: 'Round 3 · Reveal',
  r3_debrief: 'Round 3 · Nash Trap',
  leaderboard: 'Leaderboard',
  finale_intro: 'Finale · Intro',
  finale_vote: 'Finale · Voting',
  finale_reveal: 'Finale · Reveal',
  finale_debrief: 'Finale · Utility',
  wrap: 'Wrap Up',
}

export const roundOfPhase = (phase: Phase): number =>
  phase.startsWith('r1_') ? 1 : phase.startsWith('r2_') ? 2 : phase.startsWith('r3_') ? 3 : 0

export interface PublicPlayer {
  id: string
  name: string
  connected: boolean
  totalScore: number
  isFinalist: boolean
}

export interface RoundResult {
  round: number
  n: number
  guesses: { id: string; name: string; guess: number }[]
  mean: number
  target: number
  min: number
  max: number
  winners: { id: string; name: string; guess: number }[]
  points: Record<string, number>
  diffs: Record<string, number>
}

export interface HostState {
  role: 'host'
  code: string
  phase: Phase
  phaseIndex: number
  totalPhases: number
  endsAt: number | null
  prize: string
  playerCount: number
  submittedCount: number
  eligibleCount: number
  round: number
  players: PublicPlayer[]
  results: Record<string, RoundResult>
  finale: {
    finalists: { id: string; name: string; score: number }[]
    outcome: FinaleOutcome | null
    stealerId: string | null
    choices: Record<string, FinaleChoice>
  }
}

export interface PlayerState {
  role: 'player'
  code: string
  phase: Phase
  round: number
  endsAt: number | null
  prize: string
  playerCount: number
  submittedCount: number
  eligibleCount: number
  you: {
    id: string
    name: string
    totalScore: number
    eligibleForRound: boolean
    canPlayNow: boolean
    yourGuess: number | null
    isFinalist: boolean
    yourChoice: FinaleChoice | null
  }
  result: {
    round: number
    n: number
    mean: number
    target: number
    winners: { id: string; name: string; guess: number }[]
    yourGuess: number | null
    yourDiff: number | null
    yourPoints: number
    youWon: boolean
  } | null
  leaderboard: {
    myRank: number | null
    top: { rank: number; name: string; score: number }[]
  }
  finale: {
    finalists: { id: string; name: string; score: number }[]
    outcome: FinaleOutcome | null
    stealerId: string | null
    choices: Record<string, FinaleChoice>
  }
}

export const fmtNum = (n: number, dp = 2) =>
  Number.isFinite(n) ? String(Math.round(n * 10 ** dp) / 10 ** dp) : '—'
