// src/__tests__/fileSystem.test.js
// Unit tests for VirtualFS engine
// Run with: npx vitest src/__tests__/fileSystem.test.js

import { describe, it, expect, beforeEach } from "vitest";
import { VirtualFS } from "../engine/fileSystem";

// ── Shared fixture ──────────────────────────────────────────────────────────
const SAMPLE_FS = {
  "/home/player": { type: "dir", children: ["docs", "secrets", ".hidden"] },
  "/home/player/docs": { type: "dir", children: ["readme.txt", "notes.txt"] },
  "/home/player/docs/readme.txt": {
    type: "file", content: "Hello World", hidden: false, permissions: "rw-r--r--",
  },
  "/home/player/docs/notes.txt": {
    type: "file", content: "flag{test_flag_here}", hidden: false, permissions: "rw-r--r--",
  },
  "/home/player/secrets": { type: "dir", children: ["locked.txt", "open.txt"] },
  "/home/player/secrets/locked.txt": {
    type: "file", content: "secret data", hidden: false, permissions: "----------", locked: true,
  },
  "/home/player/secrets/open.txt": {
    type: "file", content: "readable", hidden: false, permissions: "rw-r--r--",
  },
  "/home/player/.hidden": {
    type: "dir", hidden: true, children: ["flag.txt"],
  },
  "/home/player/.hidden/flag.txt": {
    type: "file", content: "flag{hidden_flag}", hidden: true, permissions: "rw-r--r--",
  },
};

let vfs;
beforeEach(() => { vfs = new VirtualFS(SAMPLE_FS); });

// ── pwd ─────────────────────────────────────────────────────────────────────
describe("pwd", () => {
  it("returns /home/player on init", () => {
    expect(vfs.pwd()).toBe("/home/player");
  });

  it("updates after cd", () => {
    vfs.cd("docs");
    expect(vfs.pwd()).toBe("/home/player/docs");
  });
});

// ── cd ──────────────────────────────────────────────────────────────────────
describe("cd", () => {
  it("navigates into a subdirectory", () => {
    const r = vfs.cd("docs");
    expect(r.success).toBe(true);
    expect(vfs.cwd).toBe("/home/player/docs");
  });

  it("returns to home on cd with no arg", () => {
    vfs.cd("docs");
    vfs.cd();
    expect(vfs.cwd).toBe("/home/player");
  });

  it("returns to home on cd ~", () => {
    vfs.cd("docs");
    vfs.cd("~");
    expect(vfs.cwd).toBe("/home/player");
  });

  it("navigates up with ..", () => {
    vfs.cd("docs");
    vfs.cd("..");
    expect(vfs.cwd).toBe("/home/player");
  });

  it("rejects non-existent directory", () => {
    const r = vfs.cd("nonexistent");
    expect(r.success).toBe(false);
    expect(r.output).toMatch(/No such file or directory/);
  });

  it("rejects cd into a file", () => {
    vfs.cd("docs");
    const r = vfs.cd("readme.txt");
    expect(r.success).toBe(false);
    expect(r.output).toMatch(/Not a directory/);
  });

  it("handles absolute path", () => {
    const r = vfs.cd("/home/player/docs");
    expect(r.success).toBe(true);
    expect(vfs.cwd).toBe("/home/player/docs");
  });

  it("handles nested relative path", () => {
    const r = vfs.cd("docs");
    expect(r.success).toBe(true);
  });
});

// ── ls ──────────────────────────────────────────────────────────────────────
describe("ls", () => {
  it("lists visible children", () => {
    const r = vfs.ls([]);
    expect(r.success).toBe(true);
    expect(r.output).toContain("docs");
    expect(r.output).toContain("secrets");
  });

  it("does NOT show hidden dirs without -a", () => {
    const r = vfs.ls([]);
    expect(r.output).not.toContain(".hidden");
  });

  it("shows hidden dirs with -a", () => {
    const r = vfs.ls(["-a"]);
    expect(r.output).toContain(".hidden");
  });

  it("shows hidden dirs with -la", () => {
    const r = vfs.ls(["-la"]);
    expect(r.output).toContain(".hidden");
  });

  it("ls -l includes permission string", () => {
    vfs.cd("docs");
    const r = vfs.ls(["-l"]);
    expect(r.success).toBe(true);
    expect(r.output).toMatch(/rw-r--r--/);
  });

  it("ls -l locked file shows --- permissions", () => {
    vfs.cd("secrets");
    const r = vfs.ls(["-l"]);
    expect(r.output).toContain("----------");
  });

  it("returns error for non-existent path", () => {
    const r = vfs.ls(["nodir"]);
    expect(r.success).toBe(false);
  });

  it("lists specific subdirectory", () => {
    const r = vfs.ls(["docs"]);
    expect(r.success).toBe(true);
    expect(r.output).toContain("readme.txt");
  });

  it("includes . and .. when -a is used", () => {
    const r = vfs.ls(["-a"]);
    expect(r.output).toContain(".");
    expect(r.output).toContain("..");
  });
});

