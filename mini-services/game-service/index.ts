import { createServer } from 'http'
import { Server } from 'socket.io'

// ============================================================
// TWO-THIRDS ARENA — Game Theory Game Show Server
// Authoritative game state: rooms, phases, timers, scoring,
// split-or-steal finale resolution.
// ============================================================

// ---------- Types ----------

export type Phase =
  | 'lobby' | 'howto'
  | 'r1_open' | 'r1_reveal' | 'r1_debrief'
  | 'r2_open' | 'r2_reveal' | 'r2_debrief'
  | 'r3_open' | 'r3_reveal' | 'r3_debrief'
  | 'leaderboard' | 'finale_intro' | 'finale_vote' | 'finale_reveal' | 'finale_debrief' | 'wrap'

export type FinaleChoice = 'split' | 'steal'

export const PHASES: Phase[] = [
  'lobby', 'howto',
  'r1_open', 'r1_reveal', 'r1_debrief',
  'r2_open', 'r2_reveal', 'r2_debrief',
  'r3_open', 'r3_reveal', 'r3_debrief',
  'leaderboard', 'finale_intro', 'finale_vote', 'finale_reveal', 'finale_debrief', 'wrap',
]

// 15-minute show pacing: guess windows shrink each round. These are
// ceilings — a round ends early the moment every eligible player locks in.
export const ROUND_SECONDS: Record<number, number> = { 1: 30, 2: 25, 3: 20 }
export const FINALE_SECONDS = 25

interface Player {
  id: string
  name: string
  joinedAt: number
  connected: boolean
  socketId: string | null
  totalScore: number
  guesses: Record<number, number>
  lastPoints: Record<number, number>
  eligibleFrom: number
  isFinalist: boolean
  finaleChoice: FinaleChoice | null
}

interface RoundResult {
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

interface FinaleState {
  finalists: { id: string; name: string; score: number }[]
  choices: Record<string, FinaleChoice>
  outcome: 'both-split' | 'one-steals' | 'both-steal' | null
  stealerId: string | null
}

interface Room {
  code: string
  createdAt: number
  phase: Phase
  phaseEnteredAt: number
  endsAt: number | null
  players: Map<string, Player>
  hostSockets: Set<string>
  results: Record<number, RoundResult>
  finale: FinaleState
  prize: string
  tick: ReturnType<typeof setInterval> | null
  lastActivity: number
}

// ---------- Utilities ----------

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const randomCode = () =>
  Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
const randomId = () => Math.random().toString(36).slice(2, 10)
const cleanName = (raw: unknown) =>
  String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 14)

export function currentRound(phase: Phase): number {
  if (phase.startsWith('r1_')) return 1
  if (phase.startsWith('r2_')) return 2
  if (phase.startsWith('r3_')) return 3
  return 0
}

const roundPhase = (round: number, kind: 'open' | 'reveal' | 'debrief'): Phase =>
  `r${round}_${kind}` as Phase

const rooms = new Map<string, Room>()

function createRoom(): Room {
  let code = randomCode()
  while (rooms.has(code)) code = randomCode()
  const room: Room = {
    code,
    createdAt: Date.now(),
    phase: 'lobby',
    phaseEnteredAt: Date.now(),
    endsAt: null,
    players: new Map(),
    hostSockets: new Set(),
    results: {},
    finale: { finalists: [], choices: {}, outcome: null, stealerId: null },
    prize: 'The Mystery Prize Box',
    tick: null,
    lastActivity: Date.now(),
  }
  rooms.set(code, room)
  return room
}

// ---------- Phase engine ----------

