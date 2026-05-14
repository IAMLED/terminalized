// src/engine/fileSystem.js
// Virtual Linux file system engine

export class VirtualFS {
  constructor(fsData) {
    // Deep clone so we can mutate (e.g. chmod)
    this.fs = JSON.parse(JSON.stringify(fsData));
    this.cwd = "/home/hacker";
  }

  // Resolve a path (handles ., .., relative, absolute)
  resolvePath(inputPath) {
    if (!inputPath) return this.cwd;

    // Absolute path
    if (inputPath.startsWith("/")) {
      return this._normalize(inputPath);
    }

    // Home shortcut
    if (inputPath === "~") return "/home/hacker";
    if (inputPath.startsWith("~/")) {
      return this._normalize("/home/hacker/" + inputPath.slice(2));
    }

    // Relative path
    return this._normalize(this.cwd + "/" + inputPath);
  }

  _normalize(path) {
    const parts = path.split("/").filter(Boolean);
    const resolved = [];
    for (const part of parts) {
      if (part === ".") continue;
      if (part === "..") resolved.pop();
      else resolved.push(part);
    }
    return "/" + resolved.join("/");
  }

  getNode(path) {
    return this.fs[path] || null;
  }

  exists(path) {
    return !!this.fs[path];
  }

  isDir(path) {
    const node = this.getNode(path);
    return node && node.type === "dir";
  }

  isFile(path) {
    const node = this.getNode(path);
    return node && node.type === "file";
  }

  canRead(path) {
    const node = this.getNode(path);
    if (!node) return false;
    if (!node.permissions) return true;
    // Check owner read bit (first r after the leading dash)
    return node.permissions[0] === "r";
  }

  // pwd
  pwd() {
    return this.cwd;
  }

  // cd
  cd(targetPath) {
    if (!targetPath || targetPath === "~") {
      this.cwd = "/home/hacker";
      return { success: true, output: "" };
    }

    const resolved = this.resolvePath(targetPath);

    if (!this.exists(resolved)) {
      return { success: false, output: `cd: ${targetPath}: No such file or directory` };
    }

    if (!this.isDir(resolved)) {
      return { success: false, output: `cd: ${targetPath}: Not a directory` };
    }

    this.cwd = resolved;
    return { success: true, output: "" };
  }

  // ls
  ls(args = []) {
    const showHidden = args.includes("-a") || args.includes("-la") || args.includes("-al") || args.includes("-lah");
    const showLong   = args.includes("-l") || args.includes("-la") || args.includes("-al") || args.includes("-lah") || args.includes("-ll");

    // Target path: last non-flag arg
    const pathArg = args.filter(a => !a.startsWith("-")).pop();
    const targetPath = pathArg ? this.resolvePath(pathArg) : this.cwd;

    if (!this.exists(targetPath)) {
      return { success: false, output: `ls: cannot access '${pathArg}': No such file or directory` };
    }

    const node = this.getNode(targetPath);

    if (node.type === "file") {
      if (showLong) {
        const perms = node.permissions || "rw-r--r--";
        return { success: true, output: `-${perms} 1 hacker hacker 128 Jan 15 10:00 ${targetPath.split("/").pop()}` };
      }
      return { success: true, output: targetPath.split("/").pop() };
    }

    // Directory listing
    const children = node.children || [];
    const allChildren = [];

    if (showHidden) {
      allChildren.push(".", "..");
    }

    // Add all child entries
    for (const child of children) {
      const childPath = targetPath + "/" + child;
      const childNode = this.getNode(childPath);
      if (!childNode) continue;
      if (!showHidden && childNode.hidden) continue;
      allChildren.push(child);
    }

    if (allChildren.length === 0) {
      return { success: true, output: "" };
    }

    if (showLong) {
      const lines = [];
      if (showHidden) {
        lines.push(`drwxr-xr-x 2 hacker hacker 4096 Jan 15 10:00 .`);
        lines.push(`drwxr-xr-x 3 hacker hacker 4096 Jan 15 10:00 ..`);
      }
      for (const child of allChildren.filter(c => c !== "." && c !== "..")) {
        const childPath = targetPath + "/" + child;
        const childNode = this.getNode(childPath);
        if (!childNode) continue;
        const isDir   = childNode.type === "dir";
        const perms   = childNode.permissions || (isDir ? "rwxr-xr-x" : "rw-r--r--");
        const prefix  = isDir ? "d" : "-";
        const size    = isDir ? "4096" : "128";
        const display = isDir ? `\x1b[34m${child}/\x1b[0m` : child;
        lines.push(`${prefix}${perms} 1 hacker hacker ${size.padStart(4)} Jan 15 10:00 ${display}`);
      }
      return { success: true, output: lines.join("\n") };
    }

    // Short listing — color dirs
    const formatted = allChildren.map(child => {
      if (child === "." || child === "..") return child;
      const childPath = targetPath + "/" + child;
      const childNode = this.getNode(childPath);
      if (!childNode) return child;
      return childNode.type === "dir" ? `\x1b[34m${child}\x1b[0m` : child;
    });

    // Wrap in columns (simple 3-per-row)
    const chunks = [];
    for (let i = 0; i < formatted.length; i += 4) {
      chunks.push(formatted.slice(i, i + 4).join("  "));
    }
    return { success: true, output: chunks.join("\n") };
  }

  // cat
  cat(args = []) {
    const filePath = args.filter(a => !a.startsWith("-")).pop();
    if (!filePath) return { success: false, output: "cat: missing file operand" };

    const resolved = this.resolvePath(filePath);

    if (!this.exists(resolved)) {
      return { success: false, output: `cat: ${filePath}: No such file or directory` };
    }

    const node = this.getNode(resolved);

    if (node.type === "dir") {
      return { success: false, output: `cat: ${filePath}: Is a directory` };
    }

    if (!this.canRead(resolved)) {
      return { success: false, output: `cat: ${filePath}: Permission denied` };
    }

    return { success: true, output: node.content || "" };
  }

