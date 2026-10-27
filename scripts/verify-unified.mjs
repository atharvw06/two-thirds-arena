import { io } from 'socket.io-client'

const URL = 'http://localhost:3000'
console.log('Connecting to host on', URL)

const hostSocket = io(URL, { path: '/socket.io', transports: ['websocket'] })

hostSocket.on('connect', () => {
  console.log('Host socket connected!')
  hostSocket.emit('host:hello', {})
})

hostSocket.on('host:state', (state) => {
  console.log(`[Host State] Phase: ${state.phase}, Room: ${state.code}, Players: ${state.playerCount}`)
  
  if (state.phase === 'lobby') {
    if (state.playerCount === 0) {
      console.log('Triggering quick_bots...')
      hostSocket.emit('host:action', { action: 'quick_bots' })
    } else {
      console.log('Advancing from lobby to howto...')
      hostSocket.emit('host:action', { action: 'next' })
    }
  } else if (state.phase === 'howto') {
    console.log('Advancing from howto to r1_open...')
    hostSocket.emit('host:action', { action: 'next' })
  } else if (state.phase === 'r1_open') {
    console.log(`Round 1 open! Submissions: ${state.submittedCount}/${state.eligibleCount}`)
    // Bot guesses are auto-submitted, but let's wait 1s then skip timer or let it reveal
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'skip' })
    }, 1200)
  } else if (state.phase === 'r1_reveal') {
    const r1 = state.results[1]
    console.log(`Round 1 revealed! Mean: ${r1?.mean}, Target: ${r1?.target}, Winners: ${r1?.winners?.map(w => w.name).join(', ')}`)
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'next' })
    }, 800)
  } else if (state.phase === 'r1_debrief') {
    console.log('Round 1 debrief displayed! Advancing to r2_open...')
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'next' })
    }, 800)
  } else if (state.phase === 'r2_open') {
    console.log('Round 2 open! Skipping to reveal...')
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'skip' })
    }, 1200)
  } else if (state.phase === 'r2_reveal') {
    console.log('Round 2 revealed! Advancing to r2_debrief...')
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'next' })
    }, 800)
  } else if (state.phase === 'r2_debrief') {
    console.log('Round 2 debrief displayed! Advancing to leaderboard...')
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'next' })
    }, 800)
  } else if (state.phase === 'leaderboard') {
    console.log(`Leaderboard! Finalists: ${state.finale.finalists.map(f => `${f.name} (${f.score}pts)`).join(', ')}`)
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'next' })
    }, 800)
  } else if (state.phase === 'finale_intro') {
    console.log('Finale intro! Advancing to vote...')
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'next' })
    }, 800)
  } else if (state.phase === 'finale_vote') {
    console.log('Finale vote in progress! Auto-voting split for finalist 1 and steal for finalist 2...')
    const [f1, f2] = state.finale.finalists
    hostSocket.emit('host:action', { action: 'force_vote', value: `${f1.id}:split` })
    hostSocket.emit('host:action', { action: 'force_vote', value: `${f2.id}:steal` })
  } else if (state.phase === 'finale_reveal') {
    console.log(`Finale revealed! Outcome: ${state.finale.outcome}`)
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'next' })
    }, 800)
  } else if (state.phase === 'finale_debrief') {
    console.log('Finale debrief! Advancing to wrap...')
    setTimeout(() => {
      hostSocket.emit('host:action', { action: 'next' })
    }, 800)
  } else if (state.phase === 'wrap') {
    console.log('SUCCESS! REACHED WRAP PHASE CLEANLY!')
    console.log('All 5 streamlined stages verified end-to-end.')
    process.exit(0)
  }
})

hostSocket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message)
  process.exit(1)
})
