# Terminal Quest — Test Documentation

**Version:** 1.0.0  
**Test Framework:** Vitest 2.x  
**Total Test Files:** 4  
**Total Test Cases:** 120+  
**Coverage Target:** Engine modules ≥ 90%

---

## Running the Tests

```bash
# Install dependencies first
npm install

# Run all tests once
npm test

# Run tests in watch mode (re-runs on file change)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run a single test file
npx vitest src/__tests__/security.test.js
```

---

## Test File Overview

| File | Scope | Cases |
|------|-------|-------|
| `fileSystem.test.js`    | VirtualFS engine unit tests        | 42 |
| `commandEngine.test.js` | Command parsing, execution, scoring | 38 |
| `levels.test.js`        | Level data integrity & reachability | 26 |
| `security.test.js`      | Security & adversarial input        | 34 |
| `gameFlow.test.js`      | End-to-end level play-throughs      | 32 |

---

## 1. File System Engine Tests (`fileSystem.test.js`)

### 1.1 `pwd` — Print Working Directory

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| FS-PWD-01 | Returns `/home/player` on init | `/home/player` | ✅ |
| FS-PWD-02 | Updates after `cd` | New path | ✅ |

**Rationale:** `pwd` is the orientation anchor for every level. A wrong cwd would break all relative path resolution downstream.

---

### 1.2 `cd` — Change Directory

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| FS-CD-01 | Navigate into subdirectory | `success: true`, cwd updated | ✅ |
| FS-CD-02 | `cd` with no arg returns to home | `/home/player` | ✅ |
| FS-CD-03 | `cd ~` returns to home | `/home/player` | ✅ |
| FS-CD-04 | `cd ..` navigates up | Parent path | ✅ |
| FS-CD-05 | Non-existent directory | `"No such file or directory"` error | ✅ |
| FS-CD-06 | `cd` into a file | `"Not a directory"` error | ✅ |
| FS-CD-07 | Absolute path navigation | `success: true` | ✅ |
| FS-CD-08 | Nested relative path | `success: true` | ✅ |

**Rationale:** `cd` is the primary navigation command. Every level requires players to navigate directories, so all edge cases (missing dirs, file targets, home shortcuts) must be handled gracefully.

---

### 1.3 `ls` — List Directory

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| FS-LS-01 | Lists visible children | Visible dirs/files in output | ✅ |
| FS-LS-02 | Hidden dirs NOT shown without `-a` | `.hidden` absent | ✅ |
| FS-LS-03 | Hidden dirs shown with `-a` | `.hidden` present | ✅ |
| FS-LS-04 | `-la` flag shows hidden entries | `.hidden` present | ✅ |
| FS-LS-05 | `-l` includes permission string | `rw-r--r--` in output | ✅ |
| FS-LS-06 | Locked file shows `----------` in `-l` | `----------` in output | ✅ |
| FS-LS-07 | Non-existent path returns error | `success: false` | ✅ |
| FS-LS-08 | Specific subdirectory listing | Children of that dir | ✅ |
| FS-LS-09 | `.` and `..` present with `-a` | Both in output | ✅ |

**Rationale:** Level 3 is specifically designed around the `ls -a` concept. If hidden entries leaked without `-a`, the challenge would be trivially bypassed.

---

### 1.4 `cat` — Read File

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| FS-CAT-01 | Reads readable file | File content returned | ✅ |
| FS-CAT-02 | Blocked by `----------` permissions | `"Permission denied"` | ✅ |
| FS-CAT-03 | Missing file returns error | `"No such file or directory"` | ✅ |
| FS-CAT-04 | `cat` on directory returns error | `"Is a directory"` | ✅ |
| FS-CAT-05 | No argument returns error | `"missing file operand"` | ✅ |
| FS-CAT-06 | Works with absolute path | File content returned | ✅ |

**Rationale:** The permission-denied test (FS-CAT-02) directly validates the bug fix where `permissions[0]` was incorrectly read as `permissions[1]`, causing all readable files to be denied.

---

### 1.5 `head` and `tail`

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| FS-HT-01 | `head` returns first lines | Content present | ✅ |
| FS-HT-02 | `tail` returns last lines | Content present | ✅ |
| FS-HT-03 | `head` blocked by permissions | `success: false` | ✅ |

---

