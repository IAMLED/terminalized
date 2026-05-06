// src/components/MissionBrief.jsx
import React, { useState } from "react";
import { useGame } from "../context/GameContext";

export default function MissionBrief() {
  const { currentLevelData, currentLevel, totalLevels } = useGame();
  const [collapsed, setCollapsed] = useState(false);

  const progressPct = ((currentLevel - 1) / totalLevels) * 100;

  return (
    <div style={{
      background: "#161b22",
      border: "1px solid #21262d",
      borderRadius: "8px",
      overflow: "hidden",
      marginBottom: "10px",
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#f8f8f2",
          fontFamily: "'Share Tech Mono', monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            padding: "2px 8px",
            background: "#bd93f933",
            border: "1px solid #bd93f966",
            borderRadius: "4px",
            fontSize: "15px",
            color: "#bd93f9",
            letterSpacing: "1px",
          }}>
            LVL {currentLevelData.id}/{totalLevels}
          </span>
          <span style={{ fontSize: "15px", fontWeight: "bold", color: "#f8f8f2" }}>
            {currentLevelData.title}
          </span>
          <span style={{ fontSize: "15px", color: "#8b949e" }}>
            — {currentLevelData.subtitle}
          </span>
        </div>
        <span style={{ color: "#8b949e", fontSize: "15px" }}>{collapsed ? "▼" : "▲"}</span>
      </button>

      {/* Progress bar */}
      <div style={{ height: "2px", background: "#21262d" }}>
        <div style={{
          height: "100%",
          width: `${progressPct}%`,
          background: "linear-gradient(90deg, #bd93f9, #50fa7b)",
          transition: "width 0.5s ease",
        }} />
      </div>

      {/* Body */}
      {!collapsed && (
        <div style={{ padding: "12px 16px" }}>
          {/* Mission text */}
          <div style={{
            padding: "10px 12px",
            background: "#0d1117",
            borderRadius: "6px",
            borderLeft: "3px solid #bd93f9",
            marginBottom: "10px",
          }}>
            <div style={{ fontSize: "19px", color: "#bd93f9", letterSpacing: "2px", marginBottom: "4px" }}>
              MISSION BRIEF
            </div>
            <div style={{ fontSize: "15px", color: "#c8d0e0", lineHeight: "1.6" }}>
              {currentLevelData.mission}
            </div>
          </div>

          {/* Concepts row */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "20px", color: "#8b949e" }}>Commands:</span>
            {currentLevelData.concepts.map(c => (
              <span key={c} style={{
                padding: "2px 8px",
                background: "#8be9fd1a",
                border: "1px solid #8be9fd44",
                borderRadius: "4px",
                fontSize: "20px",
                color: "#8be9fd",
                fontFamily: "'Share Tech Mono', monospace",
              }}>
                {c}
              </span>
            ))}

            <span style={{ marginLeft: "auto", fontSize: "20px", color: "#50fa7b" }}>
              +{currentLevelData.pointsAvailable} pts available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
