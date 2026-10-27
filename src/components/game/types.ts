// Shared client-side type mirrors of the game engine state payloads.

export type Phase =
  | 'lobby'
  | 'howto'
  | 'r1_open'
  | 'r1_reveal'
  | 'r1_debrief'
  | 'r2_open'
  | 'r2_reveal'
  | 'r2_debrief'
  | 'leaderboard'
  | 'finale_intro'
  | 'finale_vote'
  | 'finale_reveal'
  | 'finale_debrief'
  | 'wrap'

export type FinaleChoice = 'split' | 'steal'
export type FinaleOutcome = 'both-split' | 'one-steals' | 'both-steal'

export const PHASES: Phase[] = [
  'lobby',
  'howto',
  'r1_open',
  'r1_reveal',
  'r1_debrief',
  'r2_open',
  'r2_reveal',
  'r2_debrief',
  'leaderboard',
  'finale_intro',
  'finale_vote',
  'finale_reveal',
  'finale_debrief',
  'wrap',
]

export const ROUND_SECONDS: Record<number, number> = { 1: 30, 2: 25 }
export const FINALE_SECONDS = 25

export const PHASE_LABELS: Record<Phase, string> = {
  lobby: 'Lobby · Join Room',
  howto: 'How To Play & Purpose',
  r1_open: 'Round 1 · Intuition',
  r1_reveal: 'Round 1 · The Spread',
  r1_debrief: 'Round 1 · Level-K Ladder',
  r2_open: 'Round 2 · The Spiral',
  r2_reveal: 'Round 2 · Convergence',
  r2_debrief: 'Round 2 · Nash Trap',
  leaderboard: 'Finalists Showdown',
  finale_intro: 'Finale · Split or Steal',
  finale_vote: 'Finale · Voting',
  finale_reveal: 'Finale · Reveal',
  finale_debrief: 'Finale · Utility Matrix',
  wrap: 'Grand Takeaways',
}

export const roundOfPhase = (phase: Phase): number =>
  phase.startsWith('r1_') ? 1 : phase.startsWith('r2_') ? 2 : 0

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
  localIp?: string
  publicUrl?: string
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
