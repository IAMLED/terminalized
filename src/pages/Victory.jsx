// src/pages/Victory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame }     from "../context/GameContext";
import { SFX }         from "../engine/soundEngine";

function CountUp({ target, duration = 1800 }) {
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

const RANKS = [
  { min: 1800, rank: "S", label: "Terminal Master",    color: "text-yellow",  border: "border-yellow",  glow: "rgba(241,250,140,0.3)" },
  { min: 1400, rank: "A", label: "Senior SysAdmin",    color: "text-green",   border: "border-green",   glow: "rgba(80,250,123,0.3)" },
  { min: 1000, rank: "B", label: "Linux Practitioner", color: "text-blue",    border: "border-blue",    glow: "rgba(139,233,253,0.3)" },
  { min:  600, rank: "C", label: "Shell Apprentice",   color: "text-purple",  border: "border-purple",  glow: "rgba(189,147,249,0.3)" },
  { min:    0, rank: "D", label: "Script Kiddie",      color: "text-red",     border: "border-red",     glow: "rgba(255,85,85,0.3)" },
];

function getRank(score) {
  return RANKS.find(r => score >= r.min) || RANKS[RANKS.length - 1];
}

export default function Victory() {
  const navigate = useNavigate();
  const { score, totalTime, completedLevels, restart, gameComplete, playerName } = useGame();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!gameComplete) { navigate("/", { replace: true }); return; }
    SFX.victory?.();
    const t = [
      setTimeout(() => setPhase(1), 250),
      setTimeout(() => setPhase(2), 850),
      setTimeout(() => setPhase(3), 1400),
    ];
    return () => t.forEach(clearTimeout);
  }, [gameComplete, navigate]);

  const rank = getRank(score);
  const totalSecs = Math.floor(totalTime / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;

  const handleRestart = () => { restart(); navigate("/", { replace: true }); };
  const displayName = playerName || "Agent";

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 sm:p-6 font-mono relative overflow-hidden">
      {/* Confetti */}
      {phase >= 1 && Array.from({ length: 18 }).map((_, i) => {
        const colors = ["#50fa7b","#bd93f9","#f1fa8c","#ff79c6","#8be9fd"];
        return (
          <div
            key={i}
            className="fixed pointer-events-none z-0"
            style={{
              left: `${Math.random() * 100}%`,
              top: "-20px",
              width: Math.random() * 7 + 4,
              height: Math.random() * 7 + 4,
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
              background: colors[i % 5],
              animation: `confetti ${Math.random() * 3 + 2.5}s linear ${Math.random() * 1.5}s both`,
            }}
          />
        );
      })}
      <style>{`@keyframes confetti{0%{transform:translateY(-20px) rotate(0)}100%{transform:translateY(110vh) rotate(720deg)}}`}</style>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Flag waving */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="text-5xl sm:text-6xl inline-block animate-bounceY">🏁</div>
        </div>

        {/* Title */}
        {phase >= 1 && (
          <div className="text-center mb-5 sm:mb-6 animate-fadeIn">
            <h1
              className="font-orbitron text-green m-0 mb-1.5 tracking-[3px] animate-glow"
              style={{ fontSize: "clamp(22px,5vw,40px)" }}
            >
              MISSION COMPLETE
            </h1>
            <div className="text-text text-[14px] sm:text-base">
              Well done, <span className="text-green font-bold">{displayName}</span> — you've been Terminalized.
            </div>
          </div>
        )}

        {/* Stats */}
        {phase >= 2 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 animate-fadeIn">
            {[
              { label:"FINAL SCORE", value:<span className="font-orbitron text-2xl sm:text-3xl text-yellow"><CountUp target={score}/></span> },
              { label:"TIME",        value:<span className="font-orbitron text-xl sm:text-2xl text-blue">{mins}:{secs.toString().padStart(2,"0")}</span> },
              { label:"LEVELS",      value:<span className="font-orbitron text-2xl sm:text-3xl text-green">{completedLevels.length}/7</span> },
            ].map(({ label, value }) => (
              <div key={label} className="panel p-3 sm:p-4 text-center">
                <div className="text-[9px] text-textDim tracking-widest mb-1.5">{label}</div>
                {value}
              </div>
            ))}
          </div>
        )}

        {/* Rank badge w/ player name */}
        {phase >= 2 && (
          <div className={`panel border-2 ${rank.border} p-4 sm:p-5 mb-5 flex flex-col sm:flex-row gap-4 items-center animate-fadeIn`}
            style={{ boxShadow: `0 0 30px ${rank.glow}` }}>
            <div
              className={`w-20 h-20 rounded-full border-2 ${rank.border} flex items-center justify-center font-orbitron font-black ${rank.color} flex-shrink-0`}
              style={{
                fontSize: "36px",
                background: "rgba(255,255,255,0.04)",
                boxShadow: `0 0 30px ${rank.glow}`,
              }}
            >
              {rank.rank}
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="text-[18px] text-textDim tracking-widest mb-1">RANK ACHIEVED</div>
              <div className={`text-lg sm:text-xl font-bold ${rank.color} mb-1`}>{rank.label}</div>
              <div className="text-[18px] sm:text-xs text-textMuted">
                Awarded to <span className="text-green font-bold">{displayName}</span>
                {rank.rank === "S" && " — flawless execution. You are one with the terminal."}
                {rank.rank === "A" && " — excellent work. The command line bends to your will."}
                {rank.rank === "B" && " — solid performance. Keep practising your Linux skills."}
                {rank.rank === "C" && " — good start! Review and aim higher next run."}
                {rank.rank === "D" && " — review the basics and try again for a higher rank."}
              </div>
            </div>
          </div>
        )}

        {/* Certificate */}
        {phase >= 3 && (
          <div className="panel p-4 sm:p-5 mb-6 relative overflow-hidden animate-fadeIn">
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: "linear-gradient(90deg,#50fa7b,#bd93f9,#f1fa8c)" }}
            />
            <div className="text-center">
              <div className="text-[16px] text-textMuted tracking-[3px] mb-2">CERTIFICATE OF COMPLETION</div>
              <div className="text-text text-[12px] sm:text-[16px] leading-relaxed">
                This certifies that <span className="text-green font-bold">{displayName}</span> has successfully
                completed all 7 levels of <span className="text-green">Terminalized - Linux Fundamentals Test</span> and demonstrated
                proficiency in Linux command-line operations including file navigation, permissions
                management, log analysis, and file searching.
              </div>
              <div className="mt-3 flex justify-center flex-wrap gap-1.5">
                {["Linux Navigation","File Permissions","Log Analysis","File Search","CTF Skills"].map(s => (
                  <span key={s} className="px-2.5 py-1 bg-green/[0.1] border border-green/30 rounded-full text-[14px] sm:text-[11px] text-green">
                    ✔ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        {phase >= 3 && (
          <div className="text-center animate-fadeIn">
            <button onClick={handleRestart} className="btn-primary px-10 sm:px-12 text-sm sm:text-[16px]">
              PLAY AGAIN
            </button>
            <div className="mt-2 text-[14px] text-textDim">
              Aim for a higher score and faster time
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
