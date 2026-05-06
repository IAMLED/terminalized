// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import { LEVELS }  from "../data/levels";

// ── Level dot ─────────────────────────────────────────────────────────────
function LevelDot({ level, current, completed }) {
  const isDone    = completed.includes(level.id);
  const isCurrent = level.id === current;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"6px 10px",
      borderRadius:"6px", background:isCurrent?"#161b22":"transparent",
      border:isCurrent?"1px solid #30363d":"1px solid transparent", transition:"all 0.2s" }}>
      <div style={{ width:20, height:20, borderRadius:"50%", display:"flex",
        alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"bold", flexShrink:0,
        background:isDone?"#50fa7b":isCurrent?"#bd93f9":"#21262d",
        color:isDone||isCurrent?"#0d1117":"#8b949e",
        boxShadow:isCurrent?"0 0 8px #bd93f966":isDone?"0 0 6px #50fa7b55":"none" }}>
        {isDone ? "✓" : level.id}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:"13px", fontWeight:"bold",
          color:isDone?"#50fa7b":isCurrent?"#f8f8f2":"#484f58",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {level.title}
        </div>
        <div style={{ fontSize:"14px", color:"#484f58" }}>
          {level.concepts.slice(0,2).join(", ")}{level.concepts.length>2?"...":""}
        </div>
      </div>
    </div>
  );
}

// ── Score display ─────────────────────────────────────────────────────────
function ScoreDisplay({ score, levelScore, maxScore }) {
  const pct = Math.min(100, maxScore > 0 ? Math.round((levelScore / maxScore) * 100) : 0);
  return (
    <div style={{ padding:"14px 14px 10px", background:"#161b22", borderRadius:"8px",
      border:"1px solid #21262d", marginBottom:"8px" }}>
      <div style={{ fontSize:"15px", color:"#8b949e", letterSpacing:"2px", marginBottom:"4px" }}>SCORE</div>
      <div style={{ fontSize:"30px", fontFamily:"'Orbitron',monospace", fontWeight:"700",
        color:"#f8f8f2", lineHeight:1, marginBottom:"8px" }}>
        {score.toLocaleString()}
      </div>
      <div style={{ fontSize:"15px", color:"#484f58", marginBottom:"4px" }}>
        LEVEL: {levelScore}/{maxScore} pts ({pct}%)
      </div>
      <div style={{ height:4, background:"#21262d", borderRadius:2 }}>
        <div style={{ height:"100%", borderRadius:2, width:`${pct}%`,
          background:pct>=100?"#50fa7b":pct>=60?"#f1fa8c":"#bd93f9",
          transition:"width 0.3s ease" }}/>
      </div>
    </div>
  );
}

