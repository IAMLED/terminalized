// src/components/Terminal.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { VirtualFS }                    from "../engine/fileSystem";
import { parseCommand, executeCommand } from "../engine/commandEngine";
import { useGame }                      from "../context/GameContext";
import { SFX }                          from "../engine/soundEngine";

// ── ANSI renderer ─────────────────────────────────────────────────────────
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
  const base = { marginBottom: "4px", whiteSpace: "pre-wrap", wordBreak: "break-word" };
  if (entry.type === "input")
    return (
      <div style={{ display:"flex", gap:"6px", marginBottom:"2px" }}>
        <span style={{ color:"#50fa7b", userSelect:"none" }}>{entry.prompt}</span>
        <span style={{ color:"#f8f8f2" }}>{entry.text}</span>
      </div>
    );
  if (entry.type === "output")
    return (
      <div style={base}>
        {(entry.text || "").split("\n").map((line, i) => (
          <div key={i} style={{ color:entry.isError?"#ff5555":"#c8d0e0", lineHeight:"1.5" }}>
            <AnsiText text={line} />
          </div>
        ))}
      </div>
    );
  if (entry.type === "system")
    return <div style={{ color:"#bd93f9", marginBottom:"4px", fontStyle:"italic" }}>{entry.text}</div>;
  if (entry.type === "success")
    return (
      <div style={{ color:"#50fa7b", marginBottom:"6px", padding:"8px 12px",
        border:"1px solid #50fa7b44", borderRadius:"4px", background:"#50fa7b0a", ...base }}>
        <AnsiText text={entry.text} />
      </div>
    );
  if (entry.type === "error")
    return (
      <div style={{ color:"#ff5555", marginBottom:"6px", padding:"8px 12px",
        border:"1px solid #ff555544", borderRadius:"4px", background:"#ff55550a" }}>
        {entry.text}
      </div>
    );
  if (entry.type === "warning")
    return (
      <div style={{ color:"#f1fa8c", marginBottom:"6px", padding:"8px 12px",
        border:"1px solid #f1fa8c44", borderRadius:"4px", background:"#f1fa8c08", ...base }}>
        {entry.text}
      </div>
    );
  return null;
}

// ── Flag Submit + Congratulations overlay ──────────────────────────────────
// Shows BEFORE congratulations — player must type the flag they found to proceed
function FlagSubmitOverlay({ levelData, onCorrect }) {
  const [value, setValue]       = useState("");
  const [shake, setShake]       = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef                = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

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
      setTimeout(() => setShake(false), 500);
    }
  };

  const wrong = attempts > 0;

  return (
    <div style={{
      position:"absolute", inset:0, zIndex:10,
      background:"rgba(13,17,23,0.95)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      borderRadius:"8px",
      animation:"overlayIn 0.3s ease both",
    }}>
      <style>{`
        @keyframes overlayIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 #50fa7b33} 50%{box-shadow:0 0 0 10px transparent} }
        .flag-submit-btn:hover:not(:disabled) { background:#50fa7b !important; color:#0d1117 !important; }
        .flag-submit-btn:disabled { opacity:0.35; cursor:not-allowed; }
      `}</style>

      {/* Lock icon */}
      <div style={{ fontSize:"44px", marginBottom:"12px",
        filter:"drop-shadow(0 0 12px #f1fa8c88)" }}>
        🔍
      </div>

      {/* Title */}
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"18px", fontWeight:"700",
        color:"#f1fa8c", letterSpacing:"2px", marginBottom:"6px",
        textShadow:"0 0 16px #f1fa8c66" }}>
        FLAG FOUND
      </div>
      <div style={{ color:"#8b949e", fontSize:"12px", marginBottom:"24px",
        textAlign:"center", maxWidth:"340px", lineHeight:"1.6" }}>
        You discovered the flag file. Now type the exact flag string below to capture it
        and complete this level.
      </div>

      {/* Hint about format */}
      <div style={{ fontSize:"11px", color:"#484f58", marginBottom:"10px", fontFamily:"'Share Tech Mono',monospace" }}>
        Format: <span style={{ color:"#bd93f9" }}>flag&#123;...&#125;</span>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} style={{ width:"100%", maxWidth:"380px", padding:"0 24px" }}>
        <div style={{
          animation: shake ? "shake 0.4s ease" : "none",
          marginBottom:"12px",
        }}>
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="flag{...}"
            autoComplete="off"
            spellCheck={false}
            style={{
              width:"100%",
              padding:"12px 16px",
              background:"#161b22",
              border:`1.5px solid ${wrong && value ? "#ff5555" : "#30363d"}`,
              borderRadius:"6px",
              color:"#f8f8f2",
              fontFamily:"'Share Tech Mono','Courier New',monospace",
              fontSize:"14px",
              outline:"none",
              boxSizing:"border-box",
              transition:"border-color 0.2s",
              caretColor:"#50fa7b",
            }}
            onFocus={e => e.target.style.borderColor = "#50fa7b"}
            onBlur={e => e.target.style.borderColor = wrong && value ? "#ff5555" : "#30363d"}
          />
          {wrong && value && (
            <div style={{ color:"#ff5555", fontSize:"11px", marginTop:"6px",
              fontFamily:"'Share Tech Mono',monospace" }}>
              ✗ Incorrect flag — check spelling and case. {attempts > 1 ? `(${attempts} attempts)` : ""}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="flag-submit-btn"
          disabled={!value.trim()}
          style={{
            width:"100%",
            padding:"12px",
            fontFamily:"'Orbitron',monospace", fontWeight:"700",
            fontSize:"13px", letterSpacing:"2px",
            background:"transparent",
            border:"2px solid #50fa7b", color:"#50fa7b",
            borderRadius:"6px", cursor:"pointer",
            transition:"all 0.2s",
            animation: value.trim() ? "pulse 2s ease-in-out infinite" : "none",
          }}>
          SUBMIT FLAG
        </button>
      </form>

      {/* Hint */}
      <div style={{ marginTop:"20px", color:"#2a3040", fontSize:"10px",
        fontFamily:"'Share Tech Mono',monospace" }}>
        Tip: copy the exact string from the file you just read
      </div>
    </div>
  );
}

