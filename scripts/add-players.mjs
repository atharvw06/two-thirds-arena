/** Adds simulated players to an existing room so the UI has real data. */
import { io } from 'socket.io-client'

const code = process.argv[2]
const names = (process.argv[3] ?? 'Priya,Kabir,Sana').split(',')
const URL = 'http://localhost:3003'

for (const name of names) {
  const s = io(URL, { path: '/', transports: ['websocket'], forceNew: true })
  await new Promise((res) => s.on('connect', res))
  s.emit('player:hello', { code, name })
  await new Promise((r) => setTimeout(r, 250))
  console.log(`joined: ${name}`)
  // keep socket open — do NOT disconnect
}
console.log('all players in, staying connected')
// keep process alive
setInterval(() => {}, 10000)