function enterPhase(room: Room, phase: Phase, reason = '') {
  console.log(`[phase] room ${room.code}: ${room.phase} -> ${phase} ${reason ? `(${reason})` : ''} eligible=${[...room.players.values()].filter((p) => p.eligibleFrom <= currentRound(phase) && p.connected).map((p) => `${p.name}${p.connected ? '' : '~'}`).join(',')}`)
  room.phase = phase
  room.phaseEnteredAt = Date.now()
  room.endsAt = null

  if (phase === 'r1_open' || phase === 'r2_open' || phase === 'r3_open') {
    const round = currentRound(phase)
    // Re-opening a round wipes it cleanly (undo any scores from a previous pass)
    const prev = room.results[round]
    if (prev) {
      for (const p of room.players.values()) {
        const pts = prev.points[p.id] ?? 0
        p.totalScore -= pts
        delete p.lastPoints[round]
      }
      delete room.results[round]
    }
    for (const p of room.players.values()) delete p.guesses[round]
    room.endsAt = Date.now() + (ROUND_SECONDS[round] ?? 30) * 1000
  }

  if (phase === 'r1_reveal' || phase === 'r2_reveal' || phase === 'r3_reveal') {
    const round = currentRound(phase)
    if (!room.results[round]) computeRoundResult(room, round)
  }

  if (phase === 'leaderboard') {
    computeFinalists(room)
  }

  if (phase === 'finale_vote') {
    room.finale.choices = {}
    for (const p of room.players.values()) p.finaleChoice = null
    room.endsAt = Date.now() + FINALE_SECONDS * 1000
  }

  if (phase === 'finale_reveal') {
    resolveFinale(room)
  }

  ensureTick(room)
  broadcast(room)
}

function computeRoundResult(room: Room, round: number) {
  const players = [...room.players.values()].filter((p) => p.eligibleFrom <= round)
  const entries = players
    .filter((p) => typeof p.guesses[round] === 'number')
    .map((p) => ({ id: p.id, name: p.name, guess: p.guesses[round] }))

  const result: RoundResult = {
    round,
    n: entries.length,
    guesses: entries,
    mean: 0,
    target: 0,
    min: 0,
    max: 0,
    winners: [],
    points: {},
    diffs: {},
  }
  if (entries.length === 0) {
    room.results[round] = result
    return
  }

  const sum = entries.reduce((s, e) => s + e.guess, 0)
  const mean = sum / entries.length
  const target = (mean * 2) / 3
  result.mean = Math.round(mean * 100) / 100
  result.target = Math.round(target * 100) / 100
  result.min = Math.min(...entries.map((e) => e.guess))
  result.max = Math.max(...entries.map((e) => e.guess))

  let minDiff = Infinity
  for (const e of entries) {
    const diff = Math.abs(e.guess - target)
    result.diffs[e.id] = Math.round(diff * 100) / 100
    if (diff < minDiff - 1e-9) minDiff = diff
  }
  for (const e of entries) {
    if (Math.abs(Math.abs(e.guess - target) - minDiff) < 1e-9) result.winners.push(e)
  }

  for (const e of entries) {
    const diff = result.diffs[e.id]
    const isWinner = result.winners.some((w) => w.id === e.id)
    const base = Math.max(0, Math.round(100 * (1 - diff / 50)))
    const pts = base + (isWinner ? 25 : 0)
    result.points[e.id] = pts
    const p = room.players.get(e.id)
    if (p) {
      p.totalScore += pts
      p.lastPoints[round] = pts
    }
  }
  room.results[round] = result
}

function computeFinalists(room: Room) {
  const ranked = [...room.players.values()].sort(
    (a, b) => b.totalScore - a.totalScore || a.joinedAt - b.joinedAt
  )
  for (const p of room.players.values()) p.isFinalist = false
  const finalists = ranked.slice(0, 2).map((p) => ({ id: p.id, name: p.name, score: p.totalScore }))
  for (const f of finalists) {
    const p = room.players.get(f.id)
    if (p) p.isFinalist = true
  }
  room.finale.finalists = finalists
  room.finale.choices = {}
  room.finale.outcome = null
  room.finale.stealerId = null
}

function resolveFinale(room: Room) {
  const { finalists } = room.finale
  for (const f of finalists) {
    if (!room.finale.choices[f.id]) room.finale.choices[f.id] = 'split'
    const p = room.players.get(f.id)
    if (p && !p.finaleChoice) p.finaleChoice = room.finale.choices[f.id]
  }
  const choices = finalists.map((f) => room.finale.choices[f.id] ?? 'split')
  if (choices[0] === 'split' && choices[1] === 'split') {
    room.finale.outcome = 'both-split'
    room.finale.stealerId = null
  } else if (choices[0] === 'steal' && choices[1] === 'steal') {
    room.finale.outcome = 'both-steal'
    room.finale.stealerId = null
  } else {
    room.finale.outcome = 'one-steals'
    room.finale.stealerId = choices[0] === 'steal' ? finalists[0].id : finalists[1].id
  }
}

// ---------- Broadcast (role-filtered state) ----------