// ── Congratulations overlay (shown AFTER correct flag submission) ──────────
function CongratsOverlay({ levelData, score, onNext, reason = 'flag' }) {
  const isLast = levelData.id === 7;
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:11,
      background:"rgba(13,17,23,0.95)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      borderRadius:"8px",
      animation:"congratsIn 0.4s ease both",
    }}>
      <style>{`
        @keyframes congratsIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes congratsPulse { 0%,100%{box-shadow:0 0 0 0 #50fa7b44} 50%{box-shadow:0 0 0 14px transparent} }
        @keyframes trophyBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .next-btn:hover { background:#50fa7b !important; color:#0d1117 !important; transform:scale(1.04) !important; }
      `}</style>

      {/* Trophy */}
      <div style={{ fontSize:"56px", marginBottom:"14px",
        animation:"trophyBounce 1.5s ease-in-out infinite",
        filter:"drop-shadow(0 0 20px #f1fa8c88)" }}>🏆</div>

      {/* Heading */}
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"22px", fontWeight:"700",
        color:"#50fa7b", letterSpacing:"3px", marginBottom:"6px",
        textShadow:"0 0 24px #50fa7b88" }}>
        CONGRATULATIONS!
      </div>
      <div style={{ color:"#8b949e", fontSize:"12px", marginBottom:"8px" }}>
        {isLast
          ? "You've completed Terminal Quest!"
          : reason === "maxscore"
          ? `Level ${levelData.id} complete — max score earned!`
          : `Level ${levelData.id} of 7 complete — flag captured!`}
      </div>

      {/* Flag chip */}
      <div style={{ padding:"8px 18px", background:"#50fa7b0d",
        border:"1px solid #50fa7b44", borderRadius:"6px",
        fontFamily:"'Share Tech Mono',monospace", fontSize:"12px",
        color:"#50fa7b", marginBottom:"22px", letterSpacing:"1px" }}>
        ✓ {levelData.flag}
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:"28px", marginBottom:"30px" }}>
        {[
          { label:"LEVEL SCORE", val:score.toLocaleString(), color:"#f1fa8c" },
          { label:"LEVEL",       val:`${levelData.id}/7`,   color:"#bd93f9" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ textAlign:"center" }}>
            <div style={{ fontSize:"9px", color:"#484f58", letterSpacing:"1px", marginBottom:"4px" }}>{label}</div>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"22px",
              fontWeight:"700", color, lineHeight:1 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Next button */}
      <button className="next-btn" onClick={onNext} style={{
        padding:"13px 44px",
        fontFamily:"'Orbitron',monospace", fontWeight:"700",
        fontSize:"14px", letterSpacing:"2px",
        background:"transparent",
        border:"2px solid #50fa7b", color:"#50fa7b",
        borderRadius:"6px", cursor:"pointer",
        transition:"all 0.2s",
        animation:"congratsPulse 2s ease-in-out infinite",
      }}>
        {isLast ? "VIEW RESULTS →" : "NEXT LEVEL →"}
      </button>
    </div>
  );
}