// ── Countdown timer ────────────────────────────────────────────────────────
// paused=true freezes the displayed time and suppresses onExpire
function CountdownTimer({ timeLimitSecs, startTime, onExpire, onWarning, paused }) {
  const [remaining, setRemaining] = useState(timeLimitSecs);
  const warnedRef  = useRef(false);
  const critRef    = useRef(false);
  const expiredRef = useRef(false);
  // Track how many seconds had elapsed when we paused, so we can resume correctly
  const pausedAtRef = useRef(null);

  // Reset when level changes
  useEffect(() => {
    warnedRef.current  = false;
    critRef.current    = false;
    expiredRef.current = false;
    pausedAtRef.current = null;
    setRemaining(timeLimitSecs);
  }, [timeLimitSecs, startTime]);

  useEffect(() => {
    if (paused) {
      // Snapshot current remaining so we can resume from here
      pausedAtRef.current = remaining;
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left    = Math.max(0, timeLimitSecs - elapsed);
      setRemaining(left);

      if (left <= 60 && !warnedRef.current)  { warnedRef.current = true;  onWarning?.("warn"); }
      if (left <= 15 && !critRef.current)    { critRef.current = true;    onWarning?.("critical"); }
      if (left === 0  && !expiredRef.current){ expiredRef.current = true; onExpire?.(); }
    }, 500);

    return () => clearInterval(interval);
  }, [timeLimitSecs, startTime, onExpire, onWarning, paused]);

  const mins   = Math.floor(remaining / 60);
  const secs   = (remaining % 60).toString().padStart(2, "0");
  const isWarn = remaining <= 60 && remaining > 15;
  const isCrit = remaining <= 15;

  return (
    <div style={{ padding:"10px 14px", background:"#161b22", borderRadius:"8px",
      border:`1px solid ${isCrit?"#ff555566":isWarn?"#f1fa8c44":"#21262d"}`,
      marginBottom:"8px",
      boxShadow:isCrit?"0 0 12px #ff555533":isWarn?"0 0 8px #f1fa8c22":"none",
      transition:"all 0.3s",
      opacity: paused ? 0.5 : 1 }}>
      <div style={{ fontSize:"9px", letterSpacing:"2px", marginBottom:"4px",
        display:"flex", justifyContent:"space-between",
        color:isCrit?"#ff5555":isWarn?"#f1fa8c":"#8b949e" }}>
        <span>{paused ? "TIMER PAUSED" : "TIME REMAINING"}</span>
        {isCrit && !paused && <span style={{ animation:"blink 0.6s infinite" }}>⚠ CRITICAL</span>}
        {isWarn && !isCrit && !paused && <span>⚠ LOW</span>}
      </div>
      <div style={{ fontSize:"28px", fontFamily:"'Orbitron',monospace", lineHeight:1,
        color:paused?"#50fa7b":isCrit?"#ff5555":isWarn?"#f1fa8c":"#8be9fd",
        textShadow:paused?"0 0 10px #50fa7b66":isCrit?"0 0 12px #ff555588":isWarn?"0 0 8px #f1fa8c66":"none" }}>
        {mins}:{secs}
        {paused && <span style={{ fontSize:"11px", marginLeft:"8px", color:"#50fa7b" }}>✓</span>}
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
export default function Sidebar({ onExpire, onWarning, paused = false }) {
  const { score, levelScore, currentLevel, completedLevels,
          hintsRemaining, levelStartTime, currentLevelData } = useGame();

  return (
    <div style={{ width:"220px", flexShrink:0, display:"flex", flexDirection:"column",
      gap:"4px", fontFamily:"'Share Tech Mono',monospace", overflowY:"auto" }}>

      <ScoreDisplay
        score={score}
        levelScore={levelScore}
        maxScore={currentLevelData.pointsAvailable}
      />

      <CountdownTimer
        timeLimitSecs={currentLevelData.timeLimitSecs}
        startTime={levelStartTime}
        onExpire={onExpire}
        onWarning={onWarning}
        paused={paused}
      />

      {/* Hints */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"8px 12px", background:"#161b22", borderRadius:"6px",
        border:"1px solid #21262d", marginBottom:"4px" }}>
        <span style={{ fontSize:"14px", color:"#8b949e", letterSpacing:"1px" }}>HINTS</span>
        <div style={{ display:"flex", gap:"4px" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width:10, height:10, borderRadius:"50%",
              background:i<hintsRemaining?"#f1fa8c":"#21262d",
              boxShadow:i<hintsRemaining?"0 0 6px #f1fa8c88":"none" }}/>
          ))}
        </div>
      </div>

      {/* Level list */}
      <div style={{ background:"#161b22", borderRadius:"8px", border:"1px solid #21262d",
        padding:"12px 8px", flex:1, overflow:"hidden" }}>
        <div style={{ fontSize:"15px", color:"#8b949e", letterSpacing:"2px",
          marginBottom:"10px", paddingLeft:"10px" }}>LEVELS</div>
        <div style={{ display:"flex",flexDirection:"column", gap:"2px" }}>
          {LEVELS.map(level => (
            <LevelDot  key={level.id} level={level}
              current={currentLevel} completed={completedLevels}/>
          ))}
        </div>
      </div>

      {/* Points guide */}
      <div style={{ background:"#161b22", borderRadius:"6px", border:"1px solid #21262d",
        padding:"10px 12px", marginTop:"4px" }}>
        <div style={{ fontSize:"19px", color:"#8b949e", letterSpacing:"1px", marginBottom:"6px" }}>POINTS</div>
        {[
          ["Correct command","+5"],["Find clue","+10"],["Find flag","+50"],
          ["Complete level","+100"],["Time bonus","+50 max"],
          ["Wrong command","-2"],["Use hint","-10"],["Time expired","-20"],
        ].map(([label, val]) => (
          <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:"2px" }}>
            <span style={{ fontSize:"15px", color:"#484f58" }}>{label}</span>
            <span style={{ fontSize:"15px", color:val.startsWith("+")?"#50fa7b":"#ff5555" }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