### 1.6 `chmod` — Change Permissions

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| FS-CHMOD-01 | `chmod 644` unlocks a locked file | `cat` succeeds after | ✅ |
| FS-CHMOD-02 | `chmod 000` locks a readable file | `cat` fails after | ✅ |
| FS-CHMOD-03 | Missing file returns error | `"No such file or directory"` | ✅ |
| FS-CHMOD-04 | No args returns error | `success: false` | ✅ |
| FS-CHMOD-05 | `755` maps to `rwxr-xr-x` | Correct perm string | ✅ |

**Rationale:** Level 4 is entirely based on chmod. FS-CHMOD-01 is the critical happy path; FS-CHMOD-02 tests the reverse to ensure the permission model is genuinely enforced, not just cosmetic.

---

### 1.7 `grep` — Search in File

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| FS-GREP-01 | Finds pattern in file | Matching line returned | ✅ |
| FS-GREP-02 | No match returns empty output | Empty string | ✅ |
| FS-GREP-03 | Case-insensitive matching | Match returned | ✅ |
| FS-GREP-04 | Missing file returns error | `success: false` | ✅ |
| FS-GREP-05 | Permission-denied file returns error | `"Permission denied"` | ✅ |
| FS-GREP-06 | `grep` on directory returns error | `success: false` | ✅ |
| FS-GREP-07 | Fewer than 2 args returns error | `success: false` | ✅ |

---

### 1.8 `find` — Find Files

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| FS-FIND-01 | Finds files by `*.txt` pattern | Matching files listed | ✅ |
| FS-FIND-02 | Finds hidden files by `-name` | Hidden file found | ✅ |
| FS-FIND-03 | `-type f` returns files only | No directories | ✅ |
| FS-FIND-04 | `-type d` returns dirs only | Only directories | ✅ |
| FS-FIND-05 | No match returns empty string | `""` | ✅ |

---

### 1.9 Path Resolution

| Test ID | Description | Expected |
|---------|-------------|----------|
| FS-PATH-01 | Relative path resolves correctly | Full absolute path |
| FS-PATH-02 | Absolute path unchanged | Same path |
| FS-PATH-03 | `~` resolves to `/home/player` | `/home/player` |
| FS-PATH-04 | `~/docs` resolves correctly | `/home/player/docs` |
| FS-PATH-05 | `..` from subdir resolves correctly | Parent path |
| FS-PATH-06 | Nested `../sibling` resolves correctly | Sibling path |

---

## 2. Command Engine Tests (`commandEngine.test.js`)

### 2.1 `parseCommand` — Tokeniser

| Test ID | Description | Expected |
|---------|-------------|----------|
| CE-PARSE-01 | Empty string returns `null` | `null` |
| CE-PARSE-02 | Whitespace-only returns `null` | `null` |
| CE-PARSE-03 | Simple command parses correctly | `{cmd:"ls", args:[]}` |
| CE-PARSE-04 | Command with flags and path | `{cmd:"ls", args:["-la","/home"]}` |
| CE-PARSE-05 | Command normalised to lowercase | `cmd: "ls"` even if typed as `LS` |
| CE-PARSE-06 | Double-quoted arg with spaces | Single token with space |
| CE-PARSE-07 | Single-quoted arg | Single token |
| CE-PARSE-08 | Raw input preserved | `raw` field matches original |

---

### 2.2 Allowed Commands Enforcement

| Test ID | Description | Expected |
|---------|-------------|----------|
| CE-ACE-01 | `cat` blocked on Level 1 | `"not available on this level"` |
| CE-ACE-02 | `grep` blocked on Level 1 | Error |
| CE-ACE-03 | `find` blocked on Level 1 | Error |
| CE-ACE-04 | `chmod` blocked on Level 1 | Error |
| CE-ACE-05 | `ls` allowed on Level 1 | Success |
| CE-ACE-06 | `pwd` allowed on Level 1 | `/home/player` |
| CE-ACE-07 | `help` always allowed | Help text |
| CE-ACE-08 | `hint` always returns `__HINT__` | `"__HINT__"` |
| CE-ACE-09 | All commands allowed when `allowedCommands` is `null` | Success |
| CE-ACE-10 | Blocked command deducts score | Negative value called on `onScore` |

