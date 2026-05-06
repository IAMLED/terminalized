// src/pages/Welcome.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import About from "../pages/About"


const ASCII_LOGO = `
 ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗      ██╗ ███████╗ ███████╗ ██████╗
    ██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║      ██║      ██║ ██╔════╝ ██╔═══██╗
    ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║      ██║    ██║   █████╗   ██║   ██║
    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║      ██║  ██║     ██╔══╝   ██║   ██║
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗ ██║ ████████║███████╗ ██████ ╗
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝ ╚═╝ ╚═══════╝╚══════╝  ╚═════╝
    
    
`;

const FEATURES = [
  { icon: "🗂", text: "Navigate a real Linux-like file system" },
  { icon: "🔐", text: "Fix broken permissions with chmod" },
  { icon: "🔍", text: "Search files with find and grep" },
  { icon: "📋", text: "Analyse system logs for clues" },
  { icon: "🚩", text: "Capture flags to complete each level" },
  { icon: "⚡", text: "7 escalating missions from basics to expert" },
];

function TypewriterText({ text, speed = 30, onDone }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}<span style={{ animation: "blink 1s infinite" }}>█</span></span>;
}

export default function Welcome() {
  const navigate    = useNavigate();
  const { startGame, gameStarted, restart } = useGame();
  const [phase, setPhase] = useState(0); // 0=logo 1=tagline 2=features 3=ready

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleStart = () => {
    if (gameStarted) restart();
    startGame();
    navigate("/game");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Share Tech Mono', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
        @keyframes glow { 0%,100%{text-shadow:0 0 10px #50fa7b66} 50%{text-shadow:0 0 30px #50fa7b,0 0 60px #50fa7b55} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 #50fa7b44} 50%{box-shadow:0 0 0 12px transparent} }
        .start-btn:hover { background:#50fa7b !important; color:#0d1117 !important; transform:scale(1.04) !important; }
        .feature-item { animation: fadeIn 0.4s ease both; }
      `}</style>

      {/* CRT scanline sweep */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        zIndex: 0,
      }} />
      <div style={{
        position: "fixed", left: 0, right: 0, height: "60px", pointerEvents: "none",
        background: "linear-gradient(transparent, rgba(80,250,123,0.04), transparent)",
        animation: "scanline 8s linear infinite", zIndex: 1,
      }} />

      <div style={{ width: "100%", maxWidth: "780px", display: "flex", justifyContent: "end", marginBottom: "20px"}}>
        {<About />} 
      </div>

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "780px" }}>
        {/* ASCII Logo */}
        {phase >= 0 && (
          <pre style={{
            color: "#50fa7b",
            fontSize: "clamp(4px, 1.2vw, 10px)",
            lineHeight: "1.2",
            textAlign: "center",
            margin: "0 0 8px",
            animation: "glow 3s ease-in-out infinite",
            overflow: "hidden",
          }}>
            {ASCII_LOGO}
          </pre>
        )}

        {/* Tagline */}
        {phase >= 1 && (
          <div style={{
            textAlign: "center",
            marginBottom: "32px",
            animation: "fadeIn 0.5s ease both",
          }}>
            <div style={{ color: "#8b949e", fontSize: "36px", letterSpacing: "3px" }}>
              A Linux Command-Line Adventure
            </div>
            <div style={{
              marginTop: "6px",
              fontSize: "24px",
              color: "#484f58",
              letterSpacing: "1px",
            }}>
              7 LEVELS · REAL COMMANDS · CAPTURE THE FLAG
            </div>
             <div style={{
              marginTop: "6px",
              fontSize: "22px",
              color: "#484f58",
              letterSpacing: "1px",
            }}>
              DEVELOPED BY: EMMANUEL LEBURA (IAMLED)
            </div>
          </div>
        )}

        {/* Features grid */}
        {phase >= 2 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "36px",
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feature-item"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "#161b22",
                  border: "1px solid #21262d",
                  borderRadius: "6px",
                }}
              >
                <span style={{ fontSize: "26px" }}>{f.icon}</span>
                <span style={{ fontSize: "19px", color: "#c8d0e0" }}>{f.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Start button */}
        {phase >= 3 && (
          <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease both" }}>
            <button
              onClick={handleStart}
              className="start-btn"
              style={{
                padding: "16px 48px",
                fontSize: "16px",
                fontFamily: "'Orbitron', monospace",
                fontWeight: "700",
                letterSpacing: "3px",
                background: "transparent",
                border: "2px solid #50fa7b",
                color: "#50fa7b",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
                animation: "pulse 2s ease-in-out infinite",
                textTransform: "uppercase",
              }}
            >
              LAUNCH TERMINAL
            </button>

            <div style={{ marginTop: "16px", color: "#484f58", fontSize: "21px" }}>
              Type <span style={{ color: "#8be9fd" }}>help</span> in the terminal to see available commands {" "}<br/>
              Type <span style={{ color: "#8be9fd" }}>hint</span> for clues (−10 pts each)
            </div>
          </div>
        )}

        {/* Learning outcomes footer */}
        <div style={{
          marginTop: "40px",
          padding: "16px",
          background: "#161b22",
          border: "1px solid #21262d",
          borderRadius: "8px",
          opacity: phase >= 3 ? 1 : 0,
          transition: "opacity 0.5s ease 0.4s",
        }}>
          <div style={{ fontSize: "18px", color: "#8b949e", letterSpacing: "2px", marginBottom: "10px", textAlign: "center" }}>
            LEARNING OUTCOMES
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              "Navigate Linux file systems",
              "Understand file permissions",
              "Search files efficiently",
              "Analyse system logs",
              "Think like a sysadmin",
              "Build CLI confidence",
            ].map(outcome => (
              <span key={outcome} style={{
                padding: "3px 10px",
                background: "#50fa7b1a",
                border: "1px solid #50fa7b33",
                borderRadius: "20px",
                fontSize: "14px",
                color: "#50fa7b",
                textAlign: "center"
              }}>
                ✔ {outcome}
              </span>
            ))}

          </div>
        </div>

            <h4 style={{
              textAlign: "center",
              padding: "4px"
            }}>
              Love the game but have some suggestions? Drop a feedback at the <a href="#">GitHub Repo</a>
            </h4>
      </div>
    </div>
  );
}