type PublicPlayer = { id: string; name: string; connected: boolean; totalScore: number; isFinalist: boolean }

function buildHostState(room: Room) {
  const round = currentRound(room.phase)
  const isOpen = room.phase === 'r1_open' || room.phase === 'r2_open' || room.phase === 'r3_open'
  let submittedCount = 0
  let eligibleCount = 0
  if (isOpen) {
    for (const p of room.players.values()) {
      if (p.eligibleFrom <= round) {
        eligibleCount++
        if (typeof p.guesses[round] === 'number') submittedCount++
      }
    }
  }
  const players: PublicPlayer[] = [...room.players.values()]
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .map((p) => ({
      id: p.id,
      name: p.name,
      connected: p.connected,
      totalScore: p.totalScore,
      isFinalist: p.isFinalist,
    }))
  const choicesVisible = room.phase === 'finale_reveal' || room.phase === 'finale_debrief' || room.phase === 'wrap'
  return {
    role: 'host' as const,
    code: room.code,
    phase: room.phase,
    phaseIndex: PHASES.indexOf(room.phase),
    totalPhases: PHASES.length,
    endsAt: room.endsAt,
    prize: room.prize,
    playerCount: room.players.size,
    submittedCount,
    eligibleCount,
    round,
    players,
    results: room.results,
    finale: {
      finalists: room.finale.finalists,
      outcome: room.finale.outcome,
      stealerId: room.finale.stealerId,
      choices: choicesVisible ? room.finale.choices : {},
    },
  }
}

function buildPlayerState(room: Room, player: Player) {
  const round = currentRound(room.phase)
  const isOpen = room.phase === 'r1_open' || room.phase === 'r2_open' || room.phase === 'r3_open'
  const isOpenRoundOf = (r: number) => room.phase === roundPhase(r, 'open')
  const isRevealOrAfter = (r: number) => {
    const idx = PHASES.indexOf(room.phase)
    return idx >= PHASES.indexOf(roundPhase(r, 'reveal'))
  }

  let submittedCount = 0
  let eligibleCount = 0
  if (isOpen) {
    for (const p of room.players.values()) {
      if (p.eligibleFrom <= round) {
        eligibleCount++
        if (typeof p.guesses[round] === 'number') submittedCount++
      }
    }
  }

  const result = room.results[round]
  const myResult =
    result && isRevealOrAfter(round)
      ? {
          round,
          n: result.n,
          mean: result.mean,
          target: result.target,
          winners: result.winners,
          yourGuess: player.guesses[round] ?? null,
          yourDiff: result.diffs[player.id] ?? null,
          yourPoints: result.points[player.id] ?? 0,
          youWon: result.winners.some((w) => w.id === player.id),
        }
      : null

  const ranked = [...room.players.values()].sort(
    (a, b) => b.totalScore - a.totalScore || a.joinedAt - b.joinedAt
  )
  const myRank = ranked.findIndex((p) => p.id === player.id) + 1
  const top5 = ranked.slice(0, 5).map((p, i) => ({ rank: i + 1, name: p.name, score: p.totalScore }))

  const finaleVisible = room.phase === 'finale_reveal' || room.phase === 'finale_debrief' || room.phase === 'wrap'
  return {
    role: 'player' as const,
    code: room.code,
    phase: room.phase,
    round,
    endsAt: room.endsAt,
    prize: room.prize,
    playerCount: room.players.size,
    submittedCount,
    eligibleCount,
    you: {
      id: player.id,
      name: player.name,
      totalScore: player.totalScore,
      eligibleForRound: isOpenRoundOf(round) ? player.eligibleFrom <= round : true,
      canPlayNow: isOpenRoundOf(round) && player.eligibleFrom <= round,
      yourGuess: isOpenRoundOf(round) ? (player.guesses[round] ?? null) : null,
      isFinalist: player.isFinalist,
      yourChoice: player.finaleChoice, // own choice is always visible to self
    },
    result: myResult,
    leaderboard: { myRank: myRank || null, top: top5 },
    finale: {
      finalists: room.finale.finalists,
      outcome: room.finale.outcome,
      stealerId: room.finale.stealerId,
      choices: finaleVisible ? room.finale.choices : {},
    },
  }
}

