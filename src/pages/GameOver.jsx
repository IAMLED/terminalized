// src/pages/GameOver.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame }     from "../context/GameContext";
import { SFX }         from "../engine/soundEngine";

export default function GameOver() {
  const navigate = useNavigate();
  const { score, currentLevel, completedLevels, currentLevelData, restart, gameStarted } = useGame();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!gameStarted) { navigate("/"); return; }
    SFX.gameOver?.();
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, [gameStarted, navigate]);

  const handleTryAgain = () => { restart(); navigate("/"); };

  const levelsCleared = completedLevels.length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "20px",
      fontFamily: "'Share Tech Mono', monospace",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glitchR  { 0%,100%{clip-path:inset(0 0 95% 0)} 20%{clip-path:inset(30% 0 50% 0)} 40%{clip-path:inset(70% 0 10% 0)} 60%{clip-path:inset(10% 0 80% 0)} 80%{clip-path:inset(50% 0 30% 0)} }
        @keyframes scanDown { 0%{top:-5%} 100%{top:105%} }
        @keyframes flicker  { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.3} 94%{opacity:1} 97%{opacity:0.6} 98%{opacity:1} }
        @keyframes blink    { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        .tryagain:hover { background:#ff5555 !important; color:#0d1117 !important; }
      `}</style>

      {/* Red scanline sweep */}
      <div style={{ position:"fixed", left:0, right:0, height:"80px", pointerEvents:"none",
        background:"linear-gradient(transparent,rgba(255,85,85,0.06),transparent)",
        animation:"scanDown 4s linear infinite", zIndex:0 }}/>

      {/* CRT noise overlay */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)" }}/>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:"560px",
        opacity: show ? 1 : 0, transition:"opacity 0.4s ease",
        animation: show ? "flicker 6s ease-in-out infinite" : "none" }}>

        {/* GAME OVER header */}
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ position:"relative", display:"inline-block" }}>
            <h1 style={{
              fontFamily:"'Orbitron',monospace", fontSize:"clamp(36px,8vw,64px)",
              color:"#ff5555", margin:0, letterSpacing:"6px",
              textShadow:"0 0 20px #ff555599, 0 0 60px #ff555533",
              animation:"fadeUp 0.5s ease both",
            }}>GAME OVER</h1>
            {/* Glitch layer */}
            <h1 aria-hidden style={{
              position:"absolute", top:0, left:0,
              fontFamily:"'Orbitron',monospace", fontSize:"clamp(36px,8vw,64px)",
              color:"#8be9fd", margin:0, letterSpacing:"6px",
              opacity:0.4, animation:"glitchR 3s infinite", pointerEvents:"none",
            }}>GAME OVER</h1>
          </div>
          <div style={{ color:"#ff555588", fontSize:"13px", marginTop:"12px", letterSpacing:"2px",
            animation:"fadeUp 0.5s ease 0.15s both" }}>
            TIME EXPIRED — MISSION FAILED
          </div>
        </div>

        {/* Stats card */}
        <div style={{ background:"#161b22", border:"1px solid #ff555533",
          borderRadius:"10px", padding:"24px", marginBottom:"20px",
          animation:"fadeUp 0.5s ease 0.25s both",
          boxShadow:"0 0 40px #ff555511" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"16px" }}>
            {[
              { label:"SCORE",         value: score.toLocaleString(),  color:"#f1fa8c" },
              { label:"LEVELS CLEARED",value: `${levelsCleared}/7`,    color:"#8be9fd" },
              { label:"FAILED AT",     value: `Level ${currentLevel}`, color:"#ff5555" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign:"center", padding:"12px 8px",
                background:"#0d1117", borderRadius:"6px", border:"1px solid #21262d" }}>
                <div style={{ fontSize:"9px", color:"#484f58", letterSpacing:"1px", marginBottom:"4px" }}>{label}</div>
                <div style={{ fontSize:"18px", fontFamily:"'Orbitron',monospace",
                  fontWeight:"700", color, lineHeight:1 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Failure reason */}
          <div style={{ padding:"12px 14px", background:"#ff55550a",
            border:"1px solid #ff555533", borderRadius:"6px", textAlign:"center" }}>
            <div style={{ color:"#ff5555", fontSize:"12px", lineHeight:"1.6" }}>
              ⏰ You ran out of time on <strong style={{ color:"#ff7777" }}>
                Level {currentLevel}: {currentLevelData.title}
              </strong>.<br/>
              In cybersecurity, speed is everything. Study the commands and try again.
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={{ background:"#161b22", border:"1px solid #21262d",
          borderRadius:"8px", padding:"16px 20px", marginBottom:"24px",
          animation:"fadeUp 0.5s ease 0.35s both" }}>
          <div style={{ fontSize:"10px", color:"#8b949e", letterSpacing:"2px", marginBottom:"10px" }}>
            💡 TIPS FOR NEXT ATTEMPT
          </div>
          {[
            "Type 'help' to see available commands for the current level",
            "Type 'hint' for a direct clue (costs 10 pts but saves time)",
            "Use Tab key for path auto-completion — much faster",
            "Read the mission brief carefully — the path is always hinted",
          ].map((tip, i) => (
            <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"6px",
              fontSize:"11px", color:"#8b949e", lineHeight:"1.5" }}>
              <span style={{ color:"#50fa7b", flexShrink:0 }}>▸</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign:"center", animation:"fadeUp 0.5s ease 0.45s both" }}>
          <button onClick={handleTryAgain} className="tryagain" style={{
            padding:"14px 44px", fontSize:"14px",
            fontFamily:"'Orbitron',monospace", fontWeight:"700", letterSpacing:"3px",
            background:"transparent", border:"2px solid #ff5555", color:"#ff5555",
            borderRadius:"6px", cursor:"pointer", transition:"all 0.2s",
            textTransform:"uppercase",
          }}>
            TRY AGAIN
          </button>
          <div style={{ marginTop:"10px", fontSize:"10px", color:"#484f58" }}>
            Score resets · Levels reshuffle · Clock starts fresh
          </div>
        </div>
      </div>
    </div>
  );
}
