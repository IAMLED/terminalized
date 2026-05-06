// src/pages/Game.jsx
import React, { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate }  from "react-router-dom";
import { useGame }      from "../context/GameContext";
import Terminal         from "../components/Terminal";
import Sidebar          from "../components/Sidebar";
import MissionBrief     from "../components/MissionBrief";
import { SFX }          from "../engine/soundEngine";

export default function Game() {
  const navigate = useNavigate();
  const { gameStarted, gameComplete, restart } = useGame();

  // When true the congrats overlay is showing → timer paused
  const [levelComplete, setLevelComplete] = useState(false);

  useEffect(() => { if (!gameStarted) navigate("/"); },       [gameStarted, navigate]);
  useEffect(() => { if (gameComplete)  navigate("/victory"); }, [gameComplete, navigate]);

  // Reset pause state whenever the level changes (nextLevel was called)
  useEffect(() => { setLevelComplete(false); }, [gameComplete]);

  const handleRestart = () => { restart(); navigate("/"); SFX.stopBg?.();};

  // Timer expiry → game over (only fires when timer is NOT paused)
  const handleExpire = useCallback(() => {
    SFX.gameOver?.();
    navigate("/gameover");
  }, [navigate]);

  const handleWarning = useCallback((level) => {
    if (level === "warn")     SFX.timerWarning?.();
    if (level === "critical") SFX.timerCritical?.();
  }, []);

  // Terminal calls this whenever the congrats overlay opens/closes
  const handleLevelComplete = useCallback((isComplete) => {
    setLevelComplete(isComplete);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#0d1117", display:"flex",
      flexDirection:"column", fontFamily:"'Share Tech Mono',monospace" }}>
      <style>{`
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#0d1117; }
        ::-webkit-scrollbar-thumb { background:#30363d; border-radius:3px; }
      `}</style>

      {/* Nav */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 20px", background:"#161b22", borderBottom:"1px solid #21262d", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontSize:"18px", fontFamily:"'Orbitron',monospace", fontWeight:"700",
            color:"#50fa7b", letterSpacing:"2px", textShadow:"0 0 10px #50fa7b66" }}>
            TERMINALIZED
          </span>
          <span style={{ padding:"2px 8px", background:"#50fa7b1a", border:"1px solid #50fa7b44",
            borderRadius:"4px", fontSize:"16px", color:"#50fa7b" }}>ACTIVE</span>
        </div>
        <button onClick={handleRestart}
          style={{ padding:"5px 14px", fontSize:"11px", background:"transparent",
            border:"1px solid #30363d", color:"#8b949e", borderRadius:"4px", cursor:"pointer",
            fontFamily:"'Share Tech Mono',monospace", transition:"all 0.2s" }}
          onMouseEnter={e=>{e.target.style.borderColor="#ff5555";e.target.style.color="#ff5555"}}
          onMouseLeave={e=>{e.target.style.borderColor="#30363d";e.target.style.color="#8b949e"}}>
          ↩ RESTART
        </button>
      </nav>

      {/* Main layout */}
      <div style={{ flex:1, display:"flex", gap:"12px", padding:"12px 16px",
        overflow:"hidden", minHeight:0 }}>
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          <MissionBrief/>
          <div style={{ flex:1, minHeight:0 }}>
            <Terminal onLevelComplete={handleLevelComplete}/>
          </div>
        </div>
        {/* Pass paused=true when level is complete so timer freezes */}
        <Sidebar
          onExpire={handleExpire}
          onWarning={handleWarning}
          paused={levelComplete}
        />
      </div>
    </div>
  );
}
