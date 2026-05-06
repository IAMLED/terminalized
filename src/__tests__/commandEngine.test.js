// src/__tests__/commandEngine.test.js
// Unit tests for command parsing, execution, allowed-command enforcement, scoring
// Run with: npx vitest src/__tests__/commandEngine.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseCommand, executeCommand } from "../engine/commandEngine";
import { VirtualFS } from "../engine/fileSystem";

// ── Minimal FS fixture ───────────────────────────────────────────────────────
const SAMPLE_FS = {
  "/home/player": { type:"dir", children:["docs","secure"] },
  "/home/player/docs": { type:"dir", children:["readme.txt","clue.txt"] },
  "/home/player/docs/readme.txt": {
    type:"file", content:"Nothing here.", hidden:false, permissions:"rw-r--r--",
  },
  "/home/player/docs/clue.txt": {
    type:"file", content:"The secret is hidden in /secure/flag.txt", hidden:false, permissions:"rw-r--r--",
  },
  "/home/player/secure": { type:"dir", children:["flag.txt"] },
  "/home/player/secure/flag.txt": {
    type:"file", content:"flag{test_complete}", hidden:false, permissions:"rw-r--r--",
  },
};

const LEVEL_L1 = {
  id: 1, flag: "flag{test_complete}",
  concepts: ["pwd","ls","cd"],
  allowedCommands: ["pwd","ls","cd","help","hint","clear","history"],
  pointsAvailable: 60,
};

const LEVEL_FULL = {
  id: 5, flag: "flag{test_complete}",
  concepts: ["find","grep"],
  allowedCommands: null,   // no restriction
  pointsAvailable: 120,
};

let vfs, onScore;
beforeEach(() => {
  vfs = new VirtualFS(SAMPLE_FS);
  onScore = vi.fn();
});

// ── parseCommand ─────────────────────────────────────────────────────────────
describe("parseCommand", () => {
  it("returns null for empty string", () => {
    expect(parseCommand("")).toBeNull();
    expect(parseCommand("   ")).toBeNull();
  });

  it("parses simple command", () => {
    const p = parseCommand("ls");
    expect(p.cmd).toBe("ls");
    expect(p.args).toEqual([]);
  });

  it("parses command with args", () => {
    const p = parseCommand("ls -la /home");
    expect(p.cmd).toBe("ls");
    expect(p.args).toEqual(["-la", "/home"]);
  });

  it("normalises command to lowercase", () => {
    const p = parseCommand("LS -A");
    expect(p.cmd).toBe("ls");
  });

  it("handles quoted args with spaces", () => {
    const p = parseCommand('grep "hello world" file.txt');
    expect(p.args[0]).toBe("hello world");
    expect(p.args[1]).toBe("file.txt");
  });

  it("handles single-quoted args", () => {
    const p = parseCommand("grep 'flag{' file.txt");
    expect(p.args[0]).toBe("flag{");
  });

  it("preserves raw input", () => {
    const p = parseCommand("cat docs/readme.txt");
    expect(p.raw).toBe("cat docs/readme.txt");
  });
});

