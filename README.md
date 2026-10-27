# Two-Thirds Arena — 15-Minute Game Theory Presentation & Activity

> **Live Classroom Experiment:** Guess ⅔ of the Average + Split or Steal Finale  
> **Team (5 Presenters):** Saraswati (MC), Anushka (Tech & Mechanics), Aditi (Behavioral Theory: R1), Visesh (Mathematical Equilibrium: R2), Atharv (Floor & Utility Theory: Finale)

---

## 🚀 How to Run the Game (1-Click Start)

### On Windows:
Double-click:
```text
START_GAME.bat
```
*(This starts the server and automatically opens `http://localhost:3000/?host=1` in your browser).*

### On Mac / Linux:
Run in terminal:
```bash
./START_GAME.sh
```

---

## 📂 Key Files in this Folder

1. **`START_GAME.bat`**: The 1-click launcher to run the game on presentation day.
2. **`PRESENTATION_SCRIPT.md`**: Complete word-for-word spoken presentation script for all 5 team members with stage directions.
3. **`explaination.md`**: Detailed explanation of game concepts, rules, scoring math, and why we are playing.
4. **`server.mjs`**: The unified Node.js game service and Next.js server (runs everything on port 3000).

---

## 🎯 How the 15-Minute Presentation Works

* **Lobby (0:00–2:00):** Saraswati hooks the room; Atharv circulates with QR code; students join. *(If Wi-Fi is slow, click `+ Quick Add Demo Players`).*
* **Round 1 (2:00–5:30):** Anushka explains rules & runs 30s guess $\rightarrow$ Live Histogram $\rightarrow$ Aditi explains Level-$k$ thinking ($L_0 \approx 50 \rightarrow L_1 \approx 33 \rightarrow L_2 \approx 22$).
* **Round 2 (5:30–8:30):** 25s guess $\rightarrow$ Average crashes $\rightarrow$ Visesh explains the Number Spiral, Nash Equilibrium at 0, and Bounded Rationality.
* **Leaderboard (8:30–9:15):** Top 2 finalists step forward; Atharv interviews them on stage.
* **Split or Steal (9:15–12:30):** 25s secret vote $\rightarrow$ Confetti reveal $\rightarrow$ Visesh explains Prisoner's Dilemma matrix; Atharv explains Utility Theory ($U \neq \text{Money}$).
* **Wrap (12:30–15:00):** All 5 presenters deliver core takeaways; open for professor questions.
