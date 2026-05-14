// src/engine/commandEngine.js

import { SCORING } from "../data/levels";

const LEARNING_COMMANDS = new Set(["ls","cd","cat","less","head","tail","chmod","grep","find","pwd"]);

const CLUE_PATTERNS = [
  /\bhidden\b/i, /\bflag\b/i, /\bsecret\b/i, /\bstored in\b/i,
  /\baccess granted\b/i, /\bbackdoor\b/i, /\bclassified\b/i,
];

export function parseCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const tokens = [];
  let current = "", inQuote = false, quoteChar = "";

  for (const ch of trimmed) {
    if ((ch === '"' || ch === "'") && !inQuote) { inQuote = true; quoteChar = ch; }
    else if (ch === quoteChar && inQuote) { inQuote = false; tokens.push(current); current = ""; }
    else if (ch === " " && !inQuote) { if (current) { tokens.push(current); current = ""; } }
    else { current += ch; }
  }
  if (current) tokens.push(current);

  const [cmd, ...args] = tokens;
  return { cmd: cmd?.toLowerCase(), args, raw: trimmed };
}

export function executeCommand(parsed, vfs, level, onScore, currentLevelScore) {
  if (!parsed) return { output: "", isError: false };

  const { cmd, args } = parsed;

  // ── Allowed command enforcement ─────────────────────────────────────
  const allowed = level.allowedCommands || null;
  const baseCmd = cmd; // e.g. "ls", "cd"
  if (allowed && !["hint","help","clear","history","submit"].includes(baseCmd) && !allowed.includes(baseCmd)) {
    onScore(SCORING.wrongCommand);
    const learnable = level.concepts.join(", ");
    return {
      output: `${cmd}: not available on this level.\nThis level teaches: ${learnable}\nType 'help' to see what's available.`,
      isError: true,
    };
  }

  // ── Score cap: don't award points if already at/above pointsAvailable ──
  const capReached = currentLevelScore >= level.pointsAvailable;

  const scoreIfAllowed = (pts) => {
    if (!capReached) onScore(pts);
  };

  // ── Special commands ──────────────────────────────────────────────────
  if (cmd === "submit") {
    const submittedFlag = args.join("").trim();
    if (submittedFlag === level.flag) {
      scoreIfAllowed(SCORING.findFlag);
      return {
        output: `\x1b[32m✓ FLAG ACCEPTED: ${submittedFlag}\x1b[0m\nLevel complete! Preparing next mission...`,
        isError: false, flagSubmitted: true, correct: true,
      };
    } else {
      onScore(SCORING.wrongCommand);
      return {
        output: `\x1b[31m✗ Incorrect flag: ${submittedFlag}\x1b[0m\nKeep looking...`,
        isError: true, flagSubmitted: true, correct: false,
      };
    }
  }

  if (cmd === "hint") return { output: "__HINT__", isError: false };
  if (cmd === "clear") return { output: "__CLEAR__", isError: false };
  if (cmd === "history") return { output: "__HISTORY__", isError: false };

  if (cmd === "help") {
    const cmds = allowed
      ? allowed.filter(c => !["hint","help","clear","history"].includes(c))
      : ["pwd","ls","cd","cat","head","tail","less","chmod","grep","find","echo","whoami"];
    return {
      output: `Terminalized — Level ${level.id} Commands\n${"=".repeat(40)}\n` +
        cmds.map(c => `  ${c}`).join("\n") +
        `\n\n  hint             Use a hint (-10 points)\n` +
        `  clear            Clear terminal screen\n` +
        `  history          Show command history\n` +
        `  help             Show this message\n\n` +
        (level.allowedCommands ? `Only level-appropriate commands are available.` : ""),
      isError: false,
    };
  }

  // ── File system commands ──────────────────────────────────────────────
  let result;

  switch (cmd) {
    case "pwd":   result = { success: true, output: vfs.pwd() }; break;
    case "ls":    result = vfs.ls(args); break;
    case "cd":    result = vfs.cd(args[0]); break;
    case "cat":
    case "less":
    case "more":  result = vfs.cat(args); break;
    case "head":  result = vfs.head(args); break;
    case "tail":  result = vfs.tail(args); break;
    case "chmod": result = vfs.chmod(args); break;
    case "grep":  result = vfs.grep(args); break;
    case "find":  result = vfs.find(args); break;
    case "echo":  result = vfs.echo(args); break;
    case "whoami":result = vfs.whoami(); break;
    case "uname": result = vfs.uname(args); break;
    case "man":   result = { success: true, output: `man: No manual entry for ${args[0]||""}. Try 'help'.` }; break;
    case "mkdir":
    case "rm":
    case "mv":
    case "cp":
    case "touch": result = { success: true, output: `${cmd}: operation not permitted in this environment` }; break;
    case "sudo":  result = { success: false, output: "sudo: you are not in the sudoers file. This incident will be reported." }; break;
    case "exit":
    case "logout":result = { success: false, output: "You can't leave yet. Finish your mission." }; break;
    case "":      return { output: "", isError: false };
    default:
      onScore(SCORING.wrongCommand);
      return { output: `${cmd}: command not found\nType 'help' to see available commands.`, isError: true };
  }

  // ── Scoring ──────────────────────────────────────────────────────────
  // Award points for valid learning commands and for finding clue keywords.
  // We do NOT inject any flag-related text into output — the Terminal
  // component handles flag-detection itself, so the flag string never
  // appears in any auto-generated success banner.
  if (result.success && LEARNING_COMMANDS.has(cmd)) {
    scoreIfAllowed(SCORING.correctCommand);

    const rawOutput = result.output || "";
    if (CLUE_PATTERNS.some(pat => pat.test(rawOutput))) {
      scoreIfAllowed(SCORING.findClue);
    }
  }

  return { success: !result.isError && result.success, output: result.output || "", isError: !result.success };
}