function formatTime(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Main Terminal ──────────────────────────────────────────────────────────
export default function Terminal({ onLevelComplete }) {
  const {
    currentLevelData, levelScore,
    addScore, completeLevel, nextLevel,
    useHint: consumeHint, addCommand, hintsRemaining,
  } = useGame();

  const [lines, setLines]               = useState([]);
  const [input, setInput]               = useState("");
  const [histIdx, setHistIdx]           = useState(-1);
  const [localHistory, setLocalHistory] = useState([]);
  // "idle" | "submit" (flag input shown) | "congrats" (success shown)
  const [overlay, setOverlay]           = useState("idle");
  const [overlayReason, setOverlayReason] = useState("flag"); // "flag" | "maxscore"

  const vfsRef     = useRef(null);
  const inputRef   = useRef(null);
  const bottomRef  = useRef(null);
  const levelIdRef = useRef(null);
  const maxScoreTriggeredRef = useRef(false);
  const flagDiscoveredRef    = useRef(false);

  const prompt = useMemo(() => {
    const cwd = vfsRef.current ? vfsRef.current.pwd() : "/home/player";
    return `player@terminalquest:${cwd.replace("/home/player", "~")}$`;
  }, [lines]);

  // ── Init on level change ───────────────────────────────────────────────
  useEffect(() => {
    if (levelIdRef.current === currentLevelData.id) return;
    levelIdRef.current = currentLevelData.id;
    vfsRef.current = new VirtualFS(currentLevelData.fileSystem);
    setOverlay("idle");
    SFX.bgMusicLevel?.(currentLevelData.id);

    const timeStr = formatTime(currentLevelData.timeLimitSecs);
    setLines([
      { id: Date.now()+0, type:"system", text:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` },
      { id: Date.now()+1, type:"system", text:`  LEVEL ${currentLevelData.id} — ${currentLevelData.title.toUpperCase()}` },
      { id: Date.now()+2, type:"system", text:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` },
      { id: Date.now()+3, type:"output", text:`Commands: ${currentLevelData.concepts.join(", ")}`, isError:false },
      { id: Date.now()+4, type:"output", text:`Time limit: ${timeStr}  ·  Max score: ${currentLevelData.pointsAvailable} pts`, isError:false },
      { id: Date.now()+5, type:"output", text:`⚠  Time runs out = GAME OVER\n'help' for commands  ·  'hint' for clue (-10 pts)\n${currentLevelData.id === 1 ? "Tip: find flag.txt with ls/cd, then type: submit flag{...}\n" : ""}`, isError:false },
    ]);
    setInput(""); setHistIdx(-1);
  }, [currentLevelData]);

  // ── Notify Game.jsx when overlay is active (pauses timer) ─────────────
  useEffect(() => {
    onLevelComplete?.(overlay !== "idle");
  }, [overlay, onLevelComplete]);

  // ── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [lines]);

  const addLine = useCallback((entry) => {
    setLines(prev => [...prev, { id:Date.now()+Math.random(), ...entry }]);
  }, []);

  // ── Auto-complete when max score is reached ────────────────────────────
  // Fires when a player earns all available points through correct commands
  // (e.g. Level 1 where cat is unavailable). Goes straight to congrats —
  // no flag-submit step needed since mastery is already proven by score.
  useEffect(() => {
    if (overlay !== "idle") return;
    if (maxScoreTriggeredRef.current) return;
    if (levelScore >= currentLevelData.pointsAvailable && currentLevelData.pointsAvailable > 0) {
      maxScoreTriggeredRef.current = true;
      const t = setTimeout(() => {
        SFX.flagCapture?.();
        addLine({ type:"system", text:"✅ Maximum score reached — level complete!" });
        completeLevel(false);
        setOverlayReason("maxscore");
        setOverlay("congrats");
      }, 400);
      return () => clearTimeout(t);
    }
  }, [levelScore, currentLevelData.pointsAvailable, currentLevelData.id, overlay, completeLevel, addLine]);

  // Reset guards whenever the level changes
  useEffect(() => {
    maxScoreTriggeredRef.current = false;
    flagDiscoveredRef.current    = false;
  }, [currentLevelData.id]);

  // ── Correct flag typed in overlay → show congrats ──────────────────────
  const handleFlagCorrect = useCallback(() => {
    completeLevel(false);
    setOverlayReason("flag");
    setOverlay("congrats");
  }, [completeLevel]);

  // ── Next level button on congrats ──────────────────────────────────────
  const handleNext = useCallback(() => {
    setOverlay("idle");
    SFX.levelUp?.();
    nextLevel();
  }, [nextLevel]);

  // ── Command submit ─────────────────────────────────────────────────────
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (overlay !== "idle") return;
    const raw = input.trim();
    if (!raw) return;

    const currentPrompt = vfsRef.current
      ? `player@terminalquest:${vfsRef.current.pwd().replace("/home/player","~")}$`
      : "player@terminalquest:~$";

    addLine({ type:"input", prompt:currentPrompt, text:raw });
    addCommand(raw);
    setLocalHistory(prev => [raw, ...prev.slice(0, 99)]);
    setHistIdx(-1);
    setInput("");

    const parsed = parseCommand(raw);

    // Hint
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

    // Bare 'submit' command (no args) opens the flag-submit modal
    // — but only after the player has actually discovered the flag.
    if (parsed?.cmd === "submit" && parsed.args.length === 0) {
      if (!flagDiscoveredRef.current) {
        SFX.wrongCommand?.();
        addLine({
          type: "error",
          text: "submit: no flag discovered yet. Read or search for the flag file first.",
        });
        return;
      }
      // Open the modal so the player can type the flag they just read
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

    if (result.output) {
      // Flag was found in output (cat/grep etc.) — show content and unlock submit,
      // but DO NOT open the submit modal yet. Player should be able to read the
      // flag, then type 'submit' themselves when ready.
      if (result.flagFound) {
        SFX.correctCommand?.();
        flagDiscoveredRef.current = true;
        // Show just the file content (strip the auto-appended capture message)
        const content = result.output.split("\n\n")[0];
        addLine({ type:"success", text:content });
        addLine({ type:"system",  text:"🚩 Flag detected in output — type 'submit' when you're ready to capture it." });
      } else if (result.isError) {
        SFX.wrongCommand?.();
        addLine({ type:"error", text:result.output });
      } else {
        SFX.correctCommand?.();
        addLine({ type:"output", text:result.output, isError:false });
      }
    }
  }, [input, overlay, currentLevelData, levelScore, addScore,
      consumeHint, hintsRemaining, addCommand, addLine, localHistory]);

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

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%",
      background:"#0d1117", borderRadius:"8px", overflow:"hidden",
      border:"1px solid #21262d", position:"relative",
      fontFamily:"'Share Tech Mono','Courier New',monospace", fontSize:"13px" }}
      onClick={() => overlay === "idle" && inputRef.current?.focus()}>

      {/* Flag submission overlay */}
      {overlay === "submit" && (
        <FlagSubmitOverlay
          levelData={currentLevelData}
          onCorrect={handleFlagCorrect}
        />
      )}

      {/* Congratulations overlay */}
      {overlay === "congrats" && (
        <CongratsOverlay
          levelData={currentLevelData}
          score={levelScore}
          onNext={handleNext}
          reason={overlayReason}
        />
      )}

      {/* Title bar */}
      <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px",
        background:"#161b22", borderBottom:"1px solid #21262d", userSelect:"none" }}>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#ff5f56" }}/>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#ffbd2e" }}/>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#27c93f" }}/>
        <span style={{ marginLeft:8, color:"#8b949e", fontSize:"11px" }}>
          player@terminalquest — Level {currentLevelData.id}: {currentLevelData.title}
        </span>
      </div>

      {/* Output */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px",
        scrollbarWidth:"thin", scrollbarColor:"#30363d #0d1117" }}>
        {lines.map(line => <TerminalLine key={line.id} entry={line} />)}
        <div ref={bottomRef}/>
      </div>

      {/* Input — dimmed when overlay active */}
      <form onSubmit={handleSubmit}
        style={{ display:"flex", alignItems:"center", padding:"10px 16px",
          borderTop:"1px solid #21262d", background:"#0d1117", gap:"8px",
          opacity: overlay !== "idle" ? 0.3 : 1, transition:"opacity 0.2s",
          pointerEvents: overlay !== "idle" ? "none" : "auto" }}>
        <span style={{ color:"#50fa7b", whiteSpace:"nowrap", fontSize:"12px" }}>{prompt}</span>
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"
          disabled={overlay !== "idle"}
          style={{ flex:1, background:"transparent", border:"none", outline:"none",
            color:"#f8f8f2", fontFamily:"'Share Tech Mono','Courier New',monospace",
            fontSize:"13px", caretColor:"#50fa7b" }}/>
      </form>
    </div>
  );
}
