import { io } from 'socket.io-client'

const URL = 'http://localhost:3003'

const tryVariant = (label, opts) =>
  new Promise((resolve) => {
    const s = io(URL, { ...opts, forceNew: true, timeout: 5000, reconnection: false })
    const t = setTimeout(() => {
      console.log(`${label}: TIMEOUT/FAIL (connected=${s.connected})`)
      s.disconnect()
      resolve()
    }, 5000)
    s.on('connect', () => {
      clearTimeout(t)
      console.log(`${label}: CONNECTED (transport=${s.io.engine.transport.name})`)
      s.emit('host:hello', {})
      s.on('host:state', (st) => {
        console.log(`  ${label}: got host:state code=${st.code} phase=${st.phase}`)
        s.disconnect()
        resolve()
      })
    })
    s.on('connect_error', (e) => {
      clearTimeout(t)
      console.log(`${label}: connect_error ${e.message}`)
      s.disconnect()
      resolve()
    })
  })

await tryVariant('path-/', { path: '/', transports: ['websocket'] })
await tryVariant('url-query', { transports: ['websocket'] /* io('http://localhost:3003/?XTransformPort=3003') style */ })
await tryVariant('url-with-query', undefined)
// variant 3: pass URL with query instead
{
  const s = io(`${URL}/?XTransformPort=3003`, { transports: ['websocket'], forceNew: true, timeout: 5000, reconnection: false })
  await new Promise((resolve) => {
    const t = setTimeout(() => {
      console.log(`url-/?XTransformPort: TIMEOUT (connected=${s.connected})`)
      s.disconnect()
      resolve()
    }, 5000)
    s.on('connect', () => {
      clearTimeout(t)
      console.log(`url-/?XTransformPort: CONNECTED`)
      s.disconnect()
      resolve()
    })
    s.on('connect_error', (e) => {
      clearTimeout(t)
      console.log(`url-/?XTransformPort: connect_error ${e.message}`)
      s.disconnect()
      resolve()
    })
  })
}
process.exit(0)
