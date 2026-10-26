# Project Worklog

---
Task ID: 1
Agent: Z.ai (main agent)
Task: Build "Two-Thirds Arena" — a live game-theory game show web app (phone-play + projector host) for a class presentation on Utility Theory, Sequential Decision Problems, and Game Theory Concepts.

Work Log:
- Clarified requirements via AskUserQuestion: phone-play format (Kahoot-style), Guess-⅔-of-average game, 20–50 students, 20–30 min slot, phones + WiFi OK, balanced theory depth with live-data debriefs, real prizes, solo play + top-2 Split/Steal finale.
- Initialized fullstack environment (Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui); installed socket.io-client + qrcode.react in main app; created mini-services/game-service (bun project, socket.io, port 3003).
- Built game server (`mini-services/game-service/index.ts`): room management (4-char codes), 17-phase state machine (lobby → howto → 3×rounds(open/reveal/debrief) → leaderboard → finale(intro/vote/reveal/debrief) → wrap), 45s round timers + 40s finale timer with auto-transitions, auto-reveal when all eligible+connected players submit, scoring (distance-decay + winner bonus, hand-verified), finalist selection, Split/Steal resolution (both-split/one-steals/both-steal), soft restart (encore) + hard reset, disconnect/reconnect via playerId, role-filtered state broadcasts (host vs player payloads, choices hidden until reveal).
- Built frontend (single `/` route, client-only via next/dynamic ssr:false):
  - Landing (join/host), PlayerView (phone: join w/ QR-prefilled code, guess UI slider+input+lock w/ change-until-deadline, per-phase screens, finale voting buttons), HostView (projector: lobby w/ giant room code + QR + live player feed + editable prize, howto, round screens w/ countdown ring + progress, animated SVG histogram w/ level-k/mean/target markers, three data-driven debrief slides (Level-K ladder / Number Spiral with iterated dominance + backward-induction link / Nash Trap with Keynes quote + bounded rationality), leaderboard, finale drama screens w/ confetti, payoff-matrix utility-theory debrief, wrap), bottom control bar (back/next/skip-timer/reset, phase dots), keyboard nav (arrows/PgUp/PgDn for presenter clickers).
- Fixed 8 lint errors (React 19 strict rules): useSyncExternalStore for socket status, lazy state init instead of effects, dynamic ssr:false page shell, 2 parse bugs (missing brace, unclosed quote).
- Wrote E2E simulation (`scripts/e2e-test.mjs`): host + 5 players, full session incl. reconnect, bad-room rejection, exact scoring math, finale outcomes, back-nav score reversion, skip-timer, restart — **58/58 passed**.
- Browser-verified via agent-browser through the Caddy gateway (port 81): landing, host lobby w/ QR + live feed, player join, guess + auto-reveal, all debriefs, leaderboard, finale (Isha stole it all), payoff debrief, wrap; mobile viewport (390×844) phone screens; keyboard navigation; zero console/page errors; 22 screenshots saved to download/screenshots/.
- Added refresh-proof host mode (localStorage) after observing reload drops to landing.
- Added `[phase]` transition logging w/ reasons to the game service for classroom debugging.

Stage Summary:
- Deliverable: production-ready live game show app. Preview: https://preview-<bot-id>.space-z.ai/ (host via "HOST ON PROJECTOR" or ?host=1; students join via ?room=CODE / QR).
- Architecture: Next.js app (port 3000) + socket.io game service (mini-service, port 3003) behind Caddy gateway w/ XTransformPort routing; all state in-memory on the socket service.
- Game design: 3 rounds of Guess-⅔-of-average → level-k / iterated dominance / Nash debriefs built from the class's own live data → leaderboard → top-2 Split-or-Steal finale for a real prize → utility-theory payoff-matrix debrief → wrap. Maps to the user's syllabus (utility theory, sequential decision problems via backward-induction link, game theory concepts).
- Quality: lint clean, 58/58 E2E, browser-verified end-to-end incl. mobile, zero console errors, all screenshots archived.
- Scripts kept for reuse: scripts/e2e-test.mjs, scripts/bot-squad.mjs (auto-playing bots for rehearsal), scripts/add-players.mjs, scripts/probe-socket.mjs.

---
Task ID: 2
Agent: Z.ai (main agent)
Task: Compress the Two-Thirds Arena session to a 15-minute format (user request: "LIMIT THIS GAME TO 15 MINS").

Work Log:
- Mapped the timing surface: service ROUND_SECONDS=45 (all rounds) + FINALE_SECONDS=40; hardcoded totalMs={45000}/{40000} in host RoundOpen/Finale; player TimerBar + CountdownRing had fixed 10s urgency thresholds.
- Retuned pacing (ceilings only — auto-reveal still fires the moment every eligible player locks in):
  - Round windows now shrink for pace: R1 45→30s, R2 45→25s, R3 45→20s; finale vote 40→25s.
  - Service: ROUND_SECONDS is now a per-round Record; room.endsAt uses per-round lookup.
  - Client: mirrored ROUND_SECONDS/FINALE_SECONDS in src/components/game/types.ts; host CountdownRings derive totalMs from the constants; PlayerView TimerBar takes totalMs; urgency (red) is proportional (last third of the window, clamped 4–10s) in both TimerBar and CountdownRing; CountdownRing default totalMs 45000→30000.
  - Howto screen copy announces the pace ("30, 25, then 20 seconds on the clock").
- Extended scripts/e2e-test.mjs with 4 timer-window assertions (r1 30s / r2 25s / r3 20s / finale 25s).
- Found `bun --hot` did NOT apply the constant edit to the live service (old 40s window still served; nohup'd restart also died with the shell). Added scripts/restart-game-service.sh: pkill old instance + setsid-detached plain `bun index.ts` (no --hot → deterministic for the live event, survives shell exit). Service now persists across sessions.
- E2E: 62/62 passed. ESLint clean on all 6 changed files. Next dev compiled with zero errors.
- Browser-verified via gateway (port 81): new howto copy, host ring counts down from 30, phone TimerBar live, submit→auto-reveal→scoring correct (92 pts for guess 50), timer-expiry auto-advance, full-wipe reset, zero console/page errors. Screenshots: 05-howto-15min.png, 06-round1-open-15min.png, 22-phone-guess-ui-15min.png, 08-round1-reveal-15min.png.

Stage Summary:
- Full session now fits 15 minutes: ~2 min join + ~1 min rules + ~6.5 min three rounds w/ debriefs + ~45s leaderboard + ~2.5 min finale + ~1.5 min wrap ≈ 14 min with buffer. All pedagogy (level-k, spiral, Nash trap, payoff matrix) retained.
- Timer ceilings: 30/25/20s rounds, 25s finale vote; host SKIP TIMER remains the safety valve if running behind.
- Ops note: after ANY future edit to mini-services/game-service/index.ts, run `bash scripts/restart-game-service.sh` (bun --hot is unreliable for this service — it kept serving stale constants).
