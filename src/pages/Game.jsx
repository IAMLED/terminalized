// src/pages/Game.jsx
import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame }     from "../context/GameContext";
import Terminal        from "../components/Terminal";
import Sidebar         from "../components/Sidebar";
import MissionBrief    from "../components/MissionBrief";
import { SFX }         from "../engine/soundEngine";

export default function Game() {
  const navigate = useNavigate();
  const { gameStarted, gameComplete, gameOver, restart, timeExpired } = useGame();

  // Pauses timer when level-complete overlay is showing
  const [levelComplete, setLevelComplete] = useState(false);

  // If the player refreshes /game without starting (no state), redirect to Welcome
  useEffect(() => { if (!gameStarted) navigate("/", { replace: true }); }, [gameStarted, navigate]);
  useEffect(() => { if (gameComplete) navigate("/victory",  { replace: true }); }, [gameComplete, navigate]);
  useEffect(() => { if (gameOver)     navigate("/gameover", { replace: true }); }, [gameOver, navigate]);

  // Reset pause whenever level advances (gameComplete change triggers re-render)
  useEffect(() => { setLevelComplete(false); }, [gameComplete]);

  const handleRestart = () => { restart(); navigate("/", { replace: true }); };

  const handleExpire = useCallback(() => {
    SFX.gameOver?.();
    timeExpired();
  }, [timeExpired]);

  const handleWarning = useCallback((level) => {
    if (level === "warn")     SFX.timerWarning?.();
    if (level === "critical") SFX.timerCritical?.();
  }, []);

  const handleLevelComplete = useCallback((isOpen) => {
    setLevelComplete(isOpen);
  }, []);

  return (
    <div className="min-h-screen bg-bg flex flex-col font-mono">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-panel border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-orbitron font-bold text-green text-xs sm:text-sm tracking-[2px] truncate" style={{ textShadow: "0 0 10px rgba(80,250,123,0.4)" }}>
            TERMINALIZED
          </span>
          <span className="hidden sm:inline px-2 py-0.5 bg-green/10 border border-green/30 rounded text-[10px] text-green">
            ACTIVE
          </span>
        </div>
        <button onClick={handleRestart} className="btn-ghost">
          ↩ RESTART
        </button>
      </nav>

      {/* Main responsive layout: column on mobile, row on lg+ */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 sm:p-4 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-w-0 min-h-0 order-2 lg:order-1">
          <MissionBrief />
          <div className="flex-1 min-h-[300px] sm:min-h-[400px]">
            <Terminal onLevelComplete={handleLevelComplete} />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Sidebar
            onExpire={handleExpire}
            onWarning={handleWarning}
            paused={levelComplete}
          />
        </div>
      </div>
    </div>
  );
}