**Rationale:** The allowedCommands system is the core pedagogical mechanic — each level teaches specific commands. Bypassing it would undermine the learning structure.

---

### 2.3 Score Cap

| Test ID | Description | Expected |
|---------|-------------|----------|
| CE-SCORE-01 | Awards points when below cap | Positive `onScore` call |
| CE-SCORE-02 | No points when at cap | `onScore` not called |
| CE-SCORE-03 | No points when above cap | `onScore` not called |

---

### 2.4 `submit` Command

| Test ID | Description | Expected |
|---------|-------------|----------|
| CE-SUB-01 | Correct flag accepted | `{flagSubmitted:true, correct:true}` |
| CE-SUB-02 | Wrong flag rejected | `{flagSubmitted:true, correct:false, isError:true}` |
| CE-SUB-03 | Empty flag rejected | `correct: falsy` |
| CE-SUB-04 | Wrong flag deducts score | Negative net score |
| CE-SUB-05 | `submit` allowed even on restricted levels | Works on Level 1 |

---

### 2.5 Auto Flag Detection

| Test ID | Description | Expected |
|---------|-------------|----------|
| CE-AFD-01 | `cat` on flag file triggers detection | `flagFound: true` |
| CE-AFD-02 | Wrong level flag not detected | `flagFound` undefined |
| CE-AFD-03 | `findFlag` score awarded on detection | ≥50 pts in score calls |

---

## 3. Level Data Tests (`levels.test.js`)

### 3.1 Structure Integrity

| Test ID | Description | Expected |
|---------|-------------|----------|
| LV-INT-01 | Exactly 7 levels defined | `length === 7` |
| LV-INT-02 | IDs are 1–7, no gaps | `[1,2,3,4,5,6,7]` |
| LV-INT-03 | Every level has required fields | No `undefined` on required keys |
| LV-INT-04 | All flags match `flag{...}` format | Regex validation |
| LV-INT-05 | All flags are unique | Set size === 7 |
| LV-INT-06 | Time limits match `LEVEL_TIME_LIMITS` | Exact match |
| LV-INT-07 | Time limits in ascending order | Each ≥ previous |
| LV-INT-08 | `pointsAvailable` increases by difficulty | L1 ≤ L7 |
| LV-INT-09 | Every `allowedCommands` includes `help` and `hint` | Both present |
| LV-INT-10 | Concepts are subsets of `allowedCommands` | No orphaned concepts |

---

### 3.2 File System Reachability (per level)

For each of the 7 levels:

| Test ID | Description | Expected |
|---------|-------------|----------|
| LV-FS-{N}-01 | Flag content exists somewhere in FS | Entry found |
| LV-FS-{N}-02 | All child references resolve to real nodes | No dangling pointers |
| LV-FS-{N}-03 | `/home/player` root is a directory | `type: "dir"` |

---

### 3.3 Level-Specific Tests

| Test ID | Level | Description | Expected |
|---------|-------|-------------|----------|
| LV-L1-01 | L1 | `cat` not in allowedCommands | Not in array |
| LV-L1-02 | L1 | Flag reachable by `ls` alone | `flag.txt` in ls output |
| LV-L3-01 | L3 | Hidden dir invisible without `-a` | Not in plain ls |
| LV-L3-02 | L3 | Hidden dir visible with `-a` | Present |
| LV-L3-03 | L3 | Flag readable after `cd .secrets; cat` | Correct flag content |
| LV-L4-01 | L4 | `flag.txt` starts with `----------` | Permissions[0] ≠ `r` |
| LV-L4-02 | L4 | `cat` fails before `chmod` | `success: false` |
| LV-L4-03 | L4 | `cat` succeeds after `chmod 644` | Flag content returned |

---

## 4. Security Tests (`security.test.js`)

### 4.1 Path Traversal Prevention

| Test ID | Description | Attack Vector | Expected |
|---------|-------------|---------------|----------|
| SEC-PT-01 | `cd ..` cannot reach filesystem root | Repeated `..` | Stays in virtual FS |
| SEC-PT-02 | `../../` traversal stays in virtual FS | Path injection | No host FS paths in output |
| SEC-PT-03 | Absolute path to `/etc` blocked | `/etc` not in virtual FS | `success: false` |
| SEC-PT-04 | `/etc/passwd` not accessible | Host path | `success: false` |
| SEC-PT-05 | `../../etc/shadow` traversal blocked | Relative traversal | `success: false` |

