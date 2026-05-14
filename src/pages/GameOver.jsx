// src/pages/GameOver.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame }     from "../context/GameContext";
import { SFX }         from "../engine/soundEngine";

export default function GameOver() {
  const navigate = useNavigate();
  const {
    score, currentLevel, completedLevels,
    currentLevelData, restart, gameStarted, playerName,
  } = useGame();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!gameStarted) { navigate("/", { replace: true }); return; }
    SFX.gameOver?.();
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, [gameStarted, navigate]);

  const handleTryAgain = () => { restart(); navigate("/", { replace: true }); };

  const topics = currentLevelData?.studyTopics || [];

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 sm:p-6 font-mono overflow-hidden relative">
      {/* CRT noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <div className="fixed left-0 right-0 h-20 pointer-events-none z-0 animate-scanline"
        style={{ background: "linear-gradient(transparent, rgba(255,85,85,0.06), transparent)" }} />

      <div
        className={`relative z-10 w-full max-w-2xl transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
      >
        {/* GAME OVER header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1
            className="font-orbitron text-red m-0 tracking-[6px] animate-fadeIn"
            style={{
              fontSize: "clamp(32px, 8vw, 64px)",
              textShadow: "0 0 20px rgba(255,85,85,0.6), 0 0 60px rgba(255,85,85,0.2)",
            }}
          >
            GAME OVER
          </h1>
          <div className="text-red/60 text-[11px] sm:text-[13px] mt-3 tracking-widest animate-fadeIn">
            TIME EXPIRED — MISSION FAILED
          </div>
        </div>

        {/* Stats */}
        <div className="panel border-red/30 shadow-[0_0_40px_rgba(255,85,85,0.07)] p-4 sm:p-6 mb-4 sm:mb-5 animate-fadeIn">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            {[
              { label: "SCORE",          value: score.toLocaleString(),   color: "text-yellow" },
              { label: "LEVELS CLEARED", value: `${completedLevels.length}/7`, color: "text-blue" },
              { label: "FAILED AT",      value: `Level ${currentLevel}`,  color: "text-red" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-2 sm:p-3 bg-bg rounded border border-border">
                <div className="text-[9px] text-textDim tracking-wide mb-1 truncate">{label}</div>
                <div className={`font-orbitron font-bold text-base sm:text-lg leading-tight truncate ${color}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-2.5 bg-red/[0.04] border border-red/20 rounded text-center">
            <div className="text-red text-[11px] sm:text-xs leading-relaxed">
              ⏰ {playerName ? `${playerName}, you` : "You"} ran out of time on{" "}
              <strong className="text-red/90">
                Level {currentLevel}: {currentLevelData?.title}
              </strong>.<br />
              In cybersecurity, speed is everything. Review the topics below and try again.
            </div>
          </div>
        </div>

        {/* Study topics */}
        {topics.length > 0 && (
          <div className="panel p-4 sm:p-5 mb-5 sm:mb-6 animate-fadeIn">
            <div className="text-[10px] text-textMuted tracking-widest mb-3 flex items-center gap-2">
              📚 TOPICS TO STUDY BEFORE RETRYING
            </div>
            <div className="space-y-2">
              {topics.map((t, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className="text-green flex-shrink-0 mt-0.5">▸</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-blue text-[12px] sm:text-[13px] font-bold">{t.topic}</span>
                    <span className="text-textMuted text-[11px] sm:text-[12px]"> — {t.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General tips */}
        <div className="panel p-3 sm:p-4 mb-5 sm:mb-6 animate-fadeIn">
          <div className="text-[10px] text-textMuted tracking-widest mb-2">💡 GENERAL TIPS</div>
          {[
            "Type 'help' to see available commands for the current level",
            "Type 'hint' for a direct clue (costs 10 pts but saves time)",
            "Use Tab key for path auto-completion — much faster",
            "Read the mission brief carefully — the path is always hinted",
          ].map((tip, i) => (
            <div key={i} className="flex gap-2 mb-1 text-[10px] sm:text-[11px] text-textMuted leading-relaxed">
              <span className="text-green flex-shrink-0">▸</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fadeIn">
          <button onClick={handleTryAgain} className="btn-danger text-sm sm:text-[14px] px-10 sm:px-12">
            TRY AGAIN
          </button>
          <div className="mt-2.5 text-[10px] text-textDim">
            Score resets · New flags generated · Clock starts fresh
          </div>
        </div>
      </div>
    </div>
  );
}
