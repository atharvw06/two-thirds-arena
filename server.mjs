import { createServer } from 'http'
import next from 'next'
import { Server } from 'socket.io'
import os from 'os'
import { startTunnel } from './scripts/tunnel.mjs'

let currentPublicUrl = null

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

function getLocalIp() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// ============================================================
// TWO-THIRDS ARENA — Game Theory Live Engine (Unified Server)
// 15-Minute Streamlined Presenter Flow + Hybrid Audience Fallback
// ============================================================

export const PHASES = [
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

export const ROUND_SECONDS = { 1: 60, 2: 45 }
export const FINALE_SECONDS = 35

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const randomCode = () =>
  Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
const randomId = () => Math.random().toString(36).slice(2, 10)
const cleanName = (raw) => String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 14)

export function currentRound(phase) {
  if (phase.startsWith('r1_')) return 1
  if (phase.startsWith('r2_')) return 2
  return 0
}

const rooms = new Map()

function createRoom() {
  let code = randomCode()
  while (rooms.has(code)) code = randomCode()
  const room = {
    code,
    createdAt: Date.now(),
    phase: 'lobby',
    phaseEnteredAt: Date.now(),
    endsAt: null,
    players: new Map(),
    hostSockets: new Set(),
    results: {},
    finale: { finalists: [], choices: {}, outcome: null, stealerId: null },
    prize: 'The Grand Mystery Box',
    tick: null,
    lastActivity: Date.now(),
  }
  rooms.set(code, room)
  return room
}