**Why this matters:** If path traversal were possible, players could potentially cause the game to attempt reading arbitrary host-system paths. The virtual FS is self-contained and only exposes keys explicitly defined in the level's `fileSystem` object.

---

### 4.2 Command Injection

| Test ID | Description | Attack Vector | Expected |
|---------|-------------|---------------|----------|
| SEC-INJ-01 | Semicolon injection not executed | `ls; rm -rf /` | Only `ls` runs |
| SEC-INJ-02 | Pipe not treated as shell pipe | `cat file \| grep flag` | Treated as single command |
| SEC-INJ-03 | Backtick injection treated literally | `cat \`whoami\`` | Literal string arg |
| SEC-INJ-04 | `$()` subshell not evaluated | `cat $(cat /etc/passwd)` | Tokenised literally |
| SEC-INJ-05 | `&&` chaining not executed | `ls && rm -rf /` | Only `ls` runs |

**Why this matters:** The terminal accepts freeform text input. Without this protection, players could attempt to inject shell metacharacters. The tokeniser splits on spaces only (with quote handling) and never passes input to a real shell — all execution is via the virtual engine.

---

### 4.3 Privilege Escalation

| Test ID | Description | Attack | Expected |
|---------|-------------|--------|----------|
| SEC-PRIV-01 | `sudo su` blocked | Privilege escalation | Sudoers warning |
| SEC-PRIV-02 | `sudo rm -rf /` blocked | Destructive + root | Sudoers warning |
| SEC-PRIV-03 | `su root` unrecognised | User switch | `command not found` |
| SEC-PRIV-04 | `passwd` unrecognised | Password change | `command not found` |

---

### 4.4 Destructive Command Blocking

| Test ID | Description | Expected |
|---------|-------------|----------|
| SEC-DEST-01 | `rm -rf /` blocked | `"not permitted"` |
| SEC-DEST-02 | `mv` blocked | `"not permitted"` |
| SEC-DEST-03 | `cp` blocked | `"not permitted"` |
| SEC-DEST-04 | `touch` blocked | `"not permitted"` |
| SEC-DEST-05 | `mkdir` blocked | `"not permitted"` |
| SEC-DEST-06 | `exit`/`logout` cannot leave game | `"can't leave"` message |

---

### 4.5 Flag Submission Security

| Test ID | Description | Expected |
|---------|-------------|----------|
| SEC-FLAG-01 | Flag from different level rejected | `correct: false` |
| SEC-FLAG-02 | Empty submission rejected | `correct: falsy` |
| SEC-FLAG-03 | Flag with trailing args rejected | `correct: false` |
| SEC-FLAG-04 | Flag comparison is case-sensitive | `FLAG{SAFE}` ≠ `flag{safe}` |
| SEC-FLAG-05 | Score not awarded for wrong flag | Net score ≤ 0 |

**Why this matters:** Validates that players cannot guess flags by submitting variations, case-fold, or inject extra tokens. Each flag is a precise string match.

---

### 4.6 Input Boundary Conditions

| Test ID | Description | Expected |
|---------|-------------|----------|
| SEC-BOUND-01 | 5000-char command does not crash | No exception |
| SEC-BOUND-02 | Empty/whitespace returns `null` | `null` from `parseCommand` |
| SEC-BOUND-03 | Unicode input does not crash | Defined result object |
| SEC-BOUND-04 | 26-level deep path returns error | `"No such file or directory"` |
| SEC-BOUND-05 | Null byte in path does not crash | No exception |
| SEC-BOUND-06 | 200 rapid commands don't corrupt VFS state | `pwd()` still correct |

---

### 4.7 Score Manipulation

| Test ID | Description | Expected |
|---------|-------------|----------|
| SEC-SCORE-01 | Repeated correct commands respect cap | Total ≤ `pointsAvailable × 2` |
| SEC-SCORE-02 | Wrong commands cannot drive score negative | `score ≥ 0` always |

---

## 5. Game Flow Integration Tests (`gameFlow.test.js`)

### 5.1 Level 1 — Basic Navigation

