import { spawn } from 'child_process'

export function startTunnel(port = 3000, onUrl) {
  const ssh = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=30',
    '-R', `80:localhost:${port}`,
    'nokey@localhost.run'
  ])

  let urlFound = false

  ssh.stdout.on('data', (data) => {
    const text = data.toString()
    const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/)
    if (match && !urlFound) {
      urlFound = true
      onUrl(match[0])
    }
  })

  ssh.stderr.on('data', (data) => {
    const text = data.toString()
    const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/)
    if (match && !urlFound) {
      urlFound = true
      onUrl(match[0])
    }
  })

  ssh.on('close', (code) => {
    console.log(`[Tunnel] SSH connection closed (${code})`)
  })

  return ssh
}
