// src/components/Terminal.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { VirtualFS }                    from "../engine/fileSystem";
import { parseCommand, executeCommand } from "../engine/commandEngine";
import { useGame }                      from "../context/GameContext";
import { SFX }                          from "../engine/soundEngine";
import { SCORING }                      from "../data/levels";

// ── ANSI renderer ──────────────────────────────────────────────────────────
function AnsiText({ text }) {
  if (!text) return null;
  const segments = [];
  const regex = /\x1b\[([0-9;]*)m/g;
  let lastIndex = 0, currentStyle = {}, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex)
      segments.push({ text: text.slice(lastIndex, match.index), style: { ...currentStyle } });
    match[1].split(";").map(Number).forEach(code => {
      if (code === 0)  currentStyle = {};
      if (code === 31) currentStyle.color = "#ff5555";
      if (code === 32) currentStyle.color = "#50fa7b";
      if (code === 33) currentStyle.color = "#f1fa8c";
      if (code === 34) currentStyle.color = "#88c0ff";
      if (code === 35) currentStyle.color = "#bd93f9";
      if (code === 36) currentStyle.color = "#8be9fd";
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length)
    segments.push({ text: text.slice(lastIndex), style: { ...currentStyle } });
  return <>{segments.map((s, i) => <span key={i} style={s.style}>{s.text}</span>)}</>;
}

// ── Line renderer ─────────────────────────────────────────────────────────
function TerminalLine({ entry }) {
  if (entry.type === "input")
    return (
      <div className="flex gap-1.5 mb-0.5">
        <span className="text-green select-none">{entry.prompt}</span>
        <span className="text-[#f8f8f2] break-all">{entry.text}</span>
      </div>
    );
  if (entry.type === "output")
    return (
      <div className="mb-1 whitespace-pre-wrap break-words">
        {(entry.text || "").split("\n").map((line, i) => (
          <div key={i} className={`leading-relaxed ${entry.isError ? "text-red" : "text-text"}`}>
            <AnsiText text={line} />
          </div>
        ))}
      </div>
    );
  if (entry.type === "system")
    return <div className="text-purple italic mb-1">{entry.text}</div>;
  if (entry.type === "success")
    return (
      <div className="mb-1.5 px-3 py-2 rounded border border-green/30 bg-green/[0.04] text-green whitespace-pre-wrap break-words">
        <AnsiText text={entry.text} />
      </div>
    );
  if (entry.type === "error")
    return (
      <div className="mb-1.5 px-3 py-2 rounded border border-red/30 bg-red/[0.04] text-red">
        {entry.text}
      </div>
    );
  if (entry.type === "warning")
    return (
      <div className="mb-1.5 px-3 py-2 rounded border border-yellow/30 bg-yellow/[0.04] text-yellow whitespace-pre-wrap">
        {entry.text}
      </div>
    );
  return null;
}

// ── Flag submission overlay ────────────────────────────────────────────────
// Level 1: bare submit (no flag string needed)
// Levels 2-7: requires typing the exact flag string from the file
function FlagSubmitOverlay({ levelData, onCorrect, onCancel }) {
  const isLevel1 = levelData.id === 1;
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLevel1) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isLevel1]);

  // Level 1 auto-completes immediately — no input required
  useEffect(() => {
    if (isLevel1) {
      const t = setTimeout(() => {
        SFX.flagCapture?.();
        onCorrect();
      }, 250);
      return () => clearTimeout(t);
    }
  }, [isLevel1, onCorrect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed === levelData.flag) {
      SFX.flagCapture?.();
      onCorrect();
    } else {
      SFX.wrongCommand?.();
      setShake(true);
      setAttempts(a => a + 1);
      setTimeout(() => setShake(false), 450);
    }
  };

  if (isLevel1) {
    return (
      <div className="absolute inset-0 z-20 bg-bg/95 flex flex-col items-center justify-center rounded-lg animate-fadeIn p-6">
        <div className="text-5xl mb-3">🎯</div>
        <div className="font-orbitron font-bold text-green text-lg sm:text-xl tracking-[2px] mb-2">
          LOCATION CONFIRMED
        </div>
        <div className="text-textMuted text-xs sm:text-sm text-center">
          You found the directory containing the flag. Capturing now...
        </div>
      </div>
    );
  }

  const wrong = attempts > 0 && value;

  return (
    <div className="absolute inset-0 z-20 bg-bg/95 flex flex-col items-center justify-center rounded-lg animate-fadeIn p-4 sm:p-6">
      <div className="text-4xl sm:text-5xl mb-3" style={{ filter: "drop-shadow(0 0 12px rgba(241,250,140,0.5))" }}>
        🚩
      </div>
      <div className="font-orbitron font-bold text-yellow text-base sm:text-lg tracking-[2px] mb-1.5">
        SUBMIT THE FLAG
      </div>
      <div className="text-textMuted text-xs sm:text-sm mb-5 text-center max-w-sm leading-relaxed">
        Enter the exact flag you saw in the file output to capture it
        and complete this level.
      </div>

      <div className="text-[10px] text-textDim mb-2 font-mono">
        Format: <span className="text-purple">flag&#123;...&#125;</span>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className={shake ? "animate-shake" : ""}>
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="flag{...}"
            autoComplete="off"
            spellCheck={false}
            className={`w-full px-4 py-2.5 sm:py-3 bg-panel border ${wrong ? "border-red" : "border-border focus:border-green"} text-text rounded font-mono text-sm sm:text-base outline-none caret-green transition-colors mb-2`}
          />
          {wrong && (
            <div className="text-red text-[11px] mb-2 font-mono">
              ✗ Incorrect flag — check spelling. {attempts > 1 ? `(${attempts} attempts)` : ""}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost flex-1 py-2 text-[11px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!value.trim()}
            className="btn-primary flex-[2] py-2 text-[11px] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-green animate-pulseBtn"
          >
            Submit Flag
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Congrats overlay ───────────────────────────────────────────────────────
// IMPORTANT: never displays the flag string anywhere
function CongratsOverlay({ levelData, score, totalScore, onNext, isLast }) {
  return (
    <div className="absolute inset-0 z-20 bg-bg/95 flex flex-col items-center justify-center rounded-lg animate-fadeIn p-4 sm:p-6">
      <div className="text-5xl sm:text-6xl mb-3 animate-bounceY" style={{ filter: "drop-shadow(0 0 20px rgba(241,250,140,0.6))" }}>
        🏆
      </div>
      <div className="font-orbitron font-bold text-green text-lg sm:text-2xl tracking-[3px] mb-1 animate-glow">
        CONGRATULATIONS!
      </div>
      <div className="text-textMuted text-xs sm:text-sm mb-6 text-center">
        {isLast
          ? "You've completed Terminalized!"
          : `Level ${levelData.id} of 7 complete — flag captured!`}
      </div>

      <div className="flex gap-6 sm:gap-8 mb-6 sm:mb-7">
        <div className="text-center">
          <div className="text-[9px] sm:text-[10px] text-textDim tracking-widest mb-1">LEVEL SCORE</div>
          <div className="font-orbitron font-bold text-yellow text-xl sm:text-2xl leading-none">
            +{score}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] sm:text-[10px] text-textDim tracking-widest mb-1">TOTAL</div>
          <div className="font-orbitron font-bold text-purple text-xl sm:text-2xl leading-none">
            {totalScore}
          </div>
        </div>
      </div>

      <button onClick={onNext} className="btn-primary px-8 sm:px-11 py-3 text-[12px] sm:text-[13px] animate-pulseBtn">
        {isLast ? "VIEW RESULTS →" : "NEXT LEVEL →"}
      </button>
    </div>
  );
}

function formatTime(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Main Terminal ─────────────────────────────────────────────────────────
export default function Terminal({ onLevelComplete }) {
  const {
    currentLevelData, levelScore, score,
    addScore, completeLevel, nextLevel,
    useHint: consumeHint, addCommand, hintsRemaining,
    totalLevels,
  } = useGame();

  const [lines, setLines]               = useState([]);
  const [input, setInput]               = useState("");
  const [histIdx, setHistIdx]           = useState(-1);
  const [localHistory, setLocalHistory] = useState([]);
  // "idle" | "submit" | "congrats"
  const [overlay, setOverlay]           = useState("idle");

  const vfsRef               = useRef(null);
  const inputRef             = useRef(null);
  const bottomRef            = useRef(null);
  const levelIdRef           = useRef(null);
  // Tracks whether the hacker has done what's needed to be allowed to submit
  const submitUnlockedRef    = useRef(false);

  const prompt = useMemo(() => {
    const cwd = vfsRef.current ? vfsRef.current.pwd() : "/home/hacker";
    return `hacker@terminalized:${cwd.replace("/home/hacker", "~")}$`;
  }, [lines]);

  // ── Init on level change ───────────────────────────────────────────────
  useEffect(() => {
    if (levelIdRef.current === currentLevelData.id) return;
    levelIdRef.current = currentLevelData.id;
    vfsRef.current = new VirtualFS(currentLevelData.fileSystem);
    setOverlay("idle");
    submitUnlockedRef.current = false;
    SFX.bgMusicLevel?.(currentLevelData.id);

    const timeStr = formatTime(currentLevelData.timeLimitSecs);
    const tip = currentLevelData.id === 1
      ? "Spot flag.txt with 'ls', then type 'submit' to capture it."
      : "Use 'cat' on the file containing the flag, then type 'submit' to enter it.";

    setLines([
      { id: Date.now()+0, type:"system", text:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` },
      { id: Date.now()+1, type:"system", text:`  LEVEL ${currentLevelData.id} — ${currentLevelData.title.toUpperCase()}` },
      { id: Date.now()+2, type:"system", text:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` },
      { id: Date.now()+3, type:"output", text:`Commands: ${currentLevelData.concepts.join(", ")}`, isError:false },
      { id: Date.now()+4, type:"output", text:`Time limit: ${timeStr}  ·  Faster captures = bigger bonus`, isError:false },
      { id: Date.now()+5, type:"output", text:`${tip}\n⚠  Time runs out = GAME OVER\n'help' for commands  ·  'hint' for clue (-10 pts)\n`, isError:false },
    ]);
    setInput(""); setHistIdx(-1);
  }, [currentLevelData]);

  // Notify Game.jsx when overlay is active (pauses timer)
  useEffect(() => { onLevelComplete?.(overlay !== "idle"); }, [overlay, onLevelComplete]);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [lines]);

  const addLine = useCallback((entry) => {
    setLines(prev => [...prev, { id:Date.now()+Math.random(), ...entry }]);
  }, []);

  // Correct flag captured → show congrats
  const handleFlagCorrect = useCallback(() => {
    completeLevel();
    setOverlay("congrats");
  }, [completeLevel]);

  // Next level button
  const handleNext = useCallback(() => {
    setOverlay("idle");
    SFX.levelUp?.();
    nextLevel();
  }, [nextLevel]);

  // ── Detect submit-unlock conditions after a successful command ─────────
  // Called AFTER the command runs. Looks at the current vfs state + the
  // result to decide whether to unlock 'submit'.
  const checkSubmitUnlock = useCallback((parsedCmd, result) => {
    if (submitUnlockedRef.current) return;
    const level = currentLevelData;

    if (level.id === 1) {
      // Unlock the moment the hacker SEES flag.txt in any ls output —
      // whether they ran `ls secrets` from /home/hacker or `cd secrets; ls`.
      // We check that the command was an ls variant and that 'flag.txt'
      // appears in its output.
      if (
        parsedCmd?.cmd === "ls" &&
        result?.output && /\bflag\.txt\b/.test(result.output)
      ) {
        submitUnlockedRef.current = true;
        addLine({
          type: "system",
          text: "🎯 flag.txt spotted! Type 'submit' to capture the flag.",
        });
        addScore(SCORING.findFlag);
      }
    } else {
      // Levels 2-7: unlock when the hacker CAT's the file containing the flag.
      if (
        parsedCmd?.cmd && ["cat","head","tail","less","more"].includes(parsedCmd.cmd) &&
        result?.output && result.output.includes(level.flag)
      ) {
        submitUnlockedRef.current = true;
        addLine({
          type: "system",
          text: "🚩 Flag detected in output — type 'submit' to enter it.",
        });
        addScore(SCORING.findFlag);
      }
    }
  }, [currentLevelData, addLine, addScore]);

  // ── Command submit handler ─────────────────────────────────────────────
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (overlay !== "idle") return;
    const raw = input.trim();
    if (!raw) return;

    const currentPrompt = vfsRef.current
      ? `hacker@terminalized:${vfsRef.current.pwd().replace("/home/hacker","~")}$`
      : "hacker@terminalized:~$";

    addLine({ type:"input", prompt:currentPrompt, text:raw });
    addCommand(raw);
    setLocalHistory(prev => [raw, ...prev.slice(0, 99)]);
    setHistIdx(-1);
    setInput("");

    const parsed = parseCommand(raw);

    // Hint command
    if (parsed?.cmd === "hint") {
      if (hintsRemaining <= 0) {
        SFX.wrongCommand?.();
        addLine({ type:"error", text:"No hints remaining." });
        return;
      }
      SFX.hint?.();
      consumeHint();
      addLine({ type:"system", text:`HINT: ${currentLevelData.hint}` });
      return;
    }

    // Bare 'submit' command — gated by submitUnlockedRef
    if (parsed?.cmd === "submit") {
      if (!submitUnlockedRef.current) {
        SFX.wrongCommand?.();
        const msg = currentLevelData.id === 1
          ? "submit: not yet. You need to see flag.txt in a directory listing first (try 'ls')."
          : "submit: no flag found yet. Use 'cat' to read a file containing the flag.";
        addLine({ type:"error", text: msg });
        return;
      }
      setOverlay("submit");
      return;
    }

    const result = executeCommand(parsed, vfsRef.current, currentLevelData, addScore, levelScore);

    if (result.output === "__CLEAR__") { setLines([]); return; }
    if (result.output === "__HISTORY__") {
      const histText = localHistory.slice(0, 20).reverse()
        .map((c, i) => `  ${(i+1).toString().padStart(3)}  ${c}`).join("\n");
      addLine({ type:"output", text:histText || "(no history)", isError:false });
      return;
    }

    if (result.isError) {
      SFX.wrongCommand?.();
      addLine({ type:"error", text:result.output });
      return;
    }

    // Successful command — print output (if any)
    if (result.output) {
      SFX.correctCommand?.();
      addLine({ type:"output", text:result.output, isError:false });
    } else {
      SFX.correctCommand?.();
    }

    // Check whether this command unlocks 'submit' for this level
    checkSubmitUnlock(parsed, result);
  }, [
    input, overlay, currentLevelData, levelScore, addScore,
    consumeHint, hintsRemaining, addCommand, addLine, localHistory, checkSubmitUnlock,
  ]);

  // ── Key handling ───────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (overlay !== "idle") return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx+1, localHistory.length-1);
      setHistIdx(next); setInput(localHistory[next] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIdx - 1;
      if (next < 0) { setHistIdx(-1); setInput(""); }
      else { setHistIdx(next); setInput(localHistory[next] || ""); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!vfsRef.current || !input) return;
      const parts   = input.split(" ");
      const partial = parts[parts.length - 1];
      if (!partial) return;
      const dir  = partial.includes("/")
        ? vfsRef.current.resolvePath(partial.substring(0, partial.lastIndexOf("/")+1))
        : vfsRef.current.pwd();
      const frag = partial.includes("/") ? partial.split("/").pop() : partial;
      const node = vfsRef.current.getNode(dir);
      if (!node || node.type !== "dir") return;
      const matches = (node.children || []).filter(c => c.startsWith(frag));
      if (matches.length === 1) {
        parts[parts.length-1] = partial.substring(0, partial.length-frag.length)+matches[0];
        setInput(parts.join(" "));
      } else if (matches.length > 1) {
        addLine({ type:"output", text:matches.join("  "), isError:false });
      }
    }
  }, [overlay, histIdx, localHistory, input, addLine]);

  const isLastLevel = currentLevelData.id === totalLevels;

  return (
    <div
      className="relative flex flex-col h-full bg-bg border border-border rounded-lg overflow-hidden font-mono text-[12px] sm:text-[13px]"
      onClick={() => overlay === "idle" && inputRef.current?.focus()}
    >
      {overlay === "submit" && (
        <FlagSubmitOverlay
          levelData={currentLevelData}
          onCorrect={handleFlagCorrect}
          onCancel={() => setOverlay("idle")}
        />
      )}
      {overlay === "congrats" && (
        <CongratsOverlay
          levelData={currentLevelData}
          score={levelScore}
          totalScore={score}
          onNext={handleNext}
          isLast={isLastLevel}
        />
      )}

      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-panel border-b border-border select-none">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-textMuted text-[10px] sm:text-[11px] truncate">
          hacker@terminalized — Level {currentLevelData.id}: {currentLevelData.title}
        </span>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-3.5">
        {lines.map(line => <TerminalLine key={line.id} entry={line} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center px-3 sm:px-4 py-2.5 border-t border-border bg-bg gap-2 transition-opacity ${overlay !== "idle" ? "opacity-30 pointer-events-none" : ""}`}
      >
        <span className="text-green whitespace-nowrap text-[11px] sm:text-[12px] truncate max-w-[55%] sm:max-w-none">
          {prompt}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"
          disabled={overlay !== "idle"}
          className="flex-1 bg-transparent border-none outline-none text-[#f8f8f2] font-mono text-[12px] sm:text-[13px] caret-green min-w-0"
        />
      </form>
    </div>
  );
}
