import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Rajdhani:wght@400;600&display=swap');

  .about-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.82);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s;
  }
  .about-overlay.open {
    opacity: 1;
    pointer-events: all;
  }
  .about-modal {
    background: #0d1117;
    border: 1px solid #50fa7b33;
    border-radius: 4px;
    width: 760px;
    max-width: 95vw;
    overflow: hidden;
    transform: translateY(24px) scale(0.97);
    transition: transform 0.28s cubic-bezier(0.17, 0.67, 0.27, 1.2);
    box-shadow: 0 0 60px #50fa7b33, 0 0 0 1px #50fa7b33;
  }
  .about-overlay.open .about-modal {
    transform: translateY(0) scale(1);
  }
  .about-modal-header {
    background: linear-gradient(135deg, #0d1117 0%, rgb(6, 6, 25) 60%);
    padding: 28px 28px 20px;
    border-bottom: 1px solid #070f1a;
    position: relative;
  }
  .about-scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
    );
    pointer-events: none;
  }
  .about-pixel-title {
    font-family: 'Press Start 2P', monospace;
    font-size: 13px;
    color: #50fa7b33;
    line-height: 1.8;
    letter-spacing: 0.05em;
  }
  .about-pixel-subtitle {
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    color: #50fa7b33;
    margin-top: 8px;
    letter-spacing: 0.12em;
  }
  .about-close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: 1px solid #50fa7a17;
    color: #50fa7b33;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.15s;
    line-height: 1;
  }
  .about-close-btn:hover {
    background: #041f0afc;
    color: #089d3f;
    border-color: #50fa7b33;
  }
  .about-modal-body {
    padding: 24px 28px;
  }
  .about-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 15px;
    color: #089d3f;
    line-height: 1.7;
    margin-bottom: 20px;
  }
  .about-text span {
    color: #089d3f;
  }
  .about-stat-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }
  .about-stat-card {
    background: #0a0817;
    border: 1px solid #1e1040;
    border-radius: 3px;
    padding: 10px 12px;
    text-align: center;
  }
  .about-stat-val {
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    color: #089d3f;
    display: block;
    margin-bottom: 4px;
  }
  .about-stat-label {
    font-family: 'Rajdhani', sans-serif;
    font-size: 11px;
    color: #089d3f;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .about-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #032b0d33, transparent);
    margin: 18px 0;
  }
  .about-team-title {
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    color: #089d3f;
    letter-spacing: 0.15em;
    margin-bottom: 14px;
    text-transform: uppercase;
  }
  .about-team-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .about-member-card {
    background: #0a0817;
    border: 1px solid #1a1040;
    border-radius: 3px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .about-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #50fa7a17;
    border: 1px solid #3a2060;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    color: #089d3f;
    flex-shrink: 0;
  }
  .about-member-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #089d3f;
    line-height: 1.2;
  }
  .about-member-role {
    font-family: 'Rajdhani', sans-serif;
    font-size: 11px;
    color: #089d3f;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .about-footer-bar {
    background: #50fa7a17;
    border-top: 1px solid #1a1040;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .about-version-tag {
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    color: #089d3f;
  }
  .about-made-with {
    font-family: 'Rajdhani', sans-serif;
    font-size: 12px;
    color: #089d3f;
  }
  .about-heart {
    color: #089d3f;
  }
  .about-play-btn {
    background: #50fa7a17;
    border: 1px solid #5a3a9a;
    color: #089d3f;
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.1em;
    padding: 7px 20px;
    cursor: pointer;
    border-radius: 2px;
    text-transform: uppercase;
    transition: all 0.15s;
  }
  .about-play-btn:hover {
    background: #50fa7a17;
    border-color: #9d7fff;
    box-shadow: 0 0 10px #7a5acd33;
  }
  .about-nav-btn {
    background: none;
    border: 1px solid #3d2a7a;
    color: #089d3f;
    font-family: 'Rajdhani', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.08em;
    padding: 6px 18px;
    cursor: pointer;
    border-radius: 3px;
    text-transform: uppercase;
    transition: all 0.2s;
  }
  .about-nav-btn:hover {
    background: #50fa7a17;
    color: #089d3f;
    border-color: #7a5acd;
    box-shadow: 0 0 12px #7a5acd44;
  }
`;

// ─── Customise these to match your game ────────────────────────────────────────
const GAME_INFO = {
  title: "ABOUT THE GAME",
  studio: "// SIMSEC STUDIOS — 2026",
  description: (
    <>
      A Linux command-line adventure game built with React. Progress through 7 escalating 
      missions by using real Linux commands to navigate file systems, fix permissions, 
      search files, and capture flags.
    </>
  ),
  stats: [
    { value: "v1.4",  label: "Version"  },
    { value: "2026",  label: "Released" },
    { value: "PC Browser Only", label: "Platform" },
  ],
  team: [
    { initials: "EM", name: "Ezra Meindinyo",     role: "Contributor"},
    { initials: "JN", name: "Joseph Nyoba.",    role: "Contributor"   },
    { initials: "MC", name: "Mark Chukwude", role: "Contributor"   },
    { initials: "FL", name: "Fikabo Lilian.",    role: "Contributor"      },
  ],
  build:    "BUILD #0241",
  madeWith: "made in PORT HARCURT",
};
// ───────────────────────────────────────────────────────────────────────────────

export default function AboutModal() {
  const [open, setOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Inject scoped CSS once */}
      <style>{styles}</style>

      {/* Trigger — drop this wherever "About" should appear in your nav */}
      <button className="about-nav-btn" onClick={() => setOpen(true)}>
        About
      </button>

      {/* Overlay */}
      <div
        className={`about-overlay${open ? " open" : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <div className="about-modal" role="dialog" aria-modal="true" aria-label="About">

          {/* Header */}
          <div className="about-modal-header">
            <div className="about-scanlines" />
            <div style={{ paddingRight: 80 }}>
              <div className="about-pixel-title">{GAME_INFO.title}</div>
              <div className="about-pixel-subtitle">{GAME_INFO.studio}</div>
            </div>
            <button className="about-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Body */}
          <div className="about-modal-body">
            <p className="about-text">{GAME_INFO.description}</p>

            <div className="about-stat-row">
              {GAME_INFO.stats.map((s) => (
                <div className="about-stat-card" key={s.label}>
                  <span className="about-stat-val">{s.value}</span>
                  <div className="about-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="about-divider" />

            <div>
              <div className="about-team-title">// The Team</div>
              <div className="about-team-grid">
                {GAME_INFO.team.map((m) => (
                  <div className="about-member-card" key={m.name}>
                    <div className="about-avatar">{m.initials}</div>
                    <div>
                      <div className="about-member-name">{m.name}</div>
                      <div className="about-member-role">{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="about-footer-bar">
            <span className="about-version-tag">{GAME_INFO.build}</span>
            <span className="about-made-with">
              {GAME_INFO.madeWith.replace("♥", "")}
              <span className="about-heart">♥</span>
            </span>
            <button className="about-play-btn" onClick={() => setOpen(false)}>
              Keep Playing
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
