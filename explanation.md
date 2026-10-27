# Two-Thirds Arena — Game Explanation & Presentation Rules

> **Activity Name:** Two-Thirds Arena (The ⅔ Beauty Contest & Split-or-Steal Finale)  
> **Topic:** Experimental Game Theory, Strategic Interdependence, Equilibrium, and Utility Theory  
> **Total Time:** 15 Minutes  
> **Platform:** Projector Display + Mobile Phone Play (with Instant 1-Click Fallback)

---

## 1. What is this Game & Why are We Playing It?

### The Core Idea
Most people think game theory is just abstract mathematical formulas on a blackboard. **This activity proves the opposite:** game theory is about anticipating human psychology, social preferences, and what other people believe.

Instead of lecturing with static slides, **the entire classroom becomes a live behavioral economics experiment**:
1. Students play **The ⅔ Beauty Contest** on their phones across two rapid rounds.
2. The laptop instantly charts the class's real guesses on an animated histogram.
3. The data reveals live why "hyper-rational" players who follow textbook math actually lose to players who understand human psychology (**Bounded Rationality**).
4. The top 2 scorers then duel in a live **Split-or-Steal (Prisoner's Dilemma)** showdown for an actual prize, proving that human utility functions contain guilt, fairness, and reputation ($U \neq \text{Money}$).

---

## 2. Complete Game Rules

### How Students Join
1. When the projector displays the **Lobby screen**, students pull out their phones and scan the large QR code (or visit the URL shown on screen).
2. The 4-character room code is prefilled.
3. Students type any nickname and tap **"ENTER THE ARENA"**.
4. Their names appear on the projector screen in real-time.
5. *(Wi-Fi Fallback: If college Wi-Fi is slow, the presenter clicks "+ Quick Add Demo Players" to instantly inject 10 realistic student players).*

---

### Part 1: The ⅔ Guessing Game (Rounds 1 & 2)

#### The Rule
* Every student secretly picks an integer or decimal between **0 and 100** on their phone screen.
* The server computes the exact arithmetic mean (average) of all submitted numbers in the room.
* **The Target** is calculated as:
  $$\text{Target} = \frac{2}{3} \times \text{Classroom Average}$$
* **The Winner:** The player whose guess is closest to the Target wins the round and earns bonus points.

#### Scoring Formula
* **Base Points:** Points decay linearly based on how close your guess was to the target:
  $$\text{Points} = \max\left(0, 100 \times \left(1 - \frac{|\text{Guess} - \text{Target}|}{50}\right)\right)$$
* **Winner Bonus:** The closest guess in the room gets an extra **+25 points**.
* All points accumulate across rounds on the live leaderboard.

---

### Round-by-Round Breakdown

#### Round 1: Pure Intuition (30 Seconds)
* **Goal:** Test instinctive, unprimed human thinking.
* **The Timer:** 30-second countdown ring on projector and phones.
* **The Reveal:** The projector displays a live histogram of all guesses showing the Minimum, Maximum, Classroom Average, Target, and the Round Winner.
* **The Debrief (Level-$k$ Cognitive Ladder):**
  * **Level-0 ($L_0$):** Random guesses or pure gut feel. The center of mass is $\approx 50$.
  * **Level-1 ($L_1$):** Best-response to Level-0:
    $$\frac{2}{3} \times 50 \approx 33.3$$
  * **Level-2 ($L_2$):** Best-response to Level-1:
    $$\frac{2}{3} \times 33.3 \approx 22.2$$
  * **Level-3 ($L_3$):** Best-response to Level-2:
    $$\frac{2}{3} \times 22.2 \approx 14.8$$
  * **The Lesson:** In experimental economics (Rosemarie Nagel, 1995), human groups consistently average around 30 to 40 in Round 1. Real humans operate at Level-1 or Level-2 depth.

---

#### Round 2: The Strategic Spiral (25 Seconds)
* **Goal:** Observe how the room adapts once Level-1 thinking is common knowledge.
* **The Reveal:** Comparative dual histograms show the distribution visibly crashing to the left.
* **The Debrief (Iterated Dominance & The Nash Trap):**
  * **Step 1:** Even if all students picked 100, the maximum target is $\frac{2}{3} \times 100 = 66.7$. Therefore, any guess $>66.7$ is **strictly dominated**—it can never win under any circumstances.
  * **Step 2:** Once rational players eliminate numbers $>66.7$, the highest possible average is $66.7$, so the new target cannot exceed $44.4$.
  * **Step 3 (The Spiral):** Repeating this elimination:
    $$100 \longrightarrow 66.7 \longrightarrow 44.4 \longrightarrow 29.6 \longrightarrow 19.8 \longrightarrow \dots \longrightarrow 0$$
  * **The Nash Equilibrium:** **$0$ is the unique Nash Equilibrium**. If everyone picks 0, target is 0, and no single player can improve by deviating.
  * **The Nash Trap:** If someone actually picked $0$, they lost! Why? Because game theory assumes *infinite common knowledge of rationality*. In reality, humans have **Bounded Rationality** (Herbert Simon). Smart players model the room they actually have, not the theoretical robots in a textbook.

---

### Part 2: The Grand Finale — Split or Steal (Prisoner's Dilemma)

#### How it Works
1. After Round 2, the leaderboard reveals the **Top 2 players** in the class.
2. Both finalists are escorted to the front of the classroom.
3. They are playing for the real **Grand Prize**.
4. Both finalists have 25 seconds to privately choose on their phones: **SPLIT** or **STEAL**.

#### The Payoff Matrix
```
                            FINALIST 2
                       SPLIT           STEAL
                 ┌───────────────┬───────────────┐
          SPLIT  │ Both get 50%  │ Finalist 2:100%│
FINALIST 1       │ (Fair Share)  │ Finalist 1: 0%│
                 ├───────────────┼───────────────┤
          STEAL  │ Finalist 1:100%│ Both get 0%  │
                 │ Finalist 2: 0%│ (Prize Dies)  │
                 └───────────────┴───────────────┘
```

#### Outcome Rules
1. **Both Choose SPLIT:** They share the prize equally ($50\%$ each). Social optimum achieved!
2. **One STEALS, One SPLITS:** The stealer takes the entire prize ($100\%$). The splitter gets nothing.
3. **Both Choose STEAL:** Mutual destruction! Nobody gets anything. The prize is forfeit.

#### The Debrief (Utility Theory & Social Preferences)
* **The Mathematical Paradox:** In money terms, **STEAL is a weakly dominant strategy** (it never does worse than Split). Rational self-interest predicts mutual stealing $(0, 0)$.
* **The Real-Life Insight ($U \neq \text{Money}$):** Why do so many finalists split in real classrooms? Because human utility includes non-monetary variables: **fairness, social guilt, reputation, and peer appraisal**. If the psychological cost of stealing exceeds half the prize, **SPLIT becomes the rational utility-maximizing move**.

---

## 3. Team Responsibilities & Stage Roles

| Member | Title | Exact Responsibilities | Primary Cue Line |
| :--- | :--- | :--- | :--- |
| **Saraswati** | **MC & Host** | • Electrifying room opening & hook<br>• High-energy round winner announcements<br>• Staging the Leaderboard & Finalist drama<br>• Grand outro & professor introduction | *"You aren't guessing a number—you are guessing what this room thinks and undercutting it!"* |
| **Anushka** | **Mechanics & Pacing Anchor** | • Explaining ⅔ rules with numerical examples (60→40, 30→20)<br>• Driving the live countdowns for Rounds 1 & 2<br>• Delivering Closing Takeaway 1<br>• Operating laptop clicker & fallbacks | *"Supposing the class averages 60, what is two-thirds? 40! So 40 wins. Predict the room!"* |
| **Aditi** | **Behavioral Anchor (Level-k)** | • Explaining Keynesian Beauty Contest (1936)<br>• Breaking down the Level-$k$ Ladder ($L_0 \approx 50, L_1 \approx 33, L_2 \approx 22$)<br>• Calling for show of hands & analyzing real class mean<br>• Delivering Closing Takeaway 2 | *"Our room averaged [X], proving this class reasons 1 to 2 steps deep. You're human!"* |
| **Visesh** | **Mathematical Equilibrium Anchor** | • Explaining why numbers $>66.7$ are strictly dominated<br>• Deconstructing the spiral to zero and Herbert Simon's Bounded Rationality<br>• Explaining Prisoner's Dilemma payoff matrix (dominant steal)<br>• Delivering Closing Takeaway 3 | *"Zero is the unique Nash Equilibrium. But if you guessed 0, you lost because real people reason finitely!"* |
| **Atharv** | **Floor Catalyst & Utility Anchor** | • Circulating QR code during onboarding<br>• Live on-stage interrogation of the 2 finalists before voting<br>• Deconstructing Expected Utility Theory ($U \neq \text{Money}$, guilt, reputation)<br>• Delivering Closing Takeaway 4 | *"Utility does not equal money! If the guilt and social cost of betrayal exceeds half a prize, splitting is rational."* |

---

## 4. 15-Minute Timeline Summary

```text
0:00        2:00        3:00        5:30        8:30        9:15       12:30      15:00
┌───────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
│ Lobby &   │ Rules &   │  Round 1  │  Round 2  │Leaderboard│  Finale   │ Takeaways │
│ Join Hook │ Purpose   │+ Level-k  │+ Nash Trap│ Finalists │Split/Steal│   & Q&A   │
└───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘
```

* **0:00 – 2:00:** Students scan QR code; nicknames appear live (Saraswati & Atharv).
* **2:00 – 3:00:** Anushka explains the ⅔ average rule with clear math examples.
* **3:00 – 5:30:** Round 1 (30s) $\rightarrow$ Reveal histogram $\rightarrow$ Aditi explains Level-$k$ reasoning.
* **5:30 – 8:30:** Round 2 (25s) $\rightarrow$ Reveal shift $\rightarrow$ Visesh explains Iterated Dominance, Nash Equilibrium, and Bounded Rationality.
* **8:30 – 9:15:** Leaderboard drumroll $\rightarrow$ Atharv escorts & interrogates top 2 finalists.
* **9:15 – 12:30:** Split or Steal private voting (25s) $\rightarrow$ Dramatic reveal $\rightarrow$ Visesh explains Payoff Matrix; Atharv explains Utility Theory.
* **12:30 – 15:00:** Team delivers the 4 core takeaways; open for professor questions.

---

## 5. Live Presentation Cheat-Sheet & Controls

* **Start the Game:** Run `npm run dev` in PowerShell and open `http://localhost:3000/?host=1` on the projector.
* **Advance Slides:** Press `Right Arrow` (`→`), `Page Down`, or click the amber **NEXT** button.
* **Go Back:** Press `Left Arrow` (`←`).
* **Instant Skip:** Click red **`SKIP TIMER`** if running behind schedule.
* **1-Click Wi-Fi Fallback:**
  * In the Lobby: Click **`+ Quick Add Demo Players`** to add 10 simulated student bots.
  * In Round 1 or 2: Click **`Fill Sample Guesses`** if straggler phones disconnect.