| Test ID | Description | Expected |
|---------|-------------|----------|
| GF-L1-01 | `ls` reveals `flag.txt` in secrets | `"flag.txt"` in output |
| GF-L1-02 | Wrong commands deduct score | Negative score entries |
| GF-L1-03 | Score stays capped at `pointsAvailable` | `levelScore ≤ 60` |

---

### 5.2 Level 2 — Reading Files

| Test ID | Description | Expected |
|---------|-------------|----------|
| GF-L2-01 | `cat logs/system.log` succeeds | Contains `"backup"` clue |
| GF-L2-02 | Full play-through finds flag | `flagFound: true` |
| GF-L2-03 | `head` works on log | Content returned |
| GF-L2-04 | `tail` works on log | Content returned |

---

### 5.3 Level 3 — Hidden Files

| Test ID | Description | Expected |
|---------|-------------|----------|
| GF-L3-01 | Normal `ls` doesn't show `.secrets` | Not in output |
| GF-L3-02 | Full flow with `ls -a` finds flag | `flagFound: true` |
| GF-L3-03 | Decoy doesn't contain flag | Flag absent in decoy |

---

### 5.4 Level 4 — Permissions

| Test ID | Description | Expected |
|---------|-------------|----------|
| GF-L4-01 | `flag.txt` locked initially | `success: false` on cat |
| GF-L4-02 | Full flow: `chmod 644 → cat` finds flag | `flagFound: true` |
| GF-L4-03 | `ls -l` shows `----------` for locked file | In output |

---

### 5.5 Level 5 — Searching

| Test ID | Description | Expected |
|---------|-------------|----------|
| GF-L5-01 | `find -name *secret*` locates file | `"secret_data"` in results |
| GF-L5-02 | `grep flag data/secret_data.txt` finds flag | Flag in output |
| GF-L5-03 | Full flow: `find → cat → flag` | `flagFound: true` |

---

### 5.6 Level 6 — Log Analysis

| Test ID | Description | Expected |
|---------|-------------|----------|
| GF-L6-01 | `auth.log` contains attacker trail | `"attacker"` in output |
| GF-L6-02 | `grep backdoor` finds the reference | Match returned |
| GF-L6-03 | Flag is in `tmp/backdoor.sh` | Flag content confirmed |
| GF-L6-04 | Full flow: `tail → cat backdoor.sh` | `flagFound: true` |

---

### 5.7 Level 7 — Final Boss

| Test ID | Description | Expected |
|---------|-------------|----------|
| GF-L7-01 | `ls -a` reveals `.vault` | In output |
| GF-L7-02 | `final_flag.txt` starts locked | `success: false` on cat |
| GF-L7-03 | Full flow: `ls -a → chmod → cat` | `flagFound: true` |
| GF-L7-04 | Mission log points to `.vault` | Path in log content |

---

### 5.8 Timer and Hint System

| Test ID | Description | Expected |
|---------|-------------|----------|
| GF-TIMER-01 | Level 1 limit is 80s | `LEVEL_TIME_LIMITS[1] === 80` |
| GF-TIMER-02 | Level 7 limit is 300s | `LEVEL_TIME_LIMITS[7] === 300` |
| GF-TIMER-03 | All limits are positive | Every value `> 0` |
| GF-HINT-01 | Every level has a non-empty hint | `hint.length > 20` |
| GF-HINT-02 | Hints reference correct concepts | Regex match on key commands |

---

## Known Limitations and Out-of-Scope

The following areas are **not covered** by the automated test suite because they require browser rendering or user interaction, and are instead covered by manual testing:

| Area | Test Type | Notes |
|------|-----------|-------|
| `CongratsOverlay` renders and accepts flag input | Manual / Component | Requires React Testing Library setup |
| `FlagSubmitOverlay` shake animation on wrong input | Manual | Visual/DOM |
| Timer countdown display in Sidebar | Manual | Requires `vi.useFakeTimers()` in React context |
| Sound effects play correctly | Manual | Web Audio API not available in test environment |
| Background music loops | Manual | Web Audio API |
| Tab autocomplete | Manual | Keyboard event simulation |
| ↑/↓ history navigation | Manual | Keyboard events |
| Route navigation (`/gameover`, `/victory`) | Manual | Router integration |
| Congrats overlay pauses the timer | Manual | React state + timer interaction |

---

## Manual Test Checklist

