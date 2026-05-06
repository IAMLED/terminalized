// src/pages/Victory.jsx
import React, { useEffect, useState } from "react";
import { SFX } from "../engine/soundEngine";
import { useNavigate } from "react-router-dom";
import { useGame }     from "../context/GameContext";

function CountUp({ target, duration = 2000 }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <>{val.toLocaleString()}</>;
}

const RANK_THRESHOLDS = [
  { min: 1800, rank: "S", label: "Terminal Master",   color: "#f1fa8c" },
  { min: 1400, rank: "A", label: "Senior SysAdmin",   color: "#50fa7b" },
  { min: 1000, rank: "B", label: "Linux Practitioner", color: "#8be9fd" },
  { min:  600, rank: "C", label: "Shell Apprentice",  color: "#bd93f9" },
  { min:    0, rank: "D", label: "Script Kiddie",     color: "#ff5555" },
];

function getRank(score) {
  return RANK_THRESHOLDS.find(r => score >= r.min) || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
}

export default function Victory() {
  const navigate = useNavigate();
  const { score, totalTime, completedLevels, restart, gameComplete } = useGame();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!gameComplete) { navigate("/"); return; }
    SFX.victory?.();
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [gameComplete, navigate]);

  const rank = getRank(score);
  const totalSecs = Math.floor(totalTime / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;

  const handleRestart = () => { restart(); navigate("/"); };

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
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rankPop { 0%{transform:scale(0) rotate(-20deg)} 70%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0deg)} }
        @keyframes flagWave { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        @keyframes glow { 0%,100%{text-shadow:0 0 10px currentColor} 50%{text-shadow:0 0 40px currentColor,0 0 80px currentColor} }
        @keyframes confetti { 0%{transform:translateY(-20px) rotate(0)} 100%{transform:translateY(100vh) rotate(720deg)} }
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        .play-again:hover { background:#50fa7b !important; color:#0d1117 !important; }
      `}</style>

      {/* Confetti particles */}
      {phase >= 1 && Array.from({ length: 24 }).map((_, i) => (
        <div key={i} style={{
          position: "fixed",
          left: `${Math.random() * 100}%`,
          top: "-20px",
          width: Math.random() * 8 + 4,
          height: Math.random() * 8 + 4,
          borderRadius: Math.random() > 0.5 ? "50%" : "0",
          background: ["#50fa7b", "#bd93f9", "#f1fa8c", "#ff79c6", "#8be9fd"][i % 5],
          animation: `confetti ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s both`,
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "640px" }}>
        {/* Flag */}
        {phase >= 0 && (
          <div style={{
            textAlign: "center",
            marginBottom: "20px",
            animation: "fadeIn 0.5s ease both",
          }}>
            <div style={{
              fontSize: "64px",
              animation: "flagWave 2s ease-in-out infinite",
              display: "inline-block",
            }}>🏁</div>
          </div>
        )}

        {/* Title */}
        {phase >= 1 && (
          <div style={{ textAlign: "center", marginBottom: "24px", animation: "fadeIn 0.5s ease both" }}>
            <h1 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "clamp(20px, 4vw, 36px)",
              color: "#50fa7b",
              margin: "0 0 8px",
              letterSpacing: "3px",
              animation: "glow 2s ease-in-out infinite",
            }}>
              MISSION COMPLETE
            </h1>
            <div style={{ color: "#c8d0e0", fontSize: "14px" }}>
              You have mastered the Linux Terminal Quest.
            </div>
            <div style={{
              marginTop: "12px",
              display: "inline-block",
              padding: "8px 20px",
              background: "#50fa7b1a",
              border: "1px solid #50fa7b55",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#50fa7b",
              letterSpacing: "1px",
              fontFamily: "'Share Tech Mono', monospace",
            }}>
              FLAG: flag&#123;linux_terminal_master&#125;
            </div>
          </div>
        )}

        {/* Stats row */}
        {phase >= 2 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
            marginBottom: "20px",
            animation: "fadeIn 0.5s ease both",
          }}>
            {[
              {
                label: "FINAL SCORE",
                value: <span style={{ fontSize: "28px", fontFamily: "'Orbitron', monospace", color: "#f1fa8c" }}>
                  <CountUp target={score} />
                </span>,
              },
              {
                label: "TIME",
                value: <span style={{ fontSize: "24px", fontFamily: "'Orbitron', monospace", color: "#8be9fd" }}>
                  {mins}:{secs.toString().padStart(2, "0")}
                </span>,
              },
              {
                label: "LEVELS",
                value: <span style={{ fontSize: "28px", fontFamily: "'Orbitron', monospace", color: "#50fa7b" }}>
                  {completedLevels.length}/7
                </span>,
              },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: "16px",
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: "8px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "9px", color: "#484f58", letterSpacing: "2px", marginBottom: "6px" }}>{label}</div>
                {value}
              </div>
            ))}
          </div>
        )}

        {/* Rank badge */}
        {phase >= 2 && (
          <div style={{
            display: "flex",
            gap: "16px",
            marginBottom: "20px",
            padding: "20px",
            background: "#161b22",
            border: `1px solid ${rank.color}44`,
            borderRadius: "10px",
            alignItems: "center",
            animation: "fadeIn 0.5s ease 0.2s both",
          }}>
            <div style={{
              width: 80, height: 80,
              borderRadius: "50%",
              background: `${rank.color}22`,
              border: `3px solid ${rank.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontFamily: "'Orbitron', monospace",
              fontWeight: "900",
              color: rank.color,
              flexShrink: 0,
              animation: "rankPop 0.6s ease 0.5s both",
              boxShadow: `0 0 30px ${rank.color}44`,
            }}>
              {rank.rank}
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#484f58", letterSpacing: "2px", marginBottom: "4px" }}>RANK ACHIEVED</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: rank.color, marginBottom: "4px" }}>
                {rank.label}
              </div>
              <div style={{ fontSize: "11px", color: "#8b949e" }}>
                {rank.rank === "S"
                  ? "Flawless execution. You are one with the terminal."
                  : rank.rank === "A"
                  ? "Excellent work. The command line bends to your will."
                  : rank.rank === "B"
                  ? "Solid performance. Keep practising your Linux skills."
                  : "Good start! Review the commands and try again for a higher rank."}
              </div>
            </div>
          </div>
        )}

        {/* Certificate */}
        {phase >= 3 && (
          <div style={{
            padding: "20px",
            background: "#161b22",
            border: "1px solid #21262d",
            borderRadius: "10px",
            marginBottom: "24px",
            animation: "fadeIn 0.5s ease both",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: "linear-gradient(90deg, #50fa7b, #bd93f9, #f1fa8c)",
            }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#8b949e", letterSpacing: "3px", marginBottom: "8px" }}>
                CERTIFICATE OF COMPLETION
              </div>
              <div style={{ color: "#c8d0e0", fontSize: "13px", lineHeight: "1.6" }}>
                This certifies that <span style={{ color: "#50fa7b" }}>player</span> has successfully
                completed all 7 levels of <span style={{ color: "#50fa7b" }}>Terminal Quest</span> and
                demonstrated proficiency in Linux command-line operations including file navigation,
                permissions management, log analysis, and file searching.
              </div>
              <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                {["Linux Navigation", "File Permissions", "Log Analysis", "File Search", "CTF Skills"].map(skill => (
                  <span key={skill} style={{
                    padding: "3px 10px",
                    background: "#50fa7b1a",
                    border: "1px solid #50fa7b33",
                    borderRadius: "20px",
                    fontSize: "11px",
                    color: "#50fa7b",
                  }}>✔ {skill}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        {phase >= 3 && (
          <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease 0.3s both" }}>
            <button
              onClick={handleRestart}
              className="play-again"
              style={{
                padding: "14px 40px",
                fontSize: "14px",
                fontFamily: "'Orbitron', monospace",
                fontWeight: "700",
                letterSpacing: "2px",
                background: "transparent",
                border: "2px solid #50fa7b",
                color: "#50fa7b",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              PLAY AGAIN
            </button>
            <div style={{ marginTop: "10px", fontSize: "11px", color: "#484f58" }}>
              Try for a higher score and faster time
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
