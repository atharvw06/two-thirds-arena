#!/usr/bin/env bash
echo "========================================================"
echo "  TWO-THIRDS ARENA: GAME SHOW ENGINE"
echo "  A Live 15-Minute Game Theory Presentation & Activity"
echo "========================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] First-time setup: Installing required packages..."
    npm install
fi

echo ""
echo "[INFO] Starting Game Server on port 3000..."
echo "[INFO] Opening Host Screen in your browser..."
echo ""

(sleep 3 && (open "http://localhost:3000/?host=1" 2>/dev/null || xdg-open "http://localhost:3000/?host=1" 2>/dev/null)) &

node server.mjs
