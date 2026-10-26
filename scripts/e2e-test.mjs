/**
 * E2E test for Two-Thirds Arena game service.
 * Simulates: 1 host + 5 players through a complete game session.
 * Run: node scripts/e2e-test.mjs   (from /home/z/my-project)
 */
import { io } from 'socket.io-client'

const URL = 'http://localhost:3003'
const results = []
const check = (name, cond, extra = '') => {
  results.push({ name, ok: !!cond })
  console.log(`${cond ? '  PASS' : '! FAIL'} ${name}${extra ? '  [' + extra + ']' : ''}`)
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function client() {
  return io(URL, { path: '/', transports: ['websocket'], forceNew: true, timeout: 8000 })
}
function nextEvent(socket, event, emitFn, timeout = 6000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting ${event}`)), timeout)
    socket.once(event, (d) => {
      clearTimeout(t)
      resolve(d)
    })
    if (emitFn) emitFn()
  })
}

let failures = 0
let host = null
let players = []
try {
  // ---------- host creates room ----------
  host = client()
  const hostState0 = await nextEvent(host, 'host:state', () => host.emit('host:hello', {}))
  check('host room created', /^[A-Z0-9]{4}$/.test(hostState0.code), `code=${hostState0.code}`)
  check('initial phase lobby', hostState0.phase === 'lobby')
  const code = hostState0.code

  let latestHost = hostState0
  host.on('host:state', (s) => {
    latestHost = s
  })

  // ---------- bad room code ----------
  const stray = client()
  const joinErr = await nextEvent(stray, 'join:error', () => stray.emit('player:hello', { code: 'ZZZZ', name: 'Ghost' }))
  check('bad room rejected', /Room not found/i.test(joinErr.message ?? ''))
  stray.disconnect()

  // ---------- players join ----------
  const NAMES = ['Ananya', 'Rahul', 'Meera', 'Dev', 'Zara']
  players = NAMES.map((n) => ({ socket: client(), name: n, state: null, last: null }))
  for (const p of players) {
    p.socket.on('player:state', (s) => {
      p.state = s
    })
    const st = await nextEvent(p.socket, 'player:state', () => p.socket.emit('player:hello', { code, name: p.name }))
    check(`player ${p.name} joined`, st.you.name === p.name && st.code === code)
  }
  check('host sees 5 players', latestHost.playerCount === 5, `count=${latestHost.playerCount}`)
  check('players see 5 in room', players[0].state.playerCount === 5)

  // ---------- disconnect / reconnect ----------
  players[4].socket.disconnect()
  await wait(400)
  check('disconnected player flagged', latestHost.players.find((p) => p.name === 'Zara')?.connected === false)
  const zaraId = latestHost.players.find((p) => p.name === 'Zara')?.id
  const reSocket = client()
  const reState = await nextEvent(reSocket, 'player:state', () =>
    reSocket.emit('player:hello', { code, playerId: zaraId })
  )
  check('reconnect restores identity', reState.you.name === 'Zara' && reState.you.id === zaraId)
  players[4].socket = reSocket
  reSocket.on('player:state', (s) => {
    players[4].state = s
  })
  await wait(300)
  check('reconnected player online', latestHost.players.find((p) => p.name === 'Zara')?.connected === true)

  // ---------- prize setting ----------
  host.emit('host:action', { action: 'set-prize', value: 'Chocolate Box' })
  await wait(250)
  check('prize updated', latestHost.prize === 'Chocolate Box', latestHost.prize)

  // ---------- start show ----------
  const advance = async (n = 1) => {
    for (let i = 0; i < n; i++) {
      host.emit('host:action', { action: 'next' })
      await wait(220)
    }
  }
  await advance(2) // howto -> r1_open
  check('phase r1_open', latestHost.phase === 'r1_open', latestHost.phase)
  check('eligible count 5', latestHost.eligibleCount === 5, `n=${latestHost.eligibleCount}`)
  check('player can play now', players[0].state.you.canPlayNow === true)

  // ---------- round 1 guesses ----------
  const G1 = [33, 22, 50, 0, 66]
  let maxSubmitted = 0
  const trackMax = () => {
    if (latestHost.submittedCount > maxSubmitted) maxSubmitted = latestHost.submittedCount
  }
  for (let i = 0; i < players.length; i++) {
    players[i].socket.emit('player:guess', { guess: G1[i] })
    await wait(130)
    trackMax()
  }
  check('submitted count tracks', maxSubmitted === 4, `max seen ${maxSubmitted}/5 (5th triggers reveal)`)
  await wait(800) // auto-reveal
  check('auto-reveal fired', latestHost.phase === 'r1_reveal', latestHost.phase)

  const expMean1 = G1.reduce((a, b) => a + b, 0) / 5
  const expTarget1 = (expMean1 * 2) / 3
  const r1 = latestHost.results[1]
  check('r1 mean correct', Math.abs(r1.mean - expMean1) < 0.011, `${r1.mean} ≈ ${expMean1}`)
  check('r1 target = 2/3 mean', Math.abs(r1.target - expTarget1) < 0.011, `${r1.target} ≈ ${expTarget1}`)
  check('r1 winner = Rahul (22)', r1.winners.length === 1 && r1.winners[0].name === 'Rahul', r1.winners.map((w) => `${w.name}:${w.guess}`).join(','))
  const rahulPts1 = r1.points[players[1].state.you.id]
  check('r1 winner points 123', rahulPts1 === 123, `got ${rahulPts1}`)
  check('player sees own result', players[1].state.result?.youWon === true && players[1].state.result?.yourPoints === 123)
  check('player total updated', players[1].state.you.totalScore === 123)

  // ---------- round 2 ----------
  await advance(2) // r1_debrief -> r2_open
  check('phase r2_open', latestHost.phase === 'r2_open')
  const G2 = [20, 15, 8, 0, 30]
  for (let i = 0; i < players.length; i++) {
    players[i].socket.emit('player:guess', { guess: G2[i] })
    await wait(130)
  }
  await wait(800)
  check('r2 revealed', latestHost.phase === 'r2_reveal', latestHost.phase)
  const r2 = latestHost.results[2]
  const expMean2 = G2.reduce((a, b) => a + b, 0) / 5
  check('r2 mean correct', Math.abs(r2.mean - expMean2) < 0.011, `${r2.mean} ≈ ${expMean2}`)
  check('r2 winner = Meera (8)', r2.winners[0].name === 'Meera', r2.winners.map((w) => `${w.name}:${w.guess}`).join(','))

  // ---------- round 3 ----------
  await advance(2)
  check('phase r3_open', latestHost.phase === 'r3_open')
  const G3 = [10, 5, 8, 0, 2]
  for (let i = 0; i < players.length; i++) {
    players[i].socket.emit('player:guess', { guess: G3[i] })
    await wait(130)
  }
  await wait(800)
  check('r3 revealed', latestHost.phase === 'r3_reveal')
  const r3 = latestHost.results[3]
  check('r3 winner = Zara (2)', r3.winners[0].name === 'Zara')

  // expected totals: Rahul 309, Meera 259, Ananya 246, Dev 228, Zara 195
  const totals = {}
  for (const p of players) totals[p.name] = p.state.you.totalScore
  check('total Rahul 309', totals.Rahul === 309, `got ${totals.Rahul}`)
  check('total Meera 259', totals.Meera === 259, `got ${totals.Meera}`)
  check('total Ananya 246', totals.Ananya === 246, `got ${totals.Ananya}`)
  check('total Dev 228', totals.Dev === 228, `got ${totals.Dev}`)
  check('total Zara 195', totals.Zara === 195, `got ${totals.Zara}`)

  // ---------- leaderboard + finale ----------
  await advance(2) // r3_debrief -> leaderboard
  check('leaderboard phase', latestHost.phase === 'leaderboard')
  const fin = latestHost.finale.finalists
  check('finalists = Rahul & Meera', fin.length === 2 && fin[0].name === 'Rahul' && fin[1].name === 'Meera', fin.map((f) => f.name).join(','))

  await advance(2) // finale_intro -> finale_vote
  check('finale_vote phase', latestHost.phase === 'finale_vote')
  check('finalist flags set', players[1].state.you.isFinalist === true && players[2].state.you.isFinalist === true)
  check('non-finalist excluded', players[0].state.you.isFinalist === false)

  // audience tries to vote -> ignored
  players[0].socket.emit('player:finale:choice', { choice: 'steal' })
  await wait(300)
  check('audience vote ignored', latestHost.phase === 'finale_vote')

  // Rahul splits, Meera steals
  players[1].socket.emit('player:finale:choice', { choice: 'split' })
  await wait(300)
  check('still voting until both in', latestHost.phase === 'finale_vote')
  players[2].socket.emit('player:finale:choice', { choice: 'steal' })
  await wait(600)
  check('auto finale reveal', latestHost.phase === 'finale_reveal', latestHost.phase)
  check('outcome one-steals', latestHost.finale.outcome === 'one-steals', latestHost.finale.outcome)
  check('stealer is Meera', latestHost.finale.stealerId === players[2].state.you.id)
  check('host sees choices at reveal', latestHost.finale.choices[players[1].state.you.id] === 'split')

  // ---------- wrap + restart flow ----------
  await advance(3) // finale_debrief -> wrap
  check('wrap phase', latestHost.phase === 'wrap')
  check('player wrap view', players[0].state.phase === 'wrap' && players[0].state.leaderboard.myRank === 3, `rank=${players[0].state.leaderboard.myRank}`)

  // ---------- back navigation: reopen round 3 ----------
  for (let i = 0; i < 8; i++) {
    host.emit('host:action', { action: 'back' })
    await wait(180)
  }
  check('back to r3_open', latestHost.phase === 'r3_open', latestHost.phase)
  check('r3 guesses cleared', latestHost.submittedCount === 0 && latestHost.eligibleCount === 5, `${latestHost.submittedCount}/${latestHost.eligibleCount}`)
  const rahulAfterReopen = latestHost.players.find((p) => p.name === 'Rahul').totalScore
  check('r3 points reverted on reopen', rahulAfterReopen === 212, `Rahul ${rahulAfterReopen} (309-97)`)

  // re-reveal via skip-timer
  host.emit('host:action', { action: 'skip-timer' })
  await wait(500)
  check('skip-timer reveals empty round', latestHost.phase === 'r3_reveal' && latestHost.results[3].n === 0)

  // ---------- soft restart ----------
  host.emit('host:action', { action: 'restart' })
  await wait(400)
  check('restart back to lobby', latestHost.phase === 'lobby')
  check('restart keeps players', latestHost.playerCount === 5)
  check('restart zeroes scores', latestHost.players.every((p) => p.totalScore === 0))
  check('players still connected', players[0].state.phase === 'lobby')
} catch (err) {
  failures++
  console.error('! ERROR', err.message)
}

// summary
for (const p of players) {
  try {
    p.socket.disconnect()
  } catch {}
}
try {
  host.disconnect()
} catch {}
const failed = results.filter((r) => !r.ok)
console.log(`\n===== ${results.length - failed.length}/${results.length} passed =====`)
process.exit(failed.length > 0 || failures > 0 ? 1 : 0)
