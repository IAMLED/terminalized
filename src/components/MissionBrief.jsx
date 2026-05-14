// src/components/MissionBrief.jsx
import React, { useState } from "react";
import { useGame } from "../context/GameContext";

export default function MissionBrief() {
  const { currentLevelData, currentLevel, totalLevels } = useGame();
  const [collapsed, setCollapsed] = useState(false);
  const pct = ((currentLevel - 1) / totalLevels) * 100;

  return (
    <div className="panel overflow-hidden mb-2.5 font-mono">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex w-full items-center justify-between px-3 sm:px-4 py-2.5 bg-transparent border-0 text-[#f8f8f2] font-mono"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-2 py-0.5 bg-purple/20 border border-purple/40 rounded text-[10px] text-purple tracking-wide flex-shrink-0">
            LVL {currentLevelData.id}/{totalLevels}
          </span>
          <span className="text-[12px] sm:text-sm font-bold text-[#f8f8f2] truncate">
            {currentLevelData.title}
          </span>
          <span className="hidden sm:inline text-[11px] text-textMuted truncate">
            — {currentLevelData.subtitle}
          </span>
        </div>
        <span className="text-textMuted text-xs flex-shrink-0 ml-2">{collapsed ? "▼" : "▲"}</span>
      </button>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#21262d]">
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg,#bd93f9,#50fa7b)",
          }}
        />
      </div>

      {!collapsed && (
        <div className="px-3 sm:px-4 py-3">
          <div className="px-3 py-2.5 bg-bg rounded border-l-2 border-purple mb-2.5">
            <div className="text-[9px] text-purple tracking-widest mb-1">MISSION BRIEF</div>
            <div className="text-[11px] sm:text-[12px] text-text leading-relaxed">
              {currentLevelData.mission}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-textMuted">Commands:</span>
            {currentLevelData.concepts.map(c => (
              <span key={c} className="px-2 py-0.5 bg-blue/[0.1] border border-blue/30 rounded text-[10px] sm:text-[11px] text-blue font-mono">
                {c}
              </span>
            ))}
            <span className="ml-auto text-[10px] text-green">
              +{currentLevelData.pointsAvailable} pts available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