function broadcast(room: Room) {
  room.lastActivity = Date.now()
  const hostState = buildHostState(room)
  for (const sid of room.hostSockets) io.to(sid).emit('host:state', hostState)
  for (const p of room.players.values()) {
    if (p.socketId) io.to(p.socketId).emit('player:state', buildPlayerState(room, p))
  }
}

// ---------- Tick loop (timers + GC) ----------

function ensureTick(room: Room) {
  if (room.tick) return
  room.tick = setInterval(() => {
    const now = Date.now()
    const isOpen = room.phase === 'r1_open' || room.phase === 'r2_open' || room.phase === 'r3_open'
    if (isOpen && room.endsAt && now >= room.endsAt) {
      enterPhase(room, roundPhase(currentRound(room.phase), 'reveal'), 'timer-expired')
      return
    }
    if (room.phase === 'finale_vote' && room.endsAt && now >= room.endsAt) {
      enterPhase(room, 'finale_reveal', 'finale-timer')
      return
    }
    if (
      room.hostSockets.size === 0 &&
      ![...room.players.values()].some((p) => p.connected) &&
      now - room.lastActivity > 30 * 60 * 1000
    ) {
      destroyRoom(room)
    }
  }, 1000)
}

function destroyRoom(room: Room) {
  if (room.tick) clearInterval(room.tick)
  rooms.delete(room.code)
}

// ---------- Socket wiring ----------

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }))
  }
})

const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

