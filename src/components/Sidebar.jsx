// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";

function LevelDot({ level, current, completed }) {
  const isDone    = completed.includes(level.id);
  const isCurrent = level.id === current;
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all ${isCurrent ? "bg-panel border border-[#30363d]" : "border border-transparent"}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
        ${isDone ? "bg-green text-bg shadow-[0_0_6px_rgba(80,250,123,0.35)]" :
          isCurrent ? "bg-purple text-bg shadow-[0_0_8px_rgba(189,147,249,0.4)]" :
          "bg-[#21262d] text-textMuted"}`}>
        {isDone ? "✓" : level.id}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[11px] font-bold truncate ${isDone ? "text-green" : isCurrent ? "text-[#f8f8f2]" : "text-textDim"}`}>
          {level.title}
        </div>
        <div className="text-[10px] text-textDim truncate">
          {level.concepts.slice(0, 2).join(", ")}{level.concepts.length > 2 ? "…" : ""}
        </div>
      </div>
    </div>
  );
}

function ScoreDisplay({ score, levelScore, maxScore }) {
  const pct = Math.min(100, maxScore > 0 ? Math.round((levelScore / maxScore) * 100) : 0);
  return (
    <div className="panel p-3.5 mb-2">
      <div className="text-[9px] text-textMuted tracking-widest mb-1">SCORE</div>
      <div className="font-orbitron font-bold text-[#f8f8f2] text-2xl sm:text-3xl leading-none mb-2">
        {score.toLocaleString()}
      </div>
      <div className="text-[9px] text-textDim mb-1">
        LEVEL: {levelScore} ({pct}%)
      </div>
      <div className="h-1 bg-[#21262d] rounded">
        <div
          className={`h-full rounded transition-[width] duration-300 ${pct >= 60 ? "bg-yellow" : "bg-purple"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CountdownTimer({ timeLimitSecs, startTime, onExpire, onWarning, paused }) {
  const [remaining, setRemaining] = useState(timeLimitSecs);
  const warnedRef  = useRef(false);
  const critRef    = useRef(false);
  const expiredRef = useRef(false);

  useEffect(() => {
    warnedRef.current = false;
    critRef.current = false;
    expiredRef.current = false;
    setRemaining(timeLimitSecs);
  }, [timeLimitSecs, startTime]);

  useEffect(() => {
    if (paused) return;
    const i = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(0, timeLimitSecs - elapsed);
      setRemaining(left);
      if (left <= 60 && !warnedRef.current)  { warnedRef.current = true; onWarning?.("warn"); }
      if (left <= 15 && !critRef.current)    { critRef.current = true; onWarning?.("critical"); }
      if (left === 0 && !expiredRef.current) { expiredRef.current = true; onExpire?.(); }
    }, 500);
    return () => clearInterval(i);
  }, [timeLimitSecs, startTime, onExpire, onWarning, paused]);

  const mins = Math.floor(remaining / 60);
  const secs = (remaining % 60).toString().padStart(2, "0");
  const isWarn = remaining <= 60 && remaining > 15;
  const isCrit = remaining <= 15;

  const borderCls = isCrit ? "border-red/40" : isWarn ? "border-yellow/30" : "border-border";
  const glow      = isCrit ? "shadow-[0_0_12px_rgba(255,85,85,0.25)]" : isWarn ? "shadow-[0_0_8px_rgba(241,250,140,0.15)]" : "";
  const labelClr  = isCrit ? "text-red" : isWarn ? "text-yellow" : "text-textMuted";
  const numClr    = paused ? "text-green" : isCrit ? "text-red" : isWarn ? "text-yellow" : "text-blue";

  return (
    <div className={`panel-sm bg-panel p-3 mb-2 border ${borderCls} ${glow} transition-all ${paused ? "opacity-60" : ""}`}>
      <div className={`text-[9px] tracking-widest mb-1 flex justify-between ${labelClr}`}>
        <span>{paused ? "TIMER PAUSED" : "TIME REMAINING"}</span>
        {isCrit && !paused && <span className="animate-blink">⚠ CRITICAL</span>}
        {isWarn && !isCrit && !paused && <span>⚠ LOW</span>}
      </div>
      <div className={`font-orbitron text-2xl sm:text-[26px] leading-none ${numClr}`}>
        {mins}:{secs}
        {paused && <span className="ml-2 text-xs text-green">✓</span>}
      </div>
    </div>
  );
}

export default function Sidebar({ onExpire, onWarning, paused = false }) {
  const { levels, score, levelScore, currentLevel, completedLevels,
          hintsRemaining, levelStartTime, currentLevelData } = useGame();

  return (
    <aside className="w-full lg:w-[220px] flex-shrink-0 flex flex-col gap-1 font-mono overflow-y-auto">
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
      <div className="flex justify-between items-center px-3 py-2 panel-sm mb-1">
        <span className="text-[11px] text-textMuted tracking-wide">HINTS</span>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${i < hintsRemaining ? "bg-yellow shadow-[0_0_6px_rgba(241,250,140,0.55)]" : "bg-[#21262d]"}`}
            />
          ))}
        </div>
      </div>

      {/* Levels list */}
      <div className="panel p-2 sm:p-3 flex-1 overflow-hidden">
        <div className="text-[10px] text-textMuted tracking-widest mb-2 pl-2">LEVELS</div>
        <div className="flex flex-col gap-0.5">
          {levels.map(level => (
            <LevelDot
              key={level.id}
              level={level}
              current={currentLevel}
              completed={completedLevels}
            />
          ))}
        </div>
      </div>

      {/* Points guide */}
      <div className="panel-sm p-2.5 mt-1">
        <div className="text-[10px] text-textMuted tracking-widest mb-1.5">POINTS</div>
        {[
          ["Correct command","+5"],["Find clue","+10"],["Capture flag","+50"],
          ["Complete level","+100"],["Time bonus","+100 max"],
          ["Wrong command","-2"],["Use hint","-10"],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between mb-px">
            <span className="text-[9px] text-textDim">{label}</span>
            <span className={`text-[9px] ${val.startsWith("+") ? "text-green" : "text-red"}`}>{val}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
