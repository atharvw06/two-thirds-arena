#!/usr/bin/env bash
# Restart the Two-Thirds Arena game service (mini-services/game-service, port 3003).
# - Fully detached via setsid so it survives the shell session that launched it.
# - Runs plain `bun index.ts` (no --hot): deterministic behavior, no surprise
#   mid-session reloads. Note: `bun --hot` was observed NOT applying edits to
#   already-registered socket handlers, so a restart is required after any
#   code change either way.
set -e
cd "$(dirname "$0")/../mini-services/game-service"

# stop any existing instance (match both plain and --hot invocations)
pkill -f "bun --hot index.ts" 2>/dev/null || true
pkill -f "bun index.ts" 2>/dev/null || true
sleep 1

setsid nohup bun index.ts >> game-service.log 2>&1 < /dev/null &
sleep 2

PID=$(pgrep -f "bun index.ts" | head -1 || true)
if [ -n "$PID" ]; then
  echo "game-service running (pid $PID), port 3003"
else
  echo "FAILED to start — check mini-services/game-service/game-service.log" >&2
  exit 1
fi
