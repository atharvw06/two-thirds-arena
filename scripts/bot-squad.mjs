/**
 * Bot squad: joins a room and auto-plays.
 * - Guesses a preassigned number when a round opens (once per round).
 * - Votes 'steal' or 'split' if selected as finalist (first bot splits, second steals).
 * Usage: node scripts/bot-squad.mjs ROOM Aarav:33 Isha:22 Neil:14
 */
import { io } from 'socket.io-client'

const [room, ...specs] = process.argv.slice(2)
if (!room || specs.length === 0) {
  console.error('usage: node bot-squad.mjs ROOM Name:guess [Name:guess ...]')
  process.exit(1)
}
const URL = 'http://localhost:3003'
const bots = specs.map((s) => {
  const [name, guess] = s.split(':')
  return { name, guess: Number(guess), voteIndex: null }
})

bots.forEach((bot, i) => {
  const s = io(URL, { path: '/', transports: ['websocket'], forceNew: true })
  let myId = null
  const guessed = new Set()
  s.on('connect', () => {
    s.emit('player:hello', { code: room, name: bot.name })
  })
  s.on('player:state', (st) => {
    myId = st.you.id
    if (/^r\d_open$/.test(st.phase) && st.you.canPlayNow && !guessed.has(st.round)) {
      guessed.add(st.round)
      setTimeout(() => {
        s.emit('player:guess', { guess: bot.guess })
        console.log(`${bot.name} guessed ${bot.guess} (round ${st.round})`)
      }, 400 + Math.random() * 1200)
    }
    if (st.phase === 'finale_vote' && st.you.isFinalist && st.you.yourChoice == null) {
      const split = i % 2 === 0 // first bot splits, others steal
      setTimeout(() => {
        s.emit('player:finale:choice', { choice: split ? 'split' : 'steal' })
        console.log(`${bot.name} chose ${split ? 'split' : 'steal'}`)
      }, 800)
    }
  })
  s.on('join:error', (e) => console.error(`${bot.name} join error: ${e.message}`))
  console.log(`bot spawned: ${bot.name} (guess ${bot.guess})`)
})

setInterval(() => {}, 10000)