// ── cat ─────────────────────────────────────────────────────────────────────
describe("cat", () => {
  it("reads a readable file", () => {
    const r = vfs.cat(["docs/readme.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toBe("Hello World");
  });

  it("is blocked by --- permissions", () => {
    const r = vfs.cat(["secrets/locked.txt"]);
    expect(r.success).toBe(false);
    expect(r.output).toMatch(/Permission denied/);
  });

  it("returns error for missing file", () => {
    const r = vfs.cat(["doesnotexist.txt"]);
    expect(r.success).toBe(false);
    expect(r.output).toMatch(/No such file or directory/);
  });

  it("returns error when cat on directory", () => {
    const r = vfs.cat(["docs"]);
    expect(r.success).toBe(false);
    expect(r.output).toMatch(/Is a directory/);
  });

  it("returns error with no argument", () => {
    const r = vfs.cat([]);
    expect(r.success).toBe(false);
  });

  it("reads file with absolute path", () => {
    const r = vfs.cat(["/home/player/docs/readme.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toBe("Hello World");
  });
});

// ── head / tail ──────────────────────────────────────────────────────────────
describe("head and tail", () => {
  it("head returns first lines", () => {
    const r = vfs.head(["docs/notes.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toContain("flag{test_flag_here}");
  });

  it("tail returns last lines", () => {
    const r = vfs.tail(["docs/notes.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toContain("flag{test_flag_here}");
  });

  it("head is blocked by permissions", () => {
    const r = vfs.head(["secrets/locked.txt"]);
    expect(r.success).toBe(false);
  });
});

// ── chmod ────────────────────────────────────────────────────────────────────
describe("chmod", () => {
  it("unlocks a locked file with 644", () => {
    vfs.chmod(["644", "secrets/locked.txt"]);
    const r = vfs.cat(["secrets/locked.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toBe("secret data");
  });

  it("locks a readable file with 000", () => {
    vfs.chmod(["000", "secrets/open.txt"]);
    const r = vfs.cat(["secrets/open.txt"]);
    expect(r.success).toBe(false);
    expect(r.output).toMatch(/Permission denied/);
  });

  it("returns error for missing file", () => {
    const r = vfs.chmod(["644", "nofile.txt"]);
    expect(r.success).toBe(false);
    expect(r.output).toMatch(/No such file or directory/);
  });

  it("returns error with no args", () => {
    const r = vfs.chmod([]);
    expect(r.success).toBe(false);
  });

  it("correctly maps 755 → rwxr-xr-x", () => {
    vfs.chmod(["755", "secrets/open.txt"]);
    const node = vfs.getNode("/home/player/secrets/open.txt");
    expect(node.permissions).toBe("rwxr-xr-x");
  });
});

// ── grep ─────────────────────────────────────────────────────────────────────
describe("grep", () => {
  it("finds a pattern in a file", () => {
    const r = vfs.grep(["flag", "docs/notes.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toContain("flag{test_flag_here}");
  });

  it("returns empty output when pattern not found", () => {
    const r = vfs.grep(["zzznomatch", "docs/notes.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toBe("");
  });

  it("is case-insensitive", () => {
    const r = vfs.grep(["FLAG", "docs/notes.txt"]);
    expect(r.success).toBe(true);
    expect(r.output.length).toBeGreaterThan(0);
  });

  it("rejects missing file", () => {
    const r = vfs.grep(["flag", "nofile.txt"]);
    expect(r.success).toBe(false);
  });

  it("rejects permission-denied file", () => {
    const r = vfs.grep(["secret", "secrets/locked.txt"]);
    expect(r.success).toBe(false);
    expect(r.output).toMatch(/Permission denied/);
  });

  it("rejects grep on directory", () => {
    const r = vfs.grep(["flag", "docs"]);
    expect(r.success).toBe(false);
  });

  it("returns error if fewer than 2 args", () => {
    const r = vfs.grep(["flag"]);
    expect(r.success).toBe(false);
  });
});

// ── find ─────────────────────────────────────────────────────────────────────
describe("find", () => {
  it("finds file by name pattern", () => {
    const r = vfs.find(["-name", "*.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toContain("readme.txt");
    expect(r.output).toContain("notes.txt");
  });

  it("finds hidden files via -name", () => {
    const r = vfs.find(["-name", "flag.txt"]);
    expect(r.success).toBe(true);
    expect(r.output).toContain("flag.txt");
  });

  it("filters by type f (files only)", () => {
    const r = vfs.find(["-type", "f"]);
    expect(r.success).toBe(true);
    // Dirs should not appear
    expect(r.output).not.toMatch(/^\/home\/player\/docs$/m);
  });

  it("filters by type d (dirs only)", () => {
    const r = vfs.find(["-type", "d"]);
    expect(r.success).toBe(true);
    expect(r.output).toContain("docs");
  });

  it("returns empty string when nothing matches", () => {
    const r = vfs.find(["-name", "zzznomatch"]);
    expect(r.success).toBe(true);
    expect(r.output).toBe("");
  });
});

// ── Path resolution ──────────────────────────────────────────────────────────
describe("path resolution", () => {
  it("resolves relative path", () => {
    expect(vfs.resolvePath("docs")).toBe("/home/player/docs");
  });

  it("resolves absolute path unchanged", () => {
    expect(vfs.resolvePath("/home/player/docs")).toBe("/home/player/docs");
  });

  it("resolves ~ to home", () => {
    expect(vfs.resolvePath("~")).toBe("/home/player");
  });

  it("resolves ~/docs", () => {
    expect(vfs.resolvePath("~/docs")).toBe("/home/player/docs");
  });

  it("resolves .. correctly", () => {
    vfs.cd("docs");
    expect(vfs.resolvePath("..")).toBe("/home/player");
  });

  it("resolves nested .. correctly", () => {
    vfs.cd("docs");
    expect(vfs.resolvePath("../secrets")).toBe("/home/player/secrets");
  });
});