io.on('connection', (socket) => {
  let hostRoom: Room | null = null
  let playerRoom: Room | null = null

  socket.on('host:hello', (data: { code?: string }) => {
    const code = String(data?.code ?? '').toUpperCase().trim()
    let room = code ? rooms.get(code) : undefined
    if (!room) room = createRoom()
    if (hostRoom && hostRoom !== room) hostRoom.hostSockets.delete(socket.id)
    hostRoom = room
    room.hostSockets.add(socket.id)
    room.lastActivity = Date.now()
    ensureTick(room)
    socket.emit('host:state', buildHostState(room))
    console.log(`[host] attached to room ${room.code} (${room.players.size} players)`)
  })

  socket.on('player:hello', (data: { code?: string; playerId?: string; name?: string }) => {
    const code = String(data?.code ?? '').toUpperCase().trim()
    const room = rooms.get(code)
    if (!room) {
      socket.emit('join:error', { message: 'Room not found. Check the code on the big screen.' })
      return
    }
    const existing = data?.playerId ? room.players.get(String(data.playerId)) : undefined
    if (existing) {
      if (playerRoom && playerRoom !== room) {
        const prev = playerRoom.players.get(String(data.playerId))
        if (prev && prev.socketId === socket.id) prev.socketId = null
      }
      existing.connected = true
      existing.socketId = socket.id
    } else {
      const name = cleanName(data?.name)
      if (!name) {
        socket.emit('join:error', { message: 'Enter a nickname to join.' })
        return
      }
      if (room.players.size >= 120) {
        socket.emit('join:error', { message: 'This room is full.' })
        return
      }
      const roundNow = currentRound(room.phase)
      const isOpenPhase = room.phase === 'r1_open' || room.phase === 'r2_open' || room.phase === 'r3_open'
      const player: Player = {
        id: randomId(),
        name,
        joinedAt: Date.now(),
        connected: true,
        socketId: socket.id,
        totalScore: 0,
        guesses: {},
        lastPoints: {},
        eligibleFrom: isOpenPhase ? roundNow : roundNow + 1,
        isFinalist: false,
        finaleChoice: null,
      }
      room.players.set(player.id, player)
      console.log(`[player] ${name} joined room ${room.code} (${room.players.size} total)`)
    }
    playerRoom = room
    room.lastActivity = Date.now()
    ensureTick(room)
    broadcast(room)
  })

  socket.on('player:guess', (data: { guess?: number }) => {
    const room = playerRoom
    if (!room) return
    const player = [...room.players.values()].find((p) => p.socketId === socket.id)
    if (!player) return
    const round = currentRound(room.phase)
    if (room.phase !== roundPhase(round, 'open') || round === 0) return
    if (player.eligibleFrom > round) return
    const guess = Number(data?.guess)
    if (!Number.isFinite(guess) || guess < 0 || guess > 100) return
    player.guesses[round] = Math.round(guess * 100) / 100
    room.lastActivity = Date.now()

    // Auto-reveal once every eligible, connected player has locked in
    const eligible = [...room.players.values()].filter(
      (p) => p.eligibleFrom <= round && p.connected
    )
    const allIn = eligible.length > 0 && eligible.every((p) => typeof p.guesses[round] === 'number')
    if (allIn) {
      enterPhase(room, roundPhase(round, 'reveal'), 'all-eligible-in')
    } else {
      broadcast(room)
    }
  })

  socket.on('player:finale:choice', (data: { choice?: FinaleChoice }) => {
    const room = playerRoom
    if (!room || room.phase !== 'finale_vote') return
    const player = [...room.players.values()].find((p) => p.socketId === socket.id)
    if (!player || !player.isFinalist) return
    const choice = data?.choice
    if (choice !== 'split' && choice !== 'steal') return
    player.finaleChoice = choice
    room.finale.choices[player.id] = choice
    room.lastActivity = Date.now()

    const bothIn = room.finale.finalists.every((f) => room.finale.choices[f.id])
    if (bothIn && room.finale.finalists.length === 2) {
      enterPhase(room, 'finale_reveal', 'both-finalists-in')
    } else {
      broadcast(room)
    }
  })

  socket.on('host:action', (data: { action?: string; value?: string }) => {
    const room = hostRoom
    if (!room) return
    const action = String(data?.action ?? '')
    const idx = PHASES.indexOf(room.phase)
    room.lastActivity = Date.now()

    if (action === 'next' && idx < PHASES.length - 1) {
      enterPhase(room, PHASES[idx + 1])
    } else if (action === 'back' && idx > 0) {
      enterPhase(room, PHASES[idx - 1])
    } else if (action === 'skip-timer') {
      if (room.endsAt) {
        room.endsAt = Date.now() - 1
        const isOpen = room.phase === 'r1_open' || room.phase === 'r2_open' || room.phase === 'r3_open'
        if (isOpen) enterPhase(room, roundPhase(currentRound(room.phase), 'reveal'), 'host-skip-timer')
        else if (room.phase === 'finale_vote') enterPhase(room, 'finale_reveal', 'host-skip-timer')
      }
    } else if (action === 'set-prize') {
      const prize = String(data?.value ?? '').trim().slice(0, 40)
      if (prize) room.prize = prize
      broadcast(room)
    } else if (action === 'restart') {
      // Soft reset: keep players, wipe scores and game data, back to lobby
      for (const p of room.players.values()) {
        p.totalScore = 0
        p.guesses = {}
        p.lastPoints = {}
        p.isFinalist = false
        p.finaleChoice = null
      }
      room.results = {}
      room.finale = { finalists: [], choices: {}, outcome: null, stealerId: null }
      room.phase = 'lobby'
      room.phaseEnteredAt = Date.now()
      room.endsAt = null
      broadcast(room)
      console.log(`[host] room ${room.code} restarted (players kept)`)
    } else if (action === 'reset') {
      // Hard wipe: everyone must rejoin (new class)
      const code = room.code
      destroyRoom(room)
      const fresh = createRoom()
      // keep same code for convenience
      rooms.delete(fresh.code)
      fresh.code = code
      rooms.set(code, fresh)
      for (const sid of room.hostSockets) fresh.hostSockets.add(sid)
      fresh.lastActivity = Date.now()
      ensureTick(fresh)
      for (const p of room.players.values()) {
        if (p.socketId) io.to(p.socketId).emit('room:reset', {})
      }
      hostRoom = fresh
      socket.emit('host:state', buildHostState(fresh))
      console.log(`[host] room ${code} fully reset`)
    }
  })

  socket.on('disconnect', () => {
    if (hostRoom) {
      hostRoom.hostSockets.delete(socket.id)
      hostRoom.lastActivity = Date.now()
    }
    if (playerRoom) {
      const player = [...playerRoom.players.values()].find((p) => p.socketId === socket.id)
      if (player) {
        player.connected = false
        player.socketId = null
        broadcast(playerRoom)
      }
    }
    console.log(`[socket] disconnected ${socket.id}`)
  })

  socket.on('error', (err) => console.error(`[socket error] ${socket.id}:`, err))
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Two-Thirds Arena game service running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  for (const room of rooms.values()) destroyRoom(room)
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  for (const room of rooms.values()) destroyRoom(room)
  httpServer.close(() => process.exit(0))
})
