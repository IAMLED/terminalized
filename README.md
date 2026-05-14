# Terminal Quest

A Linux command-line learning game with 7 progressive levels — navigation, file reading, hidden files, permissions, searching, log analysis, and a final boss.

## Quick Start

```bash
npm install
npm start          # vite dev server, http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Routes (HashRouter)

- `/#/`         — Welcome screen + name capture
- `/#/game`     — Active gameplay
- `/#/victory`  — Run completed
- `/#/gameover` — Time expired

Routes use `HashRouter` so refreshing on any page works without server config.

## Gameplay Rules

### Completion
- **Level 1**: Player must see `flag.txt` in any `ls` output. Then type `submit` to complete.
- **Levels 2–7**: Player must `cat` (or `head`/`tail`/`less`/`more`) a file containing the flag. The flag string appears in terminal output. Then type `submit` to open the input modal and type the exact flag.
- Reaching max score does **not** complete a level.
- Timer expiring → Game Over with study topics for the failed level.

### Scoring
- Correct command: `+5`
- Finding clue keywords in output: `+10`
- Capturing the flag: `+50`
- Completing a level: `+100`
- Time bonus: up to `+100` based on fraction of time remaining
- Wrong command: `-2`
- Using a hint: `-10`

## Architecture

```
src/
├── App.jsx                — HashRouter root
├── index.jsx              — React entry
├── context/
│   └── GameContext.jsx    — useReducer state (player name, level, score, timer)
├── data/
│   └── levels.js          — Level definitions with study topics, flag injection metadata
├── engine/
│   ├── fileSystem.js      — VirtualFS class (pwd/cd/ls/cat/chmod/grep/find)
│   ├── commandEngine.js   — parse + execute commands, score, allowed-command enforcement
│   └── soundEngine.js     — HTMLAudio music + Web Audio SFX (CDN-friendly)
├── components/
│   ├── Terminal.jsx       — Terminal UI, flag-detection, submit overlay, congrats overlay
│   ├── Sidebar.jsx        — Score, countdown, hints, level list, points guide
│   └── MissionBrief.jsx   — Collapsible mission objective banner
├── pages/
│   ├── Welcome.jsx        — Intro + name capture modal
│   ├── Game.jsx           — Top nav + layout (responsive col → row on lg+)
│   ├── Victory.jsx        — Rank, time, certificate with player name
│   └── GameOver.jsx       — Failed-level study topics + tips
├── utils/
│   └── flagGenerator.js   — Session-unique flag generation + injection
└── styles/
    └── global.css         — Tailwind directives + utility patterns
```

## Auto-Generated Flags

Flags are generated fresh per session by `utils/flagGenerator.js` and injected into the virtual file system at game start (via `START_GAME` in `GameContext`). Each level's flag is unique and follows `flag{xxxx-xxxx-xxxx}` format. Flags are never written to localStorage and never displayed on the congrats/victory screens — only inside file contents where the player discovers them through commands.

## Customising Music

`src/engine/soundEngine.js` exports a `MUSIC_TRACKS` map (level id → URL or imported MP3). The current setup uses `src/music/code.mp3` for all levels. Replace with any CDN URL (e.g. Pixabay Music) or per-level different tracks. SFX has a similar `SFX_URLS` override map; if `null`, it falls back to procedural Web Audio tones.

## Responsiveness

Built with Tailwind CSS. Layout collapses to a single column on mobile (Sidebar above Terminal) and switches to side-by-side on `lg` (≥1024px) breakpoint. All overlay modals scale with `max-w-*` and reflow gracefully on small screens.