### Game Flow
- [ ] Welcome page loads, "LAUNCH TERMINAL" button visible
- [ ] Clicking launch navigates to `/game`
- [ ] Terminal shows level 1 welcome message with correct time (1:20)
- [ ] `help` shows only `pwd`, `ls`, `cd` for level 1
- [ ] `cat` on level 1 shows "not available on this level" message
- [ ] Navigating to `secrets/` and listing shows `flag.txt`
- [ ] `cat secrets/flag.txt` triggers the **Flag Submit overlay**
- [ ] Typing wrong flag shows shake animation and error message
- [ ] Typing wrong flag multiple times shows attempt counter
- [ ] Typing correct flag shows **Congratulations overlay**
- [ ] Trophy bounces, flag chip shows `✓ flag{...}`, timer shows "TIMER PAUSED ✓"
- [ ] "NEXT LEVEL →" button advances to level 2
- [ ] Level 2 timer shows 2:00 on load
- [ ] All 7 levels completable in sequence
- [ ] Level 7 shows "VIEW RESULTS →" instead of "NEXT LEVEL →"
- [ ] Victory page shows correct score, rank, and certificate
- [ ] "PLAY AGAIN" restarts from level 1

### Timer & Game Over
- [ ] Timer counts down in real time
- [ ] Timer turns yellow at 60 seconds
- [ ] Timer turns red and blinks at 15 seconds
- [ ] Timer warning sound plays at 60s
- [ ] Timer critical beep plays at 15s
- [ ] When timer hits 0, game navigates to `/gameover`
- [ ] Game Over page shows current level and score
- [ ] "TRY AGAIN" on game over restarts from level 1
- [ ] Timer freezes when flag submit overlay is open
- [ ] Timer resumes counting only if player dismisses without submitting (N/A — timer stays paused once level is complete)

### Security (Manual)
- [ ] Typing `sudo rm -rf /` shows sudoers warning, does not crash
- [ ] Typing `ls; cat flag.txt` does not execute `cat` as a second command
- [ ] Refreshing browser mid-game navigates back to welcome (state not persisted)
- [ ] Opening DevTools and modifying React state does not affect flag validation (server-side concern — noted as out of scope for client-only app)

### Sound
- [ ] Background ambient music starts when level loads
- [ ] Correct command plays a chime
- [ ] Wrong/blocked command plays a buzz
- [ ] Flag captured plays a 5-note fanfare
- [ ] Level advance plays an upward arpeggio
- [ ] Hint plays a descending two-tone
- [ ] Game over plays a descending wail
- [ ] Victory plays a fanfare and background music stops

---

## Test Results Summary (Expected)

```
 PASS  src/__tests__/fileSystem.test.js
   pwd (2 tests)
   cd (8 tests)
   ls (9 tests)
   cat (6 tests)
   head and tail (3 tests)
   chmod (5 tests)
   grep (7 tests)
   find (5 tests)
   path resolution (6 tests)

 PASS  src/__tests__/commandEngine.test.js
   parseCommand (8 tests)
   allowed commands (10 tests)
   score cap (3 tests)
   submit command (5 tests)
   auto flag detection (3 tests)
   clue detection (1 test)
   unknown commands (4 tests)
   terminal special commands (4 tests)

 PASS  src/__tests__/levels.test.js
   levels data integrity (10 tests)
   flag reachability per level (21 tests — 3 per level × 7)
   level 1 command restrictions (5 tests)
   level 4 permission challenge (3 tests)
   level 3 hidden files (3 tests)
   scoring constants (2 tests)

 PASS  src/__tests__/security.test.js
   path traversal prevention (5 tests)
   command injection (5 tests)
   privilege escalation attempts (4 tests)
   destructive command blocking (6 tests)
   flag submission security (5 tests)
   boundary and edge input (6 tests)
   score manipulation prevention (2 tests)

 PASS  src/__tests__/gameFlow.test.js
   Level 1 full play-through (3 tests)
   Level 2 full play-through (4 tests)
   Level 3 full play-through (3 tests)
   Level 4 full play-through (3 tests)
   Level 5 full play-through (3 tests)
   Level 6 full play-through (4 tests)
   Level 7 full play-through (4 tests)
   time limits (3 tests)
   hint system (2 tests)

Test Suites: 5 passed
Tests:       120+ passed
```
