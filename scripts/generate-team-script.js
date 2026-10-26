/**
 * Two-Thirds Arena — Team Presentation & Game Script (.docx)
 * 5 presenters: Saraswati, Anushka, Aditi, Atharv, Visesh
 * Scene: copywriting/hosting script — no cover, no TOC, single section,
 * line 400, Profile B fonts (Calibri), conversational register.
 * Output: /home/z/my-project/download/Two-Thirds-Arena-Team-Script.docx
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  Header, Footer, PageNumber, LevelFormat,
} = require("docx");
const fs = require("fs");

// ---------- Scene palette (copywriting) ----------
const P = {
  primary: "1A1A1A",
  body: "333333",
  secondary: "666666",
  accent: "E85D3A",
  surface: "FFF8F5",
  headerBg: "FBE7DE",
  innerLine: "D0D0D0",
  cueGrey: "999999",
};
const FONT = { ascii: "Calibri", eastAsia: "Microsoft YaHei" };

// ---------- Run builders ----------
const t = (text, extra = {}) => new TextRun({ text, size: 24, color: P.body, font: FONT, ...extra });
const b = (text, extra = {}) => t(text, { bold: true, ...extra });
const ba = (text) => t(text, { bold: true, color: P.accent }); // bold accent (buttons, key terms)

// H1 section heading (14pt, per scene)
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 420, after: 160, line: 322, lineRule: "atLeast" },
    children: [new TextRun({ text, bold: true, size: 28, color: P.primary, font: FONT })],
  });
}
// H2 segment heading (13pt)
function h2(text, time) {
  const kids = [new TextRun({ text, bold: true, size: 26, color: P.primary, font: FONT })];
  if (time) kids.push(new TextRun({ text: "   " + time, bold: true, size: 22, color: P.accent, font: FONT }));
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 100, line: 312 },
    children: kids,
  });
}
// Plain body paragraph (line 400 per scene)
function bodyP(runsOrText, opts = {}) {
  const children = Array.isArray(runsOrText) ? runsOrText : [t(runsOrText)];
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: opts.before ?? 100, after: opts.after ?? 100, line: 400 },
    children,
  });
}
// Verbatim speaker line: bold name + spoken text
function speak(name, runsOrText) {
  const kids = [
    new TextRun({ text: name.toUpperCase() + ":  ", bold: true, size: 24, color: P.primary, font: FONT }),
  ];
  if (Array.isArray(runsOrText)) kids.push(...runsOrText);
  else kids.push(t(runsOrText));
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 140, after: 140, line: 400 },
    children: kids,
  });
}
// Stage / screen direction (grey italic, 10.5pt)
function stage(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80, line: 340 },
    children: [new TextRun({ text, size: 21, color: P.cueGrey, italics: true, font: FONT })],
  });
}
// Action cue (accent, italic) — who does what on the laptop
function cue(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80, line: 340 },
    children: [new TextRun({ text, size: 22, color: P.accent, italics: true, bold: true, font: FONT })],
  });
}
// Small grey note
function note(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 320 },
    children: [new TextRun({ text, size: 20, color: P.secondary, font: FONT })],
  });
}
// Accent divider (paragraph border — never text-character lines)
function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 4 } },
    children: [new TextRun({ text: " ", size: 8, font: FONT })],
  });
}

// Horizontal-only table (scene Profile B)
function cellP(text, bold = false, color = P.body) {
  return new Paragraph({
    spacing: { before: 20, after: 20, line: 300 },
    children: [new TextRun({ text, bold, size: 21, color, font: FONT })],
  });
}
function simpleTable(headers, rows, widths) {
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: P.accent },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: P.accent },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.innerLine },
    insideVertical: { style: BorderStyle.NONE },
  };
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => new TableCell({
      children: [cellP(h, true, P.primary)],
      shading: { type: ShadingType.CLEAR, fill: P.headerBg },
      margins: { top: 70, bottom: 70, left: 120, right: 120 },
      width: { size: widths[i], type: WidthType.PERCENTAGE },
    })),
  });
  const dataRows = rows.map((r, ri) => new TableRow({
    cantSplit: true,
    children: r.map((c, i) => new TableCell({
      children: [cellP(c, false, P.body)],
      shading: ri % 2 === 0 ? { type: ShadingType.CLEAR, fill: P.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
      margins: { top: 70, bottom: 70, left: 120, right: 120 },
      width: { size: widths[i], type: WidthType.PERCENTAGE },
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [headerRow, ...dataRows],
  });
}
// Title paragraph before a table (keepNext)
function tableTitle(text) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, color: P.primary, font: FONT })],
  });
}

// =====================================================================
// TITLE BLOCK (no cover page — script scene)
// =====================================================================
const titleBlock = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60, line: 460, lineRule: "atLeast" },
    children: [new TextRun({ text: "TWO-THIRDS ARENA: HOW LOW WILL YOU GO?", bold: true, size: 36, color: P.primary, font: FONT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60, line: 340 },
    children: [new TextRun({ text: "A Live Game-Theory Experiment — Team Presentation & Game Script", size: 24, color: P.secondary, font: FONT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40, line: 340 },
    children: [new TextRun({ text: "15 minutes  ·  5 presenters  ·  Saraswati · Anushka · Aditi · Atharv · Visesh", bold: true, size: 22, color: P.accent, font: FONT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80, line: 320 },
    children: [new TextRun({ text: "Topic: Game Theory — utility, sequential reasoning, and equilibrium, taught through the class\u2019s own live data", size: 20, color: P.secondary, italics: true, font: FONT })],
  }),
  divider(),
  bodyP([
    t("How to use this document: print one copy per person and highlight your own lines. Everything written in "),
    t("normal text under a presenter\u2019s name is spoken verbatim", { bold: true }),
    t(" — you may paraphrase, but keep the first and last sentences of your segment exactly as written. Lines in "),
    t("grey italics", { italics: true, color: P.cueGrey }),
    t(" are stage directions (what is on screen, where people stand). Lines in "),
    t("orange italics", { italics: true, color: P.accent, bold: true }),
    t(" are action cues for Anushka on the laptop. The game provides the energy; the three debriefs provide the marks. Protect both."),
  ]),
  bodyP([
    t("The promise of this presentation: every single person in the room leaves able to explain, in one sentence each, "),
    ba("level-k thinking"), t(", "), ba("iterated dominance"), t(", "), ba("why zero is the Nash equilibrium"),
    t(", and "), ba("why real people do not play it"), t(". If a professor asks anyone in our team any of those four questions, all five of us can answer. Section 5 of this document guarantees that."),
  ]),
];

// =====================================================================
// SECTION 1 — QUICK FACTS & ROLES
// =====================================================================
const sec1 = [
  h1("1. Quick Facts & Roles"),
  bodyP([
    t("The format is a game-cum-presentation: the class plays three quick rounds of \u201Cguess two-thirds of the average\u201D from their phones, and between rounds we pause the game to walk through what the class\u2019s own numbers just revealed. It closes with the top two players duelling over "),
    t("\u3010prize name\u3011", { bold: true, color: P.accent }),
    t(" in a Split-or-Steal finale — a live prisoner\u2019s dilemma. Total running time is fifteen minutes including buffer. The app, the timers, the scoring and the histograms are already built; our only job is to run it cleanly and talk over it well."),
  ]),
  bodyP([
    t("Grand prize on the line: "), t("\u3010prize name\u3011", { bold: true }),
    t(" — Anushka must edit the prize pill on the lobby screen before the class walks in so the app, the script and the real object all match."),
  ]),
  tableTitle("Who does what"),
  simpleTable(
    ["Presenter", "Role", "You own", "Your one must-do"],
    [
      ["Saraswati", "MC & Host", "Opening hook, rules, transitions, leaderboard hype, finale staging", "Keep energy high and hand off to the next speaker by name"],
      ["Anushka", "Tech & Scorekeeper", "The projector laptop: advancing screens, timers, joins, fixes", "Stay one screen ahead of the script at all times"],
      ["Aditi", "Theory Anchor — Rounds 1–2", "Level-k debrief and the number-spiral debrief", "Land \u201Cthink one level deeper\u201D using the class\u2019s real numbers"],
      ["Atharv", "Theory Anchor — Round 3 + Finale", "Nash equilibrium debrief and the Split/Steal payoff matrix", "Make zero feel inevitable, then explain why nobody picked it"],
      ["Visesh", "Floor Producer", "QR circulation, stragglers, prizes, escorting finalists", "Get every phone in the room joined within 90 seconds"],
    ],
    [16, 24, 34, 26]
  ),
  note("Roles are swappable between rehearsals — what is not swappable is the handoff discipline: every segment ends with the current speaker saying the next speaker\u2019s name."),
  tableTitle("The 15-minute shape of the show"),
  simpleTable(
    ["Clock", "Phase", "Voice", "Screen"],
    [
      ["0:00–1:45", "Hook + everyone joins", "Saraswati, Visesh circulating", "Lobby — room code + QR"],
      ["1:45–2:45", "Rules", "Saraswati", "How-to screen"],
      ["2:45–5:00", "Round 1 (30s) + Level-k debrief", "Saraswati → Aditi", "Round 1 → histogram → level ladder"],
      ["5:00–7:00", "Round 2 (25s) + Spiral debrief", "Aditi", "Round 2 → histogram → spiral"],
      ["7:00–9:00", "Round 3 (20s) + Nash debrief", "Atharv", "Round 3 → histogram → Nash trap"],
      ["9:00–9:45", "Leaderboard drumroll", "Saraswati", "Leaderboard"],
      ["9:45–12:15", "Split-or-Steal finale + payoff matrix", "Saraswati + Atharv", "Finale screens + payoff matrix"],
      ["12:15–14:30", "Wrap: three takeaways", "Visesh, then all five", "Wrap screen"],
      ["14:30–15:00", "Buffer (absorbs overruns / early Q&A)", "All", "Hold on wrap screen"],
    ],
    [16, 34, 24, 26]
  ),
  note("Timer ceilings are 30s, 25s and 20s for the three rounds and 25s for the finale vote — but every phase ends early automatically the moment all players lock in, so the real show usually runs faster than the paper plan."),
];

// =====================================================================
// SECTION 2 — TECH RUNBOOK
// =====================================================================
const sec2 = [
  h1("2. Tech Runbook — Running the Game"),
  bodyP([
    t("This is Anushka\u2019s page, but every presenter should read it once — the fastest way to lose a room is for five people to look blankly at one laptop. The app has two sides: the "),
    b("projector screen"), t(" (what you drive) and the "), b("player phones"), t(" (what the class sees). All game state — players, guesses, scores, timers — lives on the server, so refreshing or even closing the projector screen never loses the game."),
  ]),
  bodyP([
    b("Launch: "), t("on the projector laptop, open the app link and click "), ba("HOST ON PROJECTOR"),
    t(". The lobby appears with a giant four-letter room code and a QR code. That\u2019s the join screen — leave it up while the class settles in. If the browser ever refreshes, host mode restores itself automatically; if it somehow drops to the landing page, just click "),
    ba("HOST ON PROJECTOR"), t(" again and everything comes back."),
  ]),
  bodyP([
    b("Players join: "), t("they scan the QR code (the room code is prefilled), type a nickname, and hit "), ba("ENTER THE ARENA"),
    t(". Their nickname appears live on the big screen — that\u2019s the signal to the room that it\u2019s working. Someone who joins mid-round simply watches that round and is dealt in from the next one automatically; the app handles it, no intervention needed."),
  ]),
  bodyP([
    b("Advancing the show: "), t("the entire presentation runs off one button — "), ba("NEXT"),
    t(" — and the right-arrow key does the same thing, so a normal presenter clicker works perfectly. The left arrow goes back. There are 17 screens in total and the bottom bar shows a row of phase dots so you always know where you are. You will press NEXT roughly ten times in fifteen minutes; the exact moments are marked as orange cues inside the script."),
  ]),
  tableTitle("Host controls — what each one does and when to touch it"),
  simpleTable(
    ["Control", "What it does", "When you use it"],
    [
      ["START THE SHOW", "Lobby → rules screen", "Once, when Saraswati finishes the hook"],
      ["NEXT  /  → key", "Advance one screen", "After each reveal and each debrief — follow the orange cues"],
      ["Previous screen  /  ← key", "Go back one screen (re-opening a round wipes that round\u2019s guesses and scores)", "Only for genuine misclicks — never mid-game otherwise"],
      ["SKIP TIMER", "Ends the current round instantly and reveals", "When we are behind schedule"],
      ["Phase dots (bottom bar)", "Shows which of the 17 screens is live", "Glance anytime you feel lost"],
      ["Reset options → Encore", "Scores wiped, players kept, back to lobby", "If the professor asks for a redo"],
      ["Reset options → Full wipe", "Room destroyed, everyone must rejoin", "Last resort only — a broken room"],
    ],
    [24, 44, 32]
  ),
  bodyP([
    b("Timers run themselves. "), t("Round 1 gives the class 30 seconds, Round 2 gives 25, Round 3 gives 20, and the finale vote gives 25 — the big countdown ring is on the projector and every phone. The moment every connected player locks in, the round reveals instantly without waiting for the clock. During each round, watch the submitted counter (for example \u201C18 / 24\u201D): if it stalls for about ten seconds, that\u2019s Saraswati\u2019s cue to say \u201Cif you haven\u2019t locked in, lock in now.\u201D"),
  ]),
  bodyP([
    b("Scoring, for the curious: "), t("points decay with your distance from the target, and the single closest guess banks an extra 25-point winner bonus. After three rounds the top two players by total score become finalists — the app picks them automatically on the leaderboard screen."),
  ]),
];

// =====================================================================
// SECTION 3 — PRE-SHOW CHECKLIST
// =====================================================================
const sec3 = [
  h1("3. Pre-Show Checklist — T-minus 10 Minutes"),
  bodyP([
    t("Ten minutes before we start, work this list top to bottom. It looks bureaucratic; it is actually the difference between a slick game show and a group of five people apologising to a Wi-Fi network. Every item has an owner — do not silently do someone else\u2019s item, because then nobody\u2019s own item is certain."),
  ]),
  ...[
    ["Anushka — projector: laptop charged and plugged in, app open, click HOST ON PROJECTOR, confirm the room code and QR are huge and readable from the back row.", "preshow"],
    ["Anushka — prize: click the prize pill on the lobby screen and type the real prize so the app matches reality and matches \u3010prize name\u3011 in this script.", "preshow"],
    ["Anushka — clicker: pair the presenter clicker and test → and ← keys advance the host screens once.", "preshow"],
    ["Visesh — room: physical prize placed where the class can see it; room code also written on the blackboard as a manual fallback to the QR code.", "preshow"],
    ["Visesh — floor: identify the two slowest Wi-Fi corners of the room and plan to stand there during join.", "preshow"],
    ["Saraswati — voice: check projection from the back row; confirm you have your first line and final line off-book.", "preshow"],
    ["Aditi & Atharv — theory: re-read Section 5 of this document; agree with Anushka that a nod means \u201CI need the next screen.\u201D", "preshow"],
    ["Everyone — gear: your own phones silenced and pocketed (we are the only five people not playing), one printed copy of this script each, one spare copy for the professor\u2019s table.", "preshow"],
    ["Anushka — earlier that day (strongly recommended): one bot-squad dry run in a spare room — command is in Section 8 — so the first time you drive all 17 screens is not in front of the class.", "preshow"],
  ].map(([item]) => new Paragraph({
    numbering: { reference: "preshow", level: 0 },
    spacing: { before: 80, after: 80, line: 380 },
    children: (() => {
      const dash = item.indexOf(" — ");
      return [
        new TextRun({ text: item.slice(0, dash + 4), bold: true, size: 23, color: P.primary, font: FONT }),
        new TextRun({ text: item.slice(dash + 4), size: 23, color: P.body, font: FONT }),
      ];
    })(),
  })),
];

// =====================================================================
// SECTION 4 — THE SCRIPT (segments 0–5)
// =====================================================================
const seg = (num, name, time) => h2("Segment " + num + " · " + name, time);

const sec4a = [
  h1("4. The Script — Segment by Segment"),
  bodyP([
    t("Read the grey lines silently; say the plain lines out loud. Square brackets like "),
    t("[mean]", { italics: true, color: P.cueGrey }),
    t(" mean \u201Cread the live number off the big screen at that moment.\u201D Segments marked "),
    t("[CUT FIRST]", { bold: true, color: P.accent }),
    t(" are the pre-agreed paragraphs to drop if we are running behind."),
  ]),

  seg(0, "Pre-roll", "before 0:00"),
  stage("[SCREEN: Lobby — room code and QR already giant on the projector as the class settles.]"),
  stage("[PEOPLE: Anushka at the laptop, off to the side. Others seated casually, not lined up — we look like an audience, not a panel.]"),
  cue("Anushka — host screen must be live BEFORE the class sits down. The lobby is itself a spectacle: nicknames start appearing the moment curious people scan early. Let them."),

  seg(1, "The Hook & Join", "0:00 – 1:45"),
  stage("[SCREEN: Lobby. Visesh moving through the room from the back benches forward.]"),
  speak("Saraswati", [
    t("Before we begin — take your phones out. Yes, seriously, take them out. For the next fifteen minutes this class is going to play a game against itself, live, for "),
    t("\u3010prize name\u3011", { bold: true }),
    t(". Not a quiz about game theory. The actual thing."),
  ]),
  speak("Saraswati", [
    t("Scan the code on the screen, type any nickname, hit enter. You have ninety seconds. Go."),
  ]),
  stage("[Visesh: circulate — \u201Cscanned? in? locked?\u201D — unstick anyone frozen on the nickname field. Anushka: watch the player counter climb on the lobby feed, give Saraswati a quiet thumbs-up at roughly 80% joined.]"),
  speak("Saraswati", [
    t("If you can see your nickname on the big screen, you\u2019re in. Look left. Look right. "),
    b("These are the people you are playing against."),
    t(" Every one of them is about to become your rival — and your data."),
  ]),

  seg(2, "Rules", "1:45 – 2:45"),
  cue("Anushka — when Saraswati says \u201Clet\u2019s play\u201D, click START THE SHOW. The rules screen appears; the class can read it, but Saraswati narrates anyway — faster and warmer."),
  speak("Saraswati", [
    t("Here is the entire game. Everyone picks a number between zero and one hundred. We average every guess in this room. And the winner is whoever is closest to "),
    ba("two-thirds of that average"),
    t(". Say it back to me — two-thirds... of the average."),
  ]),
  speak("Saraswati", [
    t("Quick example so nobody is lost. If the class average comes out at 60, the target is 40. Average 30? Target 20. You are not trying to find a number — you are trying to find "),
    b("what this room is thinking"),
    t(", and then undercut it."),
  ]),
  speak("Saraswati", [
    t("Three rounds — thirty seconds, then twenty-five, then twenty — points stack up across rounds. And the top two players at the end will face each other in a final duel for "),
    t("\u3010prize name\u3011", { bold: true }),
    t(", where they will each privately choose to "),
    b("split the prize... or steal it"),
    t(". We\u2019ll get there. Trust me."),
  ]),
  speak("Saraswati", [
    t("Round one is instinct — no strategy talk, no consulting your neighbour. Thirty seconds. Let\u2019s play."),
  ]),

  seg(3, "Round 1 + Level-k Debrief", "2:45 – 5:00"),
  cue("Anushka — click NEXT. Round 1 goes live: 30-second countdown ring, submitted counter climbing. Phones show the slider and LOCK IN button."),
  stage("[During the 30 seconds: Saraswati keeps the room buzzing — do NOT explain theory yet.]"),
  speak("Saraswati", [
    t("Lock it in! You can change it until the clock dies — but every second you wait, somebody out there is out-thinking you. Five... four... three..."),
  ]),
  stage("[Auto-reveal fires (either everyone locked in, or the timer died): histogram of all guesses appears with the mean, the target, and the winner circled.]"),
  speak("Saraswati", [
    t("Look at that spread. Somebody picked [max]. Somebody picked [min]. Brave. The class average was [mean] — so the target was [target] — and the winner of round one is... [winner]! Big round of applause."),
  ]),
  speak("Saraswati", [
    t("So why did [winner] win? Because they didn\u2019t think about the number. They thought about "),
    b("us"),
    t(". Aditi — take the room down the rabbit hole."),
  ]),
  cue("Anushka — click NEXT to the Level-k ladder debrief screen while Aditi takes over."),
  speak("Aditi", [
    t("Here is what your guesses just revealed about you. If you pick a number at random — no thinking, just vibes — the crowd averages somewhere around 50. Game theorists call that "),
    ba("Level-zero"),
    t(" thinking. If you then think one step ahead — \u201Ceveryone else will average 50, so two-thirds of that is 33, I\u2019ll pick 33\u201D — that\u2019s "),
    ba("Level-one"),
    t(". One step deeper — \u201Cothers will pick 33, so I\u2019ll pick two-thirds of 33, about 22\u201D — "),
    ba("Level-two"),
    t(". Deeper still: 15... then 10... and so on, forever."),
  ]),
  speak("Aditi", [
    t("[Point at the ladder on screen.] The math says perfectly rational players keep climbing this ladder until they hit zero. But real humans stop after one or two steps — and this class just proved it: our average was [mean], which lands this room at roughly Level [one/two] thinking. Congratulations. You\u2019re human."),
  ]),
  speak("Aditi", [
    t("Quick check before I hand back — hands up if you picked above 40. [Pause.] You played Level-zero, straight instinct. Nothing wrong with that: somebody has to be the average. But notice the winners of this game are never the people who treat it as a math problem alone — they\u2019re the people who model the "),
    b("room"),
    t("."),
  ]),
  cue("Anushka — click NEXT. Round 2 goes live: 25 seconds."),

  seg(4, "Round 2 + The Spiral", "5:00 – 7:00"),
  speak("Aditi", [
    t("You have seen the data once now. You know this room thinks [one/two] levels deep. Twenty-five seconds — adapt."),
  ]),
  stage("[Reveal. Histogram shows the distribution tightening and sliding left.]"),
  speak("Aditi", [
    t("Average dropped from [r1 mean] to [r2 mean] in one round. The room is learning. Watch what happens when it learns one more time — but first, let me show you why this game has a floor."),
  ]),
  cue("Anushka — click NEXT to the spiral debrief screen."),
  speak("Aditi", [
    t("Think it through with me. Can a guess above 67 ever win? Even in the wildest case — every single person picks 100 — the average is 100 and two-thirds of that is 66.7. So any guess above 67 is "),
    b("guaranteed to lose"),
    t(". Cross it off the number line. It\u2019s dead."),
  ]),
  speak("Aditi", [
    t("But now the spiral starts. Once everyone knows that, nobody will ever pick above 67. So the true maximum average is 67 — which puts the target at 44. Cross that off too. Repeat: the ceiling drops to 30, then 20, then 13, then 9, then 6... every layer of \u201Ceveryone knows that everyone knows\u201D cuts the ceiling by a third, all the way down to exactly one destination: "),
    ba("zero"),
    t(". Hold that thought — Atharv finishes it in round three."),
  ]),
  speak("Aditi", [
    t(" [CUT FIRST] One real-world aside. In 1936, John Keynes described a newspaper contest where readers had to pick the six prettiest faces, and the prize went to whoever\u2019s picks matched the most popular answers. Not the faces "),
    t("you", { italics: true }),
    t(" find pretty — the faces "),
    t("everyone else", { italics: true }),
    t(" finds pretty. Stock markets, auctions, even changing lanes in traffic — same game. You are always trading on what others think, and what they think you think."),
  ]),
  cue("Anushka — click NEXT. Round 3 goes live: 20 seconds."),

  seg(5, "Round 3 + The Nash Trap", "7:00 – 9:00"),
  speak("Atharv", [
    t("Twenty seconds. The endgame. Everything you now know about this room — apply it."),
  ]),
  stage("[Reveal. Final histogram — typically the tightest cluster yet, close to the floor.]"),
  speak("Atharv", [
    t("Final average: [mean]. Target: [target]. Winner of the last round: [winner]. And now — the trap we have been building for nine minutes."),
  ]),
  cue("Anushka — click NEXT to the Nash debrief screen."),
  speak("Atharv", [
    t("If everyone in this room were perfectly rational — and everyone knew that everyone else were perfectly rational — there is only one guess that makes sense: "),
    ba("zero"),
    t(". That is this game\u2019s "),
    ba("Nash equilibrium"),
    t(": the one outcome where nobody can improve their result by changing their own guess alone. If everyone picks zero, the average is zero, the target is zero, and nobody wants to move."),
  ]),
  speak("Atharv", [
    t("But look at the screen. Did anyone actually pick zero? [If yes:] Exactly [n] person out of [N] — and they lost, because the rest of us weren\u2019t rational enough to join them. [If no:] Nobody. The theory says zero; this room said [mean]."),
  ]),
  speak("Atharv", [
    t("That gap between the prediction and the behaviour has a name: "),
    ba("bounded rationality"),
    t(". People are not calculating machines — we think a step or two deep, and we stop. Which is the real lesson of the last nine minutes: in a room full of humans, the perfectly rational player loses to the player who understands "),
    b("how rational the room actually is"),
    t("."),
  ]),
];

// =====================================================================
// SECTION 4 (cont.) — segments 6–9
// =====================================================================
const sec4b = [
  seg(6, "Leaderboard Drumroll", "9:00 – 9:45"),
  cue("Anushka — click NEXT through the leaderboard screen (finalists are computed automatically)."),
  stage("[Visesh: as positions 5 down to 2 are read, drift towards the prize and pick it up, ready.]"),
  speak("Saraswati", [
    t("Three rounds done. The moment of truth. In fifth place... [name]. Fourth... [name]. Third... [name]. [Pause. Let the room lean in.] In second place... [name]. And the top scorer of Two-Thirds Arena, with [score] points... [NAME]! Both of you — come to the front."),
  ]),
  stage("[Visesh escorts the two finalists to the front, one each side of the screen. Hand them nothing yet.]"),
  speak("Saraswati", [
    t("You two are about to play the most famous two-player game in game theory — for "),
    t("\u3010prize name\u3011", { bold: true }),
    t("."),
  ]),

  seg(7, "Split or Steal + Payoff Matrix", "9:45 – 12:15"),
  cue("Anushka — click NEXT (finale intro), then NEXT again to open voting. 25-second timer; it auto-reveals the moment both finalists lock in."),
  speak("Saraswati", [
    t("It\u2019s called "),
    ba("Split or Steal"),
    t(". Each of you chooses in secret, on your phone. If you "),
    b("both choose SPLIT"), t(" — you share the prize, half each. If "),
    b("one of you STEALS"), t(" while the other splits — the stealer takes everything. And if "),
    b("you both steal"), t(" — the prize is destroyed. Nobody gets anything."),
  ]),
  speak("Saraswati", [
    t("You may talk to each other. You may make promises. You may lie. Choose now."),
  ]),
  stage("[Ten to twenty seconds of genuine tension. Do not fill the silence — it is the best moment of the show. Anushka watches the two locked indicators.]"),
  stage("[Reveal — let the screen do the drama, confetti and all. Saraswati reacts in ONE line, e.g. \u201CCOLD-BLOODED!\u201D or \u201Cand they say game theory isn\u2019t romantic.\u201D Then straight to Atharv.]"),
  speak("Saraswati", [
    t("Atharv — was that rational?"),
  ]),
  cue("Anushka — click NEXT to the payoff-matrix debrief screen."),
  speak("Atharv", [
    t("Let\u2019s read what just happened like game theorists. [Point at the matrix.] If the other person splits, stealing gets you the whole prize instead of half — stealing is better. If the other person steals, splitting gets you nothing while stealing also gets you nothing — stealing is never worse. So "),
    ba("STEAL is a dominant strategy"),
    t(": it is the best answer no matter what your opponent does."),
  ]),
  speak("Atharv", [
    t("And that is the "),
    ba("prisoner\u2019s dilemma"),
    t(": two rational players following their dominant strategies both steal, both walk away with nothing — even though splitting together would have made them both better off. "),
    b("Rational individuals, irrational outcome."),
    t(" Nowhere is the gap between individual and collective rationality more expensive than right here."),
  ]),
  speak("Atharv", [
    t(" [CUT FIRST] One more layer — utility. Economists don\u2019t just count money; they count everything you care about, weighted together: "),
    ba("utility"),
    t(". If both split, each gets half a prize. But there is also a cost to being the person who stabbed a classmate in front of thirty witnesses. If that cost is bigger than half a prize, SPLIT becomes the rational choice after all. [If they split:] That is exactly what our finalists just demonstrated. [If someone stole:] And our champion has just shown us a utility function with no guilt term whatsoever."),
  ]),

  seg(8, "Wrap — Three Takeaways", "12:15 – 14:30"),
  cue("Anushka — click NEXT to the wrap screen."),
  stage("[Visesh centre with the prize; winner holds it. All five presenters now standing together.]"),
  speak("Visesh", [
    t("Let\u2019s land this. Three things to take home."),
  ]),
  speak("Visesh", [
    b("One."), t(" In any strategic situation, the question is never just \u201Cwhat should I pick\u201D — it is \u201Cwhat will the other side pick, and what do they think I will pick?\u201D That is best-response thinking, and it is the heart of game theory."),
  ]),
  speak("Visesh", [
    b("Two."), t(" Common knowledge is a spiral. \u201CEveryone knows\u201D is one level. \u201CEveryone knows that everyone knows\u201D cuts deeper — and in games like tonight\u2019s, that spiral has exactly one destination: zero."),
  ]),
  speak("Visesh", [
    b("Three."), t(" Real people are not perfectly rational — and that is not a bug in game theory, it is the actual subject. Knowing the equilibrium, AND knowing how far the room falls short of it, is what makes you dangerous."),
  ]),
  speak("Visesh", [
    t("You will see this everywhere now — markets, negotiations, auctions, even which queue you join. The next time someone tells you to \u201Cjust be rational,\u201D ask them: "),
    b("at what level?"),
  ]),
  speak("Saraswati", [
    t("Thank you for playing. Congratulations again to our winners — and we are Saraswati, Anushka, Aditi, Atharv and Visesh. "),
    b("Two-thirds of the average. How low will you go?"),
    t(" We\u2019re happy to take questions."),
  ]),

  seg(9, "Buffer", "14:30 – 15:00"),
  stage("[Hold on the wrap screen. If we are on time, invite questions — Section 6 has the answers. If we are behind, this buffer has already been spent and the show is over right on the whistle. If we are somehow AHEAD, offer the professor an encore: Reset options → Encore wipes scores and returns everyone to the lobby for a bonus rematch.]"),
];

// =====================================================================
// SECTION 5 — THEORY CRIB NOTES
// =====================================================================
const sec5 = [
  h1("5. Theory Crib Notes — Everyone Must Know This"),
  bodyP([
    t("Below are the four ideas the whole show rests on, in plain language. Every presenter reads this until they could explain each idea to a friend over chai. The professor will probe the quietest of us — make that probe a mistake."),
  ]),
  bodyP([
    ba("The game itself. "),
    t("This is the two-thirds beauty contest, a classic in experimental economics: every player secretly picks a number from 0 to 100, the target is two-thirds of the average of all picks, and whoever is closest to the target wins. The idea traces to John Keynes in 1936, who compared stock-picking to a newspaper contest where you win by guessing which faces "),
    t("others", { italics: true }),
    t(" will find prettiest — not which faces you like. Rosemarie Nagel turned it into a controlled experiment in 1995: real groups average around 35 in the first round and converge towards zero with repetition. Our class is about to reproduce that famous result live, which is exactly what makes this presentation defensible — every claim we make gets checked against the room\u2019s own numbers within sixty seconds of making it."),
  ]),
  bodyP([
    ba("Level-k reasoning. "),
    t("A behavioural model of how many steps of \u201Cif they think that I think...\u201D real people actually perform. Level-0 plays naively — random or instinctive picks, averaging around 50. Level-1 best-responds to Level-0: two-thirds of 50 is about 33. Level-2 best-responds to Level-1: about 22. Level-3 lands near 15, Level-4 near 10, and so on, each level multiplying by two-thirds. Lab data consistently shows most humans sit at Level-1 or Level-2 — which is why first-round classroom averages typically land between 20 and 40 rather than at the rational limit of zero. When Aditi says \u201Cthis room thinks about one level deep,\u201D she is reading the class average off the histogram and placing it on this ladder."),
  ]),
  bodyP([
    ba("Iterated dominance and the Nash equilibrium at zero. "),
    t("A guess is dominated when some other guess is always at least as good. Any guess above 66.67 is dominated — even if everyone picks 100, the target is only 66.67, so 100 (and everything above 67) can never be closest. Delete those guesses and the maximum possible average falls to 66.67, so the target can never exceed 44.4 — which makes everything above 44.4 dominated too. Each round of deletion cuts the ceiling by a third: 100 to 66.7 to 44.4 to 29.6 to 19.8 to 13.2 and so on, tightening towards exactly zero. What survives all rounds of this reasoning is the unique Nash equilibrium: everyone plays zero, the average is zero, the target is zero, and no single player gains by deviating alone. The catch — and the point of our show — is that reaching zero requires infinite layers of \u201Ceveryone knows that everyone knows.\u201D Real rooms stop after one or two. That gap between the equilibrium prediction and actual human behaviour is called bounded rationality, and it is why the winning move in a room of humans is almost never the textbook answer."),
  ]),
  bodyP([
    ba("The prisoner\u2019s dilemma and utility. "),
    t("The finale is a two-player game where each finalist privately chooses SPLIT or STEAL. Steal is a dominant strategy — whatever the other does, stealing never leaves you worse off and sometimes leaves you strictly better — yet both players following it destroys the prize entirely, an outcome worse for both than mutual splitting. That tension between individual rationality and collective outcome is the prisoner\u2019s dilemma, the most cited result in all of game theory. Utility theory is what softens it in real life: rational choice maximises expected utility, not money, and utility can include guilt, reputation, friendship, or how you want to be perceived by thirty classmates. If those weigh more than half a prize, splitting is genuinely rational — which is why real Split-or-Steal outcomes split far more often than the naive theory predicts, and why Atharv\u2019s closing line about \u201Ca utility function with no guilt term\u201D always gets a laugh."),
  ]),
];

// =====================================================================
// SECTION 6 — PROFESSOR Q&A PREP
// =====================================================================
const sec6 = [
  h1("6. Professor Q&A Prep"),
  bodyP([
    t("Seven questions we should honestly expect, with a model answer each. Default rule: theory anchors (Aditi, Atharv) take definition questions; Saraswati takes \u201Cwhat did we just see\u201D questions; anyone may pass to a teammate by name — passing looks like teamwork, not weakness. All five of us can answer question 1 cold."),
  ]),
  bodyP([
    b("Q1. \u201CWhat exactly is the Nash equilibrium of your game, and why zero?\u201D — anyone fields. "),
    t("Zero for everyone. If all pick zero, the average is zero, the target is zero, and any individual who deviates moves away from the target and strictly loses. Uniqueness follows from iterated elimination: guesses above 66.67 are dominated, deleting them lowers the maximum possible average, and repeating drives the only surviving guess to zero."),
  ]),
  bodyP([
    b("Q2. \u201CIf zero is the equilibrium, why did your winner not pick zero?\u201D — Atharv fields. "),
    t("Because equilibrium assumes common knowledge of rationality — everyone rational, everyone knowing it, infinitely deep. Our room ran one or two levels of reasoning deep, so the winning guess sat near two-thirds of the room\u2019s actual average, not the theoretical one. Equilibrium describes where perfectly rational play converges; level-k describes the humans we actually had. Both are game theory — that is the lesson of the show."),
  ]),
  bodyP([
    b("Q3. \u201CIs one classroom round of this actually evidence of anything?\u201D — Aditi fields. "),
    t("One round is anecdote; the pattern is not. Nagel\u2019s 1995 experiments and dozens of replications — newspapers with tens of thousands of readers, lab tournaments, our own three rounds — all show the same shape: first-round averages around 30 to 40, falling steadily with repetition, converging towards but never quite reaching zero. Our class reproduced the published result live: round one [r1 mean], round three [r3 mean], same direction, same pace."),
  ]),
  bodyP([
    b("Q4. \u201CIn Split or Steal, isn\u2019t stealing just rational, full stop?\u201D — Atharv fields. "),
    t("In the one-shot game with purely monetary payoffs, yes — steal is dominant. But rational choice maximises utility, not rupees: guilt, reputation and repeated interaction all enter the payoff. And our finalists interact with this class every day, so the game is not truly one-shot — cooperation becomes sustainable when today\u2019s betrayal costs tomorrow\u2019s cooperation. That is precisely why real Split-or-Steal splits more often than the naive matrix predicts."),
  ]),
  bodyP([
    b("Q5. \u201CWhat would happen if the class kept playing rounds?\u201D — Aditi fields. "),
    t("Averages would keep falling towards zero — we already watched [r1 mean] fall to [r3 mean] in just three rounds. Nagel\u2019s data shows exactly this convergence with experience. Interesting subtlety: full convergence rarely completes, because as everyone approaches zero the incentive to shade just below the average shrinks towards nothing."),
  ]),
  bodyP([
    b("Q6. \u201CHow is the guessing game different from a prisoner\u2019s dilemma?\u201D — Atharv fields. "),
    t("The guessing game is dominance-solvable: reasoning alone, with no communication, pins down the unique equilibrium at zero — there is no tension between individual and collective interest. The prisoner\u2019s dilemma is the opposite: each player\u2019s dominant strategy leads to a jointly worse outcome. Our show deliberately staged both: three rounds of pure reasoning, then a finale of pure incentive conflict."),
  ]),
  bodyP([
    b("Q7. \u201CWhat does the \u2018p\u2019 in p-beauty contest mean?\u201D — anyone fields. "),
    t("The game generalises: the target is p times the average, for any p. Our game is p = 2/3. Any p below 1 shrinks towards zero by the same iterated-dominance argument; p above 1 explodes towards 100; p = 1 collapses into a pure coordination game where any common number is an equilibrium. Keynes\u2019s original insight was really about p slightly below 1 — markets where out-guessing the crowd, not being right, pays."),
  ]),
];

// =====================================================================
// SECTION 7 — CONTINGENCY PLAYBOOK
// =====================================================================
const sec7 = [
  h1("7. Contingency Playbook — When Things Go Wrong"),
  bodyP([
    t("Nothing below should panic you: the game state lives on the server, the class is forgiving, and a recovered glitch often earns more respect than a flawless run. The rule in the moment is simple — "),
    b("Anushka fixes, Saraswati fills, everyone else holds position"),
    t(". Saraswati\u2019s universal filler while anything is being fixed: \u201CTwo things game theory teaches us: strategy, and patience.\u201D"),
  ]),
  bodyP([
    ba("The Wi-Fi or the app is dead. "),
    t("Switch to paper without breaking character. Visesh distributes slips, the class writes one number per round, Anushka averages them on any calculator or phone, and we read the results off the blackboard — draw a rough histogram in chalk, ten-wide buckets. Every debrief in Section 4 works unchanged; only the screens become a blackboard. This fallback costs us nothing but the leaderboard drama — for the finale, two folded slips marked SPLIT and STEAL revealed simultaneously is, if anything, more theatrical."),
  ]),
  bodyP([
    ba("A student can\u2019t join or their phone dies mid-game. "),
    t("They refresh and rejoin — the app restores them automatically on the same phone. A player who switches phones joins as a new player and is dealt in from the next round; nothing to fix, just tell them calmly. If half the room is stuck, that is the Wi-Fi scenario above — do not stand around hoping; Visesh makes the call to paper within sixty seconds."),
  ]),
  bodyP([
    ba("A finalist\u2019s phone dies right before the finale. "),
    t("The finale needs both secret votes. Do not improvise electronics: run it on paper — two slips, SPLIT or STEAL, folded and revealed simultaneously. It preserves secrecy, drama, and the schedule."),
  ]),
  bodyP([
    ba("The projector screen refreshes or drops to the landing page. "),
    t("Anushka clicks HOST ON PROJECTOR again — host mode normally restores itself, and even a full reload reconnects to the same room with all players, scores and timers intact. The class sees nothing but a lobby flash; Saraswati narrates: \u201Ceven the projector is playing games with us.\u201D"),
  ]),
  bodyP([
    ba("We are running behind. "),
    t("In order of preference: SKIP TIMER ends any round instantly; the paragraphs marked [CUT FIRST] go (Keynes aside, then Atharv\u2019s utility paragraph); Aditi\u2019s spiral keeps only the 67-crossing and the final zero; the buffer segment is already the emergency reserve. Never cut: the three debrief core ideas, and the finale."),
  ]),
  bodyP([
    ba("We are running ahead. "),
    t("Hold the wrap screen and invite questions early, let a debrief breathe with one more class datapoint, or — best case — offer the professor an encore round via Reset options → Encore: same players, scores wiped, two minutes, and a chance to watch the class converge further towards zero. Professors rarely refuse."),
  ]),
  bodyP([
    ba("We get cut to ten minutes total. "),
    t("Anushka blips NEXT straight through Round 2\u2019s three screens (the empty histogram appears for two seconds — Saraswati covers it: \u201Cround two was a practice lap — straight to the endgame\u201D), and we run Rounds 1 and 3 with their debriefs, the finale, and a one-takeaway wrap from Visesh."),
  ]),
];

// =====================================================================
// SECTION 8 — REHEARSAL PLAN & PRINT CHECKLIST
// =====================================================================
const sec8 = [
  h1("8. Rehearsal Plan & Print Checklist"),
  bodyP([
    t("Two rehearsals, no exceptions — five-person presentations die at the handoffs, and handoffs are only fixed by repetition. Rehearsal one is technical, rehearsal two is theatrical. Both take under thirty minutes."),
  ]),
  bodyP([
    ba("Rehearsal 1 — Tech (Anushka drives, everyone watches). "),
    t("Start a fresh host screen, then unleash the bot squad so Anushka practises driving all 17 screens against live fake players instead of an empty room. From the project folder run: "),
    b("node scripts/bot-squad.mjs ROOM Aarav:33 Isha:22 Neil:14 Tara:8"),
    t(" — replacing ROOM with the code on the lobby — and the bots join, guess, and even vote in the finale on their own. Aditi and Atharv practise talking over the live histograms; the bots\u2019 numbers are weird on purpose, which is good training for a weird class."),
  ]),
  bodyP([
    ba("Rehearsal 2 — Full dress (all five, timed). "),
    t("The four non-drivers join as players on their own phones, one phone on airplane-mode briefly to rehearse the reconnect line, and a stopwatch running from Saraswati\u2019s first word. Target: 14:00 flat. Then run the handoff drill: each pair repeats their exact handoff sentence three times — \u201CAditi — take the room down the rabbit hole,\u201D \u201CAtharv — was that rational?\u201D — until the names land automatically under adrenaline."),
  ]),
  bodyP([
    ba("Memorisation rule. "),
    t("Each presenter memorises exactly three things: your first line, your last line, and the handoff sentence on either side of your segment. Everything else may be read from this script — a presenter glancing at notes looks prepared; a presenter reciting everything sounds rehearsed; a presenter who forgot a handoff name looks abandoned."),
  ]),
  tableTitle("Print & pack checklist — day of the show"),
  ...[
    ["This script — one copy per presenter, each copy with its owner\u2019s lines highlighted; one spare copy on the professor\u2019s table.", "print"],
    ["Section 5 + Section 6 printed once more and kept at the Q&A-ready spot up front — that is our open-book defence.", "print"],
    ["Projector laptop: charged AND charger in the bag; presenter clicker with a spare battery.", "print"],
    ["A phone with mobile hotspot configured — the backup internet for the projector laptop.", "print"],
    ["The physical prize, in a bag, already visible-practice-placed; the paper-slip fallback kit (twenty slips + two pens) zipped in the same bag.", "print"],
    ["This document\u2019s \u3010prize name\u3011 placeholders replaced with the real prize everywhere (three places: Sections 1, and Segments 1, 2, 6).", "print"],
  ].map(([item]) => new Paragraph({
    numbering: { reference: "print", level: 0 },
    spacing: { before: 80, after: 80, line: 380 },
    children: (() => {
      const dash = item.indexOf(" — ");
      if (dash === -1) return [new TextRun({ text: item, size: 23, color: P.body, font: FONT })];
      return [
        new TextRun({ text: item.slice(0, dash + 4), bold: true, size: 23, color: P.primary, font: FONT }),
        new TextRun({ text: item.slice(dash + 4), size: 23, color: P.body, font: FONT }),
      ];
    })(),
  })),
  divider(),
  bodyP([
    t("Final word: the app will carry the mechanics, the timers and the maths — nobody in this room has to compute anything under pressure. Our whole job is to point at the screen the class just painted with its own guesses and say the true thing about it. Fifteen minutes. Five people. One destination: "),
    b("zero."), t(" Go get them."),
  ]),
];

// ===== ASSEMBLY (do not move) =====
const allSections = [...titleBlock, ...sec1, ...sec2, ...sec3, ...sec4a, ...sec4b, ...sec5, ...sec6, ...sec7, ...sec8];

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "preshow",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 620, hanging: 360 } } },
        }],
      },
      {
        reference: "print",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 620, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 24, color: P.body },
        paragraph: { spacing: { line: 400 } },
      },
      heading1: {
        run: { font: FONT, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 420, after: 160, line: 322 } },
      },
      heading2: {
        run: { font: FONT, size: 26, bold: true, color: P.primary },
        paragraph: { spacing: { before: 320, after: 100, line: 312 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Two-Thirds Arena · Team Script", size: 16, color: P.cueGrey, font: FONT })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: P.secondary, font: FONT })],
        })],
      }),
    },
    children: allSections,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = "/home/z/my-project/download/Two-Thirds-Arena-Team-Script.docx";
  fs.writeFileSync(out, buf);
  console.log("WROTE " + out + " (" + buf.length + " bytes)");
});
