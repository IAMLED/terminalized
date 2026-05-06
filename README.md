# Terminal Quest 🚩

A Linux command-line adventure game built with React. Progress through 7 escalating missions by using real Linux commands to navigate file systems, fix permissions, search files, and capture flags.

## Project Structure

```
terminal-quest/
├── public/
│   └── index.html              # HTML entry point (loads Google Fonts)
├── src/
│   ├── data/
│   │   └── levels.js           # All 7 level definitions (file systems, flags, hints)
│   ├── context/
│   │   └── GameContext.jsx     # Global game state (score, level, hints) via useReducer
│   ├── engine/
│   │   ├── fileSystem.js       # Virtual Linux FS (ls, cd, cat, chmod, grep, find...)
│   │   └── commandEngine.js    # Command parser + dispatcher + scoring
│   ├── components/
│   │   ├── Terminal.jsx        # Interactive shell with ANSI colours + tab completion
│   │   ├── Sidebar.jsx         # Score, timer, hints, level progress
│   │   └── MissionBrief.jsx    # Collapsible mission objective panel
│   ├── pages/
│   │   ├── Welcome.jsx         # Animated intro screen (route: /)
│   │   ├── Game.jsx            # Main game layout (route: /game)
│   │   └── Victory.jsx         # Completion screen with rank + certificate (route: /victory)
│   ├── styles/
│   │   └── global.css          # CSS reset + base styles
│   ├── App.jsx                 # BrowserRouter + Routes
│   └── index.js                # React root entry
└── package.json
```

## Routing

| Route      | Component     | Description                          |
|------------|---------------|--------------------------------------|
| `/`        | Welcome       | Animated intro + start button        |
| `/game`    | Game          | Terminal + sidebar + mission brief   |
| `/victory` | Victory       | Score, rank, certificate, play again |

## Getting Started

```bash
npm install
npm start
```

Then open http://localhost:3000

## Levels

| # | Title                | New Commands        | Flag                          |
|---|----------------------|---------------------|-------------------------------|
| 1 | Basic Navigation     | pwd, ls, cd         | flag{first_steps_in_linux}    |
| 2 | Reading Files        | cat, head, tail     | flag{file_reader_master}      |
| 3 | Hidden Files         | ls -a               | flag{hidden_truth_found}      |
| 4 | Permissions Challenge| chmod, ls -l        | flag{permission_granted}      |
| 5 | Searching Files      | find, grep          | flag{search_and_destroy}      |
| 6 | Log Analysis         | grep, tail          | flag{incident_responder}      |
| 7 | Final Boss           | all skills          | flag{terminal_quest_complete} |

## Terminal Commands

```
pwd              Print working directory
ls [-a] [-l]     List directory contents
cd <dir>         Change directory
cat <file>       Display file contents
head <file>      First 10 lines
tail <file>      Last 10 lines
chmod <mode> <f> Change permissions (e.g. chmod 644 file.txt)
grep <pat> <f>   Search in file
find [path]      Find files (-name "*pattern*", -type f/d)
echo <text>      Print text
clear            Clear screen
history          Command history
submit <flag>    Submit a flag
hint             Get a hint (-10 pts)
help             Show all commands
```

## Scoring

| Action          | Points |
|-----------------|--------|
| Correct command | +5     |
| Find clue       | +10    |
| Find flag       | +50    |
| Complete level  | +100   |
| Time bonus      | varies |
| Wrong command   | -2     |
| Use hint        | -10    |

## Ranks

| Score  | Rank | Title              |
|--------|------|--------------------|
| 1800+  | S    | Terminal Master    |
| 1400+  | A    | Senior SysAdmin    |
| 1000+  | B    | Linux Practitioner |
| 600+   | C    | Shell Apprentice   |
| 0+     | D    | Script Kiddie      |