  // less / more / head / tail — simplified variants of cat
  head(args = []) {
    const lines = parseInt(args.find(a => /^\d+$/.test(a))) || 10;
    const fileArgs = args.filter(a => !a.startsWith("-") && !/^\d+$/.test(a));
    const result = this.cat(fileArgs);
    if (!result.success) return result;
    const content = result.output.split("\n").slice(0, lines).join("\n");
    return { success: true, output: content };
  }

  tail(args = []) {
    const lines = parseInt(args.find(a => /^\d+$/.test(a))) || 10;
    const fileArgs = args.filter(a => !a.startsWith("-") && !/^\d+$/.test(a));
    const result = this.cat(fileArgs);
    if (!result.success) return result;
    const content = result.output.split("\n").slice(-lines).join("\n");
    return { success: true, output: content };
  }

  // chmod
  chmod(args = []) {
    const modeArg = args.find(a => /^[0-7]{3,4}$/.test(a));
    const fileArg = args.filter(a => !a.startsWith("-") && !/^[0-7]{3,4}$/.test(a)).pop();

    if (!modeArg || !fileArg) {
      return { success: false, output: "chmod: missing operand\nUsage: chmod <mode> <file>" };
    }

    const resolved = this.resolvePath(fileArg);

    if (!this.exists(resolved)) {
      return { success: false, output: `chmod: cannot access '${fileArg}': No such file or directory` };
    }

    const octal = parseInt(modeArg, 8);
    const perms = this._octalToPerms(octal);
    this.fs[resolved].permissions = perms;
    if (perms[0] === "r") {
      this.fs[resolved].locked = false;
    }

    return { success: true, output: "" };
  }

  _octalToPerms(octal) {
    const bits = octal.toString(8).padStart(3, "0");
    const map = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
    return bits.split("").map(b => map[parseInt(b)]).join("");
  }

  // grep
  grep(args = []) {
    const flags = args.filter(a => a.startsWith("-"));
    const nonFlags = args.filter(a => !a.startsWith("-"));

    if (nonFlags.length < 2) {
      return { success: false, output: "grep: usage: grep <pattern> <file>" };
    }

    const pattern = nonFlags[0];
    const fileArg = nonFlags[1];
    const resolved = this.resolvePath(fileArg);

    if (!this.exists(resolved)) {
      return { success: false, output: `grep: ${fileArg}: No such file or directory` };
    }

    if (!this.canRead(resolved)) {
      return { success: false, output: `grep: ${fileArg}: Permission denied` };
    }

    const node = this.getNode(resolved);
    if (node.type === "dir") {
      return { success: false, output: `grep: ${fileArg}: Is a directory` };
    }

    const content = node.content || "";
    const lines = content.split("\n");
    const matchedLines = lines.filter(line =>
      line.toLowerCase().includes(pattern.toLowerCase())
    );

    if (matchedLines.length === 0) {
      return { success: true, output: "" };
    }

    // Highlight matches
    const highlighted = matchedLines.map(line => {
      return line.replace(
        new RegExp(pattern, "gi"),
        match => `\x1b[33m${match}\x1b[0m`
      );
    });

    return { success: true, output: highlighted.join("\n") };
  }

  // find
  find(args = []) {
    const pathArg = args.find(a => !a.startsWith("-") && a !== "." && !args[args.indexOf(a) - 1]?.includes("-name") && !args[args.indexOf(a) - 1]?.includes("-type"));
    const nameIdx = args.indexOf("-name");
    const typeIdx = args.indexOf("-type");
    const namePattern = nameIdx !== -1 ? args[nameIdx + 1] : null;
    const typeFilter  = typeIdx !== -1 ? args[typeIdx + 1] : null;

    const startPath = pathArg
      ? this.resolvePath(pathArg)
      : this.cwd;

    const results = [];
    this._findRecursive(startPath, namePattern, typeFilter, results);

    if (results.length === 0) return { success: true, output: "" };
    return { success: true, output: results.join("\n") };
  }

  _findRecursive(path, namePattern, typeFilter, results) {
    const node = this.getNode(path);
    if (!node) return;

    const name = path.split("/").pop();

    // Check name pattern (glob-like: *word* → contains, word* → startsWith)
    let nameMatch = true;
    if (namePattern) {
      const pat = namePattern.replace(/"/g, "").replace(/'/g, "");
      const regex = new RegExp(
        "^" + pat.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$",
        "i"
      );
      nameMatch = regex.test(name);
    }

    // Check type
    let typeMatch = true;
    if (typeFilter === "f") typeMatch = node.type === "file";
    if (typeFilter === "d") typeMatch = node.type === "dir";

    if (nameMatch && typeMatch && path !== this.cwd) {
      results.push(path);
    }

    if (node.type === "dir" && node.children) {
      for (const child of node.children) {
        this._findRecursive(path + "/" + child, namePattern, typeFilter, results);
      }
    }
  }

  // echo
  echo(args = []) {
    return { success: true, output: args.join(" ") };
  }

  // whoami
  whoami() {
    return { success: true, output: "hacker" };
  }

  // uname
  uname(args = []) {
    if (args.includes("-a")) {
      return { success: true, output: "Linux terminalised 5.15.0 #1 SMP x86_64 GNU/Linux" };
    }
    return { success: true, output: "Linux" };
  }

  // clear — handled by terminal
  clear() {
    return { success: true, output: "__CLEAR__" };
  }
}