function enterPhase(room, phase, reason = '') {
  room.phase = phase
  room.phaseEnteredAt = Date.now()
  room.endsAt = null

  if (phase === 'r1_open' || phase === 'r2_open') {
    const round = currentRound(phase)
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

  if (phase === 'r1_reveal' || phase === 'r2_reveal') {
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

function computeRoundResult(room, round) {
  const players = [...room.players.values()]
  const entries = players
    .filter((p) => typeof p.guesses[round] === 'number')
    .map((p) => ({ id: p.id, name: p.name, guess: p.guesses[round] }))

  const result = {
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

function computeFinalists(room) {
  const ranked = [...room.players.values()].sort(
    (a, b) => b.totalScore - a.totalScore || a.joinedAt - b.joinedAt
  )
  for (const p of room.players.values()) p.isFinalist = false
  const finalists = ranked.slice(0, 2).map((p) => ({ id: p.id, name: p.name, score: p.totalScore }))
  if (finalists.length < 2) {
    // Ensure we have at least 2 finalists for demo
    if (finalists.length === 0) {
      finalists.push({ id: 'f1', name: 'Player 1', score: 120 })
      finalists.push({ id: 'f2', name: 'Player 2', score: 95 })
    } else if (finalists.length === 1) {
      finalists.push({ id: 'f2', name: 'Challenger', score: Math.max(0, finalists[0].score - 15) })
    }
  }
  for (const f of finalists) {
    const p = room.players.get(f.id)
    if (p) p.isFinalist = true
  }
  room.finale.finalists = finalists
  room.finale.choices = {}
  room.finale.outcome = null
  room.finale.stealerId = null
}

function resolveFinale(room) {
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

function ensureTick(room) {
  if (room.tick) {
    clearInterval(room.tick)
    room.tick = null
  }
  const timed = room.endsAt !== null
  if (!timed) return

  room.tick = setInterval(() => {
    if (!room.endsAt) return
    const remaining = room.endsAt - Date.now()
    if (remaining <= 0) {
      if (room.phase === 'r1_open') enterPhase(room, 'r1_reveal', 'timer expired')
      else if (phaseIsOpenRound(room.phase)) {
        const next = getNextPhase(room.phase)
        if (next) enterPhase(room, next, 'timer expired')
      } else if (room.phase === 'finale_vote') {
        enterPhase(room, 'finale_reveal', 'finale timer expired')
      }
    }
  }, 500)
}

function phaseIsOpenRound(phase) {
  return phase === 'r1_open' || phase === 'r2_open'
}

function getNextPhase(curr) {
  const i = PHASES.indexOf(curr)
  return i >= 0 && i < PHASES.length - 1 ? PHASES[i + 1] : null
}

function getPrevPhase(curr) {
  const i = PHASES.indexOf(curr)
  return i > 0 ? PHASES[i - 1] : null
}

function maybeAutoAdvance(room) {
  if (phaseIsOpenRound(room.phase)) {
    const round = currentRound(room.phase)
    const eligible = [...room.players.values()].filter((p) => p.eligibleFrom <= round && p.connected)
    if (eligible.length > 0 && eligible.every((p) => typeof p.guesses[round] === 'number')) {
      const next = getNextPhase(room.phase)
      if (next) enterPhase(room, next, 'all eligible players submitted')
    }
  } else if (room.phase === 'finale_vote') {
    const { finalists } = room.finale
    const allDone = finalists.length === 2 && finalists.every((f) => room.finale.choices[f.id])
    if (allDone) {
      enterPhase(room, 'finale_reveal', 'both finalists locked in')
    }
  }
}

// ---------- State Broadcasts ----------

function buildHostState(room) {
  const round = currentRound(room.phase)
  const isOpen = phaseIsOpenRound(room.phase)
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
  const players = [...room.players.values()]
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .map((p) => ({
      id: p.id,
      name: p.name,
      connected: p.connected,
      totalScore: p.totalScore,
      isFinalist: p.isFinalist,
    }))
  return {
    role: 'host',
    code: room.code,
    localIp: getLocalIp(),
    publicUrl: currentPublicUrl,
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
    finale: room.finale,
  }
}

function buildPlayerState(room, player) {
  const round = currentRound(room.phase)
  const isOpen = phaseIsOpenRound(room.phase)
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
  const eligibleForRound = true
  const canPlayNow = isOpen
  const lastResult = room.results[round] ?? null
  const youWon = lastResult?.winners.some((w) => w.id === player.id) ?? false

  const ranked = [...room.players.values()].sort((a, b) => b.totalScore - a.totalScore)
  const myRank = ranked.findIndex((p) => p.id === player.id) + 1
  const top = ranked.slice(0, 5).map((p, idx) => ({ rank: idx + 1, name: p.name, score: p.totalScore }))

  return {
    role: 'player',
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
      eligibleForRound,
      canPlayNow,
      yourGuess: player.guesses[round] ?? null,
      isFinalist: player.isFinalist,
      yourChoice: player.finaleChoice,
    },
    result: lastResult
      ? {
          round: lastResult.round,
          n: lastResult.n,
          mean: lastResult.mean,
          target: lastResult.target,
          winners: lastResult.winners,
          yourGuess: player.guesses[lastResult.round] ?? null,
          yourDiff: lastResult.diffs[player.id] ?? null,
          yourPoints: lastResult.points[player.id] ?? 0,
          youWon,
        }
      : null,
    leaderboard: { myRank: myRank || null, top },
    finale: room.finale,
  }
}

let ioInstance = null

function broadcast(room) {
  if (!ioInstance) return
  const hostPayload = buildHostState(room)
  for (const sid of room.hostSockets) ioInstance.to(sid).emit('host:state', hostPayload)
  for (const p of room.players.values()) {
    if (p.socketId) ioInstance.to(p.socketId).emit('player:state', buildPlayerState(room, p))
  }
}

// Helper: Seed realistic bot players
function addBotCohort(room, count = 10) {
  const botNames = ['Aarav', 'Isha', 'Rohan', 'Ananya', 'Vikram', 'Meera', 'Kabir', 'Tanvi', 'Siddharth', 'Pooja', 'Rahul', 'Sneha']
  const targetCount = Math.min(count, botNames.length)
  for (let i = 0; i < targetCount; i++) {
    const id = 'bot_' + randomId()
    const name = botNames[i]
    if ([...room.players.values()].some(p => p.name === name)) continue
    const p = {
      id,
      name,
      joinedAt: Date.now() + i * 100,
      connected: true,
      socketId: null,
      totalScore: 0,
      guesses: {},
      lastPoints: {},
      eligibleFrom: 1,
      isFinalist: false,
      finaleChoice: null,
    }
    room.players.set(id, p)
  }
  broadcast(room)
}

// Helper: Auto-populate bot guesses for current round based on level-k distribution
function autoSubmitBotGuesses(room, round) {
  for (const p of room.players.values()) {
    if (p.socketId !== null) continue // Only auto-guess for bots
    if (typeof p.guesses[round] === 'number') continue
    // Realistic level-k distribution:
    // 35% Level-0 (approx 45-60)
    // 45% Level-1 (approx 28-36)
    // 20% Level-2 (approx 18-24)
    let guess = 33
    const rand = Math.random()
    if (round === 1) {
      if (rand < 0.35) guess = Math.round(40 + Math.random() * 25)
      else if (rand < 0.8) guess = Math.round(28 + Math.random() * 10)
      else guess = Math.round(18 + Math.random() * 8)
    } else {
      // In round 2, distribution shifts lower
      if (rand < 0.2) guess = Math.round(30 + Math.random() * 10)
      else if (rand < 0.65) guess = Math.round(18 + Math.random() * 9)
      else guess = Math.round(8 + Math.random() * 10)
    }
    p.guesses[round] = guess
  }
}

// ============================================================
// Server Initialization
// ============================================================

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server, {
    path: '/socket.io',
    cors: { origin: '*' },
  })
  ioInstance = io

  io.on('connection', (socket) => {
    let boundRoom = null
    let boundPlayer = null
    let isHost = false

    socket.on('host:hello', (data) => {
      let code = cleanName(data?.code).toUpperCase()
      let room = code ? rooms.get(code) : null
      if (!room) {
        room = createRoom()
      }
      isHost = true
      boundRoom = room
      room.hostSockets.add(socket.id)
      socket.emit('host:state', buildHostState(room))
    })

    socket.on('host:action', ({ action, value }) => {
      if (!boundRoom || !isHost) return
      const room = boundRoom

      if (action === 'start') {
        enterPhase(room, 'howto', 'start button')
      } else if (action === 'next') {
        const next = getNextPhase(room.phase)
        if (next) {
          // If entering an open round and we have bots, auto-submit bot guesses
          if (next === 'r1_open' || next === 'r2_open') {
            enterPhase(room, next, 'host next')
            autoSubmitBotGuesses(room, currentRound(next))
          } else {
            enterPhase(room, next, 'host next')
          }
        }
      } else if (action === 'back') {
        const prev = getPrevPhase(room.phase)
        if (prev) enterPhase(room, prev, 'host back')
      } else if (action === 'skip' || action === 'skip-timer') {
        // Skip current timer directly
        if (room.phase === 'r1_open') {
          autoSubmitBotGuesses(room, 1)
          enterPhase(room, 'r1_reveal', 'host skip')
        } else if (room.phase === 'r2_open') {
          autoSubmitBotGuesses(room, 2)
          enterPhase(room, 'r2_reveal', 'host skip')
        } else if (room.phase === 'finale_vote') {
          enterPhase(room, 'finale_reveal', 'host skip')
        }
      } else if (action === 'quick_bots') {
        addBotCohort(room, 10)
      } else if (action === 'add_sample') {
        const round = currentRound(room.phase)
        if (round > 0) {
          autoSubmitBotGuesses(room, round)
          broadcast(room)
          maybeAutoAdvance(room)
        }
      } else if ((action === 'set_prize' || action === 'set-prize') && typeof value === 'string') {
        room.prize = cleanName(value) || 'Mystery Prize'
        broadcast(room)
      } else if (action === 'encore' || action === 'restart') {
        // Reset game scores while keeping players
        for (const p of room.players.values()) {
          p.totalScore = 0
          p.guesses = {}
          p.lastPoints = {}
          p.isFinalist = false
          p.finaleChoice = null
        }
        room.results = {}
        room.finale = { finalists: [], choices: {}, outcome: null, stealerId: null }
        enterPhase(room, 'lobby', 'encore reset')
      } else if (action === 'force_vote' && value) {
        // value format: "id:choice"
        const [fId, choice] = value.split(':')
        if (fId && (choice === 'split' || choice === 'steal')) {
          room.finale.choices[fId] = choice
          broadcast(room)
          maybeAutoAdvance(room)
        }
      }
    })

    socket.on('player:hello', ({ code, name, playerId }) => {
      const room = rooms.get(String(code || '').toUpperCase().trim())
      if (!room) {
        socket.emit('join:error', { message: 'Room not found. Check the projector screen!' })
        return
      }

      let player = playerId ? room.players.get(playerId) : null
      if (player) {
        player.connected = true
        player.socketId = socket.id
      } else {
        const cName = cleanName(name)
        if (!cName) {
          socket.emit('join:error', { message: 'Please enter a valid nickname.' })
          return
        }
        const id = randomId()
        player = {
          id,
          name: cName,
          joinedAt: Date.now(),
          connected: true,
          socketId: socket.id,
          totalScore: 0,
          guesses: {},
          lastPoints: {},
          eligibleFrom: currentRound(room.phase) || 1,
          isFinalist: false,
          finaleChoice: null,
        }
        room.players.set(id, player)
      }

      boundRoom = room
      boundPlayer = player
      broadcast(room)
      socket.emit('player:state', buildPlayerState(room, player))
    })

    socket.on('player:guess', ({ guess }) => {
      if (!boundRoom || !boundPlayer) return
      const round = currentRound(boundRoom.phase)
      if (!phaseIsOpenRound(boundRoom.phase)) return
      const g = Math.min(100, Math.max(0, Number(guess)))
      if (!Number.isFinite(g)) return
      boundPlayer.eligibleFrom = 1
      boundPlayer.guesses[round] = Math.round(g * 100) / 100
      broadcast(boundRoom)
      maybeAutoAdvance(boundRoom)
    })

    socket.on('player:finale', ({ choice }) => {
      if (!boundRoom || !boundPlayer || boundRoom.phase !== 'finale_vote') return
      if (choice !== 'split' && choice !== 'steal') return
      boundPlayer.finaleChoice = choice
      boundRoom.finale.choices[boundPlayer.id] = choice
      broadcast(boundRoom)
      maybeAutoAdvance(boundRoom)
    })

    socket.on('disconnect', () => {
      if (isHost && boundRoom) {
        boundRoom.hostSockets.delete(socket.id)
      } else if (boundPlayer && boundRoom) {
        boundPlayer.connected = false
        boundPlayer.socketId = null
        broadcast(boundRoom)
      }
    })
  })

  // Get local network IPv4 address
  let localIp = 'localhost'
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address
        break
      }
    }
  }

  server.listen(port, () => {
    console.log(`
========================================================================
🎉 TWO-THIRDS ARENA: GAME SHOW ENGINE READY!
========================================================================
💻 Projector / Host Screen  : http://localhost:${port}/?host=1
📱 Local Wi-Fi Student URL  : http://${localIp}:${port}
========================================================================
`)

    if (process.argv.includes('--online') || process.env.ONLINE === '1') {
      console.log(`[Online Mode] Establishing secure public internet link...`)
      startTunnel(port, (url) => {
        currentPublicUrl = url
        console.log(`
========================================================================
🌐 PUBLIC INTERNET LINK ACTIVE!
========================================================================
📱 Student Public URL : ${url}
💻 Projector Screen   : http://localhost:${port}/?host=1
========================================================================
👉 Anyone on ANY Wi-Fi or Mobile Data (Jio/Airtel 5G) can join!
👉 The QR Code on your projector screen has automatically updated!
========================================================================
`)
        for (const room of rooms.values()) {
          broadcast(room)
        }
      })
    }
  })
})
