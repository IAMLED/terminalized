// src/__tests__/levels.test.js
// Validates all 7 level definitions for integrity, reachability, and flag accessibility
// Run with: npx vitest src/__tests__/levels.test.js

import { describe, it, expect } from "vitest";
import { LEVELS, LEVEL_TIME_LIMITS, SCORING } from "../data/levels";
import { VirtualFS } from "../engine/fileSystem";

// ── Structure integrity ───────────────────────────────────────────────────────
describe("levels data integrity", () => {
  it("contains exactly 7 levels", () => {
    expect(LEVELS).toHaveLength(7);
  });

  it("each level has a unique id 1-7", () => {
    const ids = LEVELS.map(l => l.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("every level has required fields", () => {
    LEVELS.forEach(level => {
      expect(level.id,            `L${level.id} id`).toBeDefined();
      expect(level.title,         `L${level.id} title`).toBeTruthy();
      expect(level.flag,          `L${level.id} flag`).toBeTruthy();
      expect(level.hint,          `L${level.id} hint`).toBeTruthy();
      expect(level.mission,       `L${level.id} mission`).toBeTruthy();
      expect(level.concepts,      `L${level.id} concepts`).toBeInstanceOf(Array);
      expect(level.allowedCommands, `L${level.id} allowedCommands`).toBeInstanceOf(Array);
      expect(level.timeLimitSecs, `L${level.id} timeLimitSecs`).toBeGreaterThan(0);
      expect(level.pointsAvailable, `L${level.id} pointsAvailable`).toBeGreaterThan(0);
      expect(level.fileSystem,    `L${level.id} fileSystem`).toBeDefined();
    });
  });

  it("all flags follow the flag{...} format", () => {
    LEVELS.forEach(level => {
      expect(level.flag).toMatch(/^flag\{[a-z0-9_]+\}$/);
    });
  });

  it("all flags are unique across levels", () => {
    const flags = LEVELS.map(l => l.flag);
    const unique = new Set(flags);
    expect(unique.size).toBe(LEVELS.length);
  });

  it("time limits match LEVEL_TIME_LIMITS lookup", () => {
    LEVELS.forEach(level => {
      expect(level.timeLimitSecs).toBe(LEVEL_TIME_LIMITS[level.id]);
    });
  });

  it("time limits are in ascending order", () => {
    const times = LEVELS.map(l => l.timeLimitSecs);
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
    }
  });

  it("pointsAvailable increases with level difficulty", () => {
    // L1 should be lowest, L7 should be highest
    expect(LEVELS[0].pointsAvailable).toBeLessThanOrEqual(LEVELS[6].pointsAvailable);
  });

  it("every allowedCommands list includes help and hint", () => {
    LEVELS.forEach(level => {
      expect(level.allowedCommands).toContain("help");
      expect(level.allowedCommands).toContain("hint");
    });
  });

  it("concepts are a subset of allowedCommands on each level", () => {
    LEVELS.forEach(level => {
      // Each concept should either be in allowedCommands or be a compound like 'ls -a'
      level.concepts.forEach(concept => {
        const baseCmd = concept.split(" ")[0];
        const isAllowed = level.allowedCommands.includes(baseCmd);
        const isAllSkills = concept === "all skills combined";
        expect(isAllowed || isAllSkills, `L${level.id}: concept '${concept}' not in allowedCommands`).toBe(true);
      });
    });
  });
});

// ── File system reachability ──────────────────────────────────────────────────
describe("flag reachability per level", () => {
  LEVELS.forEach(level => {
    it(`L${level.id} (${level.title}): flag.txt exists in file system`, () => {
      const fs = level.fileSystem;
      const flagEntry = Object.entries(fs).find(([, node]) =>
        node.type === "file" && node.content === level.flag
      );
      expect(flagEntry, `No file with content '${level.flag}' in L${level.id}`).toBeTruthy();
    });

    it(`L${level.id}: all child references in fileSystem are valid`, () => {
      const fs = level.fileSystem;
      Object.entries(fs).forEach(([path, node]) => {
        if (node.type === "dir" && node.children) {
          node.children.forEach(child => {
            const childPath = `${path}/${child}`;
            expect(fs[childPath], `Missing child '${childPath}' in L${level.id}`).toBeDefined();
          });
        }
      });
    });

    it(`L${level.id}: /home/player is the root and a directory`, () => {
      const root = level.fileSystem["/home/player"];
      expect(root).toBeDefined();
      expect(root.type).toBe("dir");
    });
  });
});

// ── Level 1 specific: only pwd/ls/cd, no reading commands ────────────────────
describe("level 1 command restrictions", () => {
  const L1 = LEVELS[0];

  it("does not allow cat", () => {
    expect(L1.allowedCommands).not.toContain("cat");
  });

  it("does not allow grep", () => {
    expect(L1.allowedCommands).not.toContain("grep");
  });

  it("does not allow find", () => {
    expect(L1.allowedCommands).not.toContain("find");
  });

  it("does not allow chmod", () => {
    expect(L1.allowedCommands).not.toContain("chmod");
  });

  it("allows pwd, ls, cd", () => {
    expect(L1.allowedCommands).toContain("pwd");
    expect(L1.allowedCommands).toContain("ls");
    expect(L1.allowedCommands).toContain("cd");
  });

  it("flag is accessible by ls navigation alone", () => {
    // Player should be able to reach secrets/flag.txt via ls + cd
    const vfs = new VirtualFS(L1.fileSystem);
    vfs.cd("secrets");
    const ls = vfs.ls([]);
    expect(ls.output).toContain("flag.txt");
  });
});

// ── Level 4 specific: locked permissions ─────────────────────────────────────
describe("level 4 permission challenge", () => {
  const L4 = LEVELS[3];
  let vfs;

  it("flag.txt starts with --- permissions", () => {
    vfs = new VirtualFS(L4.fileSystem);
    vfs.cd("secure");
    const node = vfs.getNode("/home/player/secure/flag.txt");
    expect(node.permissions[0]).not.toBe("r");
  });

  it("cat is blocked before chmod", () => {
    vfs = new VirtualFS(L4.fileSystem);
    const r = vfs.cat(["secure/flag.txt"]);
    expect(r.success).toBe(false);
  });

  it("cat succeeds after chmod 644", () => {
    vfs = new VirtualFS(L4.fileSystem);
    vfs.chmod(["644", "secure/flag.txt"]);
    const r = vfs.cat(["secure/flag.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toBe(L4.flag);
  });
});

// ── Level 3 specific: hidden files ───────────────────────────────────────────
describe("level 3 hidden files", () => {
  const L3 = LEVELS[2];

  it("hidden dirs not visible without -a", () => {
    const vfs = new VirtualFS(L3.fileSystem);
    const r = vfs.ls([]);
    expect(r.output).not.toContain(".secrets");
  });

  it("hidden dirs visible with ls -a", () => {
    const vfs = new VirtualFS(L3.fileSystem);
    const r = vfs.ls(["-a"]);
    expect(r.output).toContain(".secrets");
  });

  it("flag is reachable after ls -a and cd .secrets", () => {
    const vfs = new VirtualFS(L3.fileSystem);
    vfs.cd(".secrets");
    const r = vfs.cat(["flag.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toBe(L3.flag);
  });
});

// ── SCORING constants ─────────────────────────────────────────────────────────
describe("scoring constants", () => {
  it("all scoring values are defined", () => {
    expect(SCORING.correctCommand).toBeGreaterThan(0);
    expect(SCORING.findClue).toBeGreaterThan(0);
    expect(SCORING.findFlag).toBeGreaterThan(0);
    expect(SCORING.completeLevel).toBeGreaterThan(0);
    expect(SCORING.wrongCommand).toBeLessThan(0);
    expect(SCORING.hintUsage).toBeLessThan(0);
  });

  it("findFlag is the largest positive reward", () => {
    expect(SCORING.findFlag).toBeGreaterThanOrEqual(SCORING.correctCommand);
    expect(SCORING.findFlag).toBeGreaterThanOrEqual(SCORING.findClue);
  });
});