// ── Allowed commands enforcement ──────────────────────────────────────────────
describe("allowed commands", () => {
  it("blocks cat on level 1 (only pwd/ls/cd allowed)", () => {
    const r = executeCommand(parseCommand("cat docs/readme.txt"), vfs, LEVEL_L1, onScore, 0);
    expect(r.isError).toBe(true);
    expect(r.output).toMatch(/not available on this level/);
  });

  it("blocks grep on level 1", () => {
    const r = executeCommand(parseCommand("grep flag docs/readme.txt"), vfs, LEVEL_L1, onScore, 0);
    expect(r.isError).toBe(true);
  });

  it("blocks find on level 1", () => {
    const r = executeCommand(parseCommand("find ."), vfs, LEVEL_L1, onScore, 0);
    expect(r.isError).toBe(true);
  });

  it("allows ls on level 1", () => {
    const r = executeCommand(parseCommand("ls"), vfs, LEVEL_L1, onScore, 0);
    expect(r.isError).toBe(false);
  });

  it("allows pwd on level 1", () => {
    const r = executeCommand(parseCommand("pwd"), vfs, LEVEL_L1, onScore, 0);
    expect(r.isError).toBe(false);
    expect(r.output).toBe("/home/player");
  });

  it("allows help regardless of level", () => {
    const r = executeCommand(parseCommand("help"), vfs, LEVEL_L1, onScore, 0);
    expect(r.isError).toBe(false);
  });

  it("allows hint regardless of level", () => {
    const r = executeCommand(parseCommand("hint"), vfs, LEVEL_L1, onScore, 0);
    expect(r.output).toBe("__HINT__");
  });

  it("allows all commands when allowedCommands is null", () => {
    const r = executeCommand(parseCommand("cat docs/readme.txt"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.isError).toBe(false);
  });

  it("deducts score for blocked command", () => {
    executeCommand(parseCommand("cat docs/readme.txt"), vfs, LEVEL_L1, onScore, 0);
    expect(onScore).toHaveBeenCalledWith(expect.any(Number));
    const call = onScore.mock.calls[0][0];
    expect(call).toBeLessThan(0);
  });
});

// ── Score cap ─────────────────────────────────────────────────────────────────
describe("score cap", () => {
  it("awards points when below cap", () => {
    executeCommand(parseCommand("pwd"), vfs, LEVEL_L1, onScore, 0);
    expect(onScore).toHaveBeenCalled();
    const pts = onScore.mock.calls[0][0];
    expect(pts).toBeGreaterThan(0);
  });

  it("awards NO points when at cap", () => {
    // currentLevelScore = pointsAvailable → cap reached
    executeCommand(parseCommand("pwd"), vfs, LEVEL_L1, onScore, LEVEL_L1.pointsAvailable);
    expect(onScore).not.toHaveBeenCalled();
  });

  it("awards NO points when above cap", () => {
    executeCommand(parseCommand("ls"), vfs, LEVEL_L1, onScore, 999);
    expect(onScore).not.toHaveBeenCalled();
  });
});

// ── submit command ────────────────────────────────────────────────────────────
describe("submit command", () => {
  it("accepts correct flag", () => {
    const r = executeCommand(parseCommand("submit flag{test_complete}"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.flagSubmitted).toBe(true);
    expect(r.correct).toBe(true);
    expect(r.isError).toBe(false);
  });

  it("rejects wrong flag", () => {
    const r = executeCommand(parseCommand("submit flag{wrong}"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.flagSubmitted).toBe(true);
    expect(r.correct).toBe(false);
    expect(r.isError).toBe(true);
  });

  it("rejects empty flag", () => {
    const r = executeCommand(parseCommand("submit"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.correct).toBeFalsy();
  });

  it("deducts score for wrong flag submission", () => {
    executeCommand(parseCommand("submit flag{wrong}"), vfs, LEVEL_FULL, onScore, 0);
    const scored = onScore.mock.calls.flat().reduce((a, b) => a + b, 0);
    expect(scored).toBeLessThan(0);
  });

  it("submit is allowed even on restricted levels", () => {
    const r = executeCommand(parseCommand("submit flag{test_complete}"), vfs, LEVEL_L1, onScore, 0);
    expect(r.flagSubmitted).toBe(true);
  });
});

// ── Auto flag detection ───────────────────────────────────────────────────────
describe("auto flag detection (cat output)", () => {
  it("detects flag{} pattern in cat output", () => {
    const r = executeCommand(parseCommand("cat secure/flag.txt"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.flagFound).toBe(true);
    expect(r.correct).toBe(true);
  });

  it("does NOT flag detect on wrong level flag", () => {
    const levelOther = { ...LEVEL_FULL, flag: "flag{different}" };
    const r = executeCommand(parseCommand("cat secure/flag.txt"), vfs, levelOther, onScore, 0);
    expect(r.flagFound).toBeUndefined();
    expect(r.isError).toBe(false);   // normal output, just not the target flag
  });

  it("awards findFlag score on detection", () => {
    executeCommand(parseCommand("cat secure/flag.txt"), vfs, LEVEL_FULL, onScore, 0);
    const awarded = onScore.mock.calls.map(c => c[0]);
    expect(awarded.some(p => p >= 50)).toBe(true);
  });
});

// ── Clue detection ────────────────────────────────────────────────────────────
describe("clue detection", () => {
  it("awards clue bonus when output contains 'hidden'", () => {
    executeCommand(parseCommand("cat docs/clue.txt"), vfs, LEVEL_FULL, onScore, 0);
    const awarded = onScore.mock.calls.map(c => c[0]);
    // Should include at least correctCommand(5) + findClue(10)
    expect(awarded.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(15);
  });
});

// ── Unknown commands ──────────────────────────────────────────────────────────
describe("unknown commands", () => {
  it("returns error for unknown command", () => {
    const r = executeCommand(parseCommand("nmap"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.isError).toBe(true);
    expect(r.output).toMatch(/command not found/);
  });

  it("deducts score for unknown command", () => {
    executeCommand(parseCommand("nmap"), vfs, LEVEL_FULL, onScore, 0);
    const scored = onScore.mock.calls.flat().reduce((a, b) => a + b, 0);
    expect(scored).toBeLessThan(0);
  });

  it("blocks sudo", () => {
    const r = executeCommand(parseCommand("sudo su"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.isError).toBe(false);   // returns message, not error style
    expect(r.output).toMatch(/sudoers/);
  });

  it("blocks rm", () => {
    const r = executeCommand(parseCommand("rm -rf /"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.output).toMatch(/not permitted/);
  });
});

// ── Special terminal commands ─────────────────────────────────────────────────
describe("terminal special commands", () => {
  it("clear returns __CLEAR__ sentinel", () => {
    const r = executeCommand(parseCommand("clear"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.output).toBe("__CLEAR__");
  });

  it("history returns __HISTORY__ sentinel", () => {
    const r = executeCommand(parseCommand("history"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.output).toBe("__HISTORY__");
  });

  it("help includes available commands", () => {
    const r = executeCommand(parseCommand("help"), vfs, LEVEL_FULL, onScore, 0);
    expect(r.output).toMatch(/pwd/);
  });

  it("help on restricted level lists only allowed commands", () => {
    const r = executeCommand(parseCommand("help"), vfs, LEVEL_L1, onScore, 0);
    expect(r.output).toMatch(/pwd/);
    expect(r.output).toMatch(/ls/);
    expect(r.output).toMatch(/cd/);
  });
});
