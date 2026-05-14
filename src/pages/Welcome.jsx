// src/pages/Welcome.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGame }     from "../context/GameContext";
import About from "../pages/About"


const ASCII_LOGO = String.raw`
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

const OUTCOMES = [
  "Navigate Linux file systems",
  "Understand file permissions",
  "Search files efficiently",
  "Analyse system logs",
  "Think like a sysadmin",
  "Build CLI confidence",
];

// ── Name input modal ───────────────────────────────────────────────────────
function NameModal({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div
        className={`w-full max-w-md panel p-6 sm:p-8 border-green/40 shadow-[0_0_60px_rgba(80,250,123,0.15)] ${shake ? "animate-shake" : ""}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">👤</div>
          <h2 className="font-orbitron font-bold text-green text-lg sm:text-xl tracking-[3px] mb-1">
            IDENTIFY YOURSELF
          </h2>
          <p className="text-textMuted text-xs sm:text-sm">
            What should we call you, agent?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={24}
            spellCheck={false}
            autoComplete="off"
            className="w-full px-4 py-3 bg-bg border border-border focus:border-green text-text rounded font-mono text-sm sm:text-base outline-none caret-green transition-colors"
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost flex-1 py-2.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary flex-[2] py-2.5 text-xs disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-green"
            >
              Launch Terminal →
            </button>
          </div>
        </form>

        <p className="mt-4 text-[14px] text-textDim text-center">
          Name is remembered only during this session.
        </p>
      </div>
    </div>
  );
}

// ── Welcome page ───────────────────────────────────────────────────────────
export default function Welcome() {
  const navigate = useNavigate();
  const { startGame, setName, restart, gameStarted } = useGame();
  const [phase, setPhase] = useState(0);
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const handleLaunchClick = () => {
    setShowNameModal(true);
  };

  const handleNameSubmit = (name) => {
    if (gameStarted) restart();
    setName(name);
    setShowNameModal(false);
    // small delay so context updates land before navigation
    setTimeout(() => {
      startGame();
      navigate("/game");
    }, 30);
  };

  return (
    <div className="min-h-screen bg-bg text-text font-mono overflow-x-hidden relative flex flex-col items-center justify-center p-4 sm:p-6">
      {/* CRT scanline backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)" }} />
      <div className="fixed left-0 right-0 h-16 pointer-events-none z-[1] animate-scanline"
        style={{ background: "linear-gradient(transparent, rgba(80,250,123,0.05), transparent)" }} />

        <div style={{ width: "100%", maxWidth: "780px", display: "flex", justifyContent: "end", marginBottom: "20px"}}>
              {<About />} 
            </div>
      <div className="relative z-10 w-full max-w-3xl">
        {/* Logo */}
        <pre
          className="text-green text-center mx-auto mb-2 animate-glow leading-tight overflow-hidden"
          style={{ fontSize: "clamp(4px, 1.1vw, 10px)" }}
        >
          {ASCII_LOGO}
        </pre>

        {/* Tagline */}
        {phase >= 1 && (
          <div className="text-center mb-8 animate-fadeIn">
            <div className="text-textMuted text-xs text-[14px] tracking-[3px] sm:text-[16px]">
              A Linux Command-Line Adventure
            </div>
            <div className="mt-1.5 text-[14px] sm:text-[16px] text-textDim tracking-widest">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 sm:px-4 py-2.5 panel-sm animate-fadeIn"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className="text-base flex-shrink-0">{f.icon}</span>
                <span className="text-xs sm:text-[13px] text-text">{f.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Launch button */}
        {phase >= 3 && (
          <div className="text-center animate-fadeIn">
            <button
              onClick={handleLaunchClick}
              className="btn-primary text-sm sm:text-base px-8 sm:px-12 py-3.5 sm:py-4 animate-pulseBtn"
            >
              GET STARTED
            </button>
            <div className="mt-4 text-[16px] sm:text-[16px] text-textDim">
              Type <span className="text-blue">help</span> in the terminal to see available commands ·{" "}
              <span className="text-blue">hint</span> for clues (−10 pts each)
            </div>
          </div>
        )}

        {/* Learning outcomes */}
        {phase >= 3 && (
          <div className="mt-8 sm:mt-10 panel p-3 sm:p-4 animate-fadeIn text-center text-[14px]">
            <div className="text-[16px] text-textMuted tracking-widest mb-2.5">
              LEARNING OUTCOMES
            </div>
            <div className="flex flex-wrap gap-2 text-center align-center justify-center">
              {OUTCOMES.map(o => (
                <span key={o} className="px-2.5 py-1 bg-green/10 border border-green/30 rounded-full text-[10px] sm:text-[11px] text-green text-center">
                  ✔ {o}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Name modal */}
      {showNameModal && (
        <NameModal
          onSubmit={handleNameSubmit}
          onCancel={() => setShowNameModal(false)}
        />
      )}
    </div>
  );
}
