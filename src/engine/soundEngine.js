// src/engine/soundEngine.js
//
// HYBRID AUDIO ENGINE
// ─────────────────────────────────────────────────────────────────────────
// • Background MUSIC = HTMLAudio elements pointing at CDN URLs
//   (drop in any .mp3/.ogg/.wav link — see MUSIC_TRACKS below)
// • SOUND EFFECTS    = Web Audio API procedural tones (no files needed)
//   OR optionally a CDN URL via SFX_URLS overrides
//
// HOW TO ADD YOUR OWN MUSIC
// ─────────────────────────────────────────────────────────────────────────
// 1. Find a track on a CDN (examples below). The URL must:
//    - End in .mp3, .ogg, or .wav
//    - Allow CORS (most CDNs do; if browser console shows a CORS error,
//      try a different host)
// 2. Edit MUSIC_TRACKS below. Map level IDs (1-7) to URLs.
//    You can use one URL for all levels, or seven different ones.
//
// FREE CC0 MUSIC SOURCES (no attribution needed):
//   - Pixabay Music  https://pixabay.com/music/
//   - FreeSound      https://freesound.org/
//   - OpenGameArt    https://opengameart.org/
//   - Incompetech    https://incompetech.com/  (CC-BY, attribution required)
//
// HOW TO ADD A CUSTOM SOUND EFFECT
// ─────────────────────────────────────────────────────────────────────────
// Map an SFX name → CDN URL in SFX_URLS below. If a URL is set, it will
// be played instead of the procedural Web Audio fallback.

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  EDIT THIS BLOCK TO ADD YOUR OWN MUSIC                                ║
// ╚═══════════════════════════════════════════════════════════════════════╝

// Background music per level. Use the SAME URL for all 7 levels for one
// continuous theme, or pick 7 different tracks for variety.
//
// Example using a single track for all levels:
//   const ALL = "https://cdn.example.com/my-cool-track.mp3";
//   export const MUSIC_TRACKS = { 1:ALL, 2:ALL, 3:ALL, 4:ALL, 5:ALL, 6:ALL, 7:ALL };
//
// Set to null to fall back to procedural Web Audio music.

import Code from '../music/code.mp3'

export const MUSIC_TRACKS = {
  1: Code,  // e.g. "https://cdn.pixabay.com/audio/2024/01/01/something.mp3"
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
  7: null,
};

// Optional one-shot sound effect URLs. Any name set to null falls back to
// the procedural Web Audio implementation.
//
// Available SFX keys:
//   correctCommand  wrongCommand   flagCapture   levelUp
//   hint            timerWarning   timerCritical gameOver  victory

export const SFX_URLS = {
  correctCommand: null,
  wrongCommand:   null,
  flagCapture:    null,
  levelUp:        null,
  hint:           null,
  timerWarning:   null,
  timerCritical:  null,
  gameOver:       null,
  victory:        null,
};

// Master volumes (0.0 – 1.0)
export const VOLUMES = {
  music: 0.35,   // background music
  sfx:   0.6,    // sound effects (HTMLAudio fallback path)
};

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  IMPLEMENTATION — usually no need to edit below this line             ║
// ╚═══════════════════════════════════════════════════════════════════════╝

// ── Web Audio context (lazy) ────────────────────────────────────────────
let _ctx = null;
function getCtx() {
  if (!_ctx) {
    try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

// ── HTMLAudio music player ──────────────────────────────────────────────
let _musicEl       = null;   // single shared <audio> element
let _currentTrack  = null;   // URL currently loaded
let _muted         = false;

function ensureMusicEl() {
  if (_musicEl) return _musicEl;
  _musicEl = new Audio();
  _musicEl.loop     = true;
  _musicEl.volume   = VOLUMES.music;
  _musicEl.preload  = "auto";
  _musicEl.crossOrigin = "anonymous";
  // If autoplay is blocked, queue start on next user interaction
  _musicEl.addEventListener("error", (e) => {
    console.warn("[soundEngine] music load error:", e?.target?.error || e);
  });
  return _musicEl;
}

function playMusic(url) {
  if (!url) { stopMusic(); return; }
  const el = ensureMusicEl();

  // If already playing this exact URL, leave it alone (smooth between levels)
  if (_currentTrack === url && !el.paused) return;

  if (_currentTrack !== url) {
    el.src = url;
    _currentTrack = url;
  }
  el.volume = _muted ? 0 : VOLUMES.music;
  // play() returns a promise; ignore autoplay-block rejections silently
  const p = el.play();
  if (p && p.catch) p.catch(() => { /* user hasn't interacted yet */ });
}

function stopMusic() {
  if (!_musicEl) return;
  _musicEl.pause();
  try { _musicEl.currentTime = 0; } catch {}
  _currentTrack = null;
}

// ── Procedural Web Audio music fallback (used when MUSIC_TRACKS[level] is null)
let _bgOscNodes = [];
let _bgLoopTimer = null;

function stopProceduralMusic() {
  _bgOscNodes.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
  _bgOscNodes = [];
  if (_bgLoopTimer) { clearTimeout(_bgLoopTimer); _bgLoopTimer = null; }
}

function startProceduralMusic(tier = 0) {
  const ctx = getCtx();
  if (!ctx) return;
  stopProceduralMusic();

  const tiers = [
    { base: 55,  chord: [1, 1.5, 2],    rate: 4.0 },
    { base: 65,  chord: [1, 1.334, 2],  rate: 3.2 },
    { base: 80,  chord: [1, 1.25, 1.5], rate: 2.6 },
    { base: 100, chord: [1, 1.2, 1.8],  rate: 2.0 },
  ];
  const { base, chord, rate } = tiers[Math.min(tier, tiers.length - 1)];

  const masterGain = ctx.createGain();
  masterGain.gain.value = VOLUMES.music * 0.3;
  masterGain.connect(ctx.destination);
  _bgOscNodes.push(masterGain);

  const totalPulses = Math.ceil(60 / rate);
  for (let i = 0; i < totalPulses; i++) {
    const t = ctx.currentTime + i * rate;
    chord.forEach((ratio, hi) => {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = hi === 0 ? "sine" : "triangle";
      osc.frequency.value = base * ratio;
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.linearRampToValueAtTime(hi === 0 ? 0.06 : 0.025, t + 0.2);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(amp); amp.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.7);
      _bgOscNodes.push(osc, amp);
    });
  }

  _bgLoopTimer = setTimeout(() => startProceduralMusic(tier), 59500);
}

// ── HTMLAudio SFX cache ─────────────────────────────────────────────────
const _sfxCache = new Map();

function playSfxUrl(url) {
  if (!url || _muted) return false;
  let el = _sfxCache.get(url);
  if (!el) {
    el = new Audio(url);
    el.preload     = "auto";
    el.crossOrigin = "anonymous";
    el.volume      = VOLUMES.sfx;
    _sfxCache.set(url, el);
  }
  // Clone-on-play so rapid-fire SFX overlap properly
  const clone = el.cloneNode();
  clone.volume = VOLUMES.sfx;
  const p = clone.play();
  if (p && p.catch) p.catch(() => {});
  return true;
}

// ── Procedural tone helpers ─────────────────────────────────────────────
function tone({ freq = 440, type = "sine", dur = 0.12, gain = 0.15, decay = 0.08, delay = 0 } = {}) {
  if (_muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.linearRampToValueAtTime(gain, t + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + decay);
  osc.connect(amp); amp.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + decay + 0.05);
}

function seq(notes, intervalMs = 80) {
  notes.forEach((n, i) => tone({ ...n, delay: (n.delay || 0) + i * intervalMs / 1000 }));
}

// Helper: try CDN URL first, fall back to procedural notes
function playSfx(name, fallback) {
  const url = SFX_URLS[name];
  if (url && playSfxUrl(url)) return;
  fallback();
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  PUBLIC API                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════╝
export const SFX = {

  // ── Background music ────────────────────────────────────────────────
  /** Start (or switch to) background music for the given level (1-7). */
  bgMusicLevel(levelId = 1) {
    const url = MUSIC_TRACKS[levelId];
    if (url) {
      stopProceduralMusic();
      playMusic(url);
    } else {
      // No CDN track configured — fall back to procedural pulses
      stopMusic();
      const tier = levelId <= 2 ? 0 : levelId <= 4 ? 1 : levelId <= 6 ? 2 : 3;
      startProceduralMusic(tier);
    }
  },

  /** Stop all background music (CDN + procedural). */
  stopBg() {
    stopMusic();
    stopProceduralMusic();
  },

  /** Mute or unmute everything. */
  setMuted(value) {
    _muted = !!value;
    if (_musicEl) _musicEl.volume = _muted ? 0 : VOLUMES.music;
  },

  /** Adjust music volume on the fly (0.0 – 1.0). */
  setMusicVolume(v) {
    VOLUMES.music = Math.max(0, Math.min(1, v));
    if (_musicEl) _musicEl.volume = _muted ? 0 : VOLUMES.music;
  },

  /** Adjust SFX volume on the fly (0.0 – 1.0). */
  setSfxVolume(v) {
    VOLUMES.sfx = Math.max(0, Math.min(1, v));
  },

  // ── Sound effects ───────────────────────────────────────────────────

  correctCommand() {
    playSfx("correctCommand", () => seq([
      { freq: 880,  type: "sine", dur: 0.05, gain: 0.14, decay: 0.05 },
      { freq: 1108, type: "sine", dur: 0.06, gain: 0.12, decay: 0.06 },
    ], 60));
  },

  wrongCommand() {
    playSfx("wrongCommand", () => seq([
      { freq: 260, type: "sawtooth", dur: 0.08, gain: 0.18, decay: 0.05 },
      { freq: 200, type: "sawtooth", dur: 0.10, gain: 0.15, decay: 0.08 },
    ], 90));
  },

  flagCapture() {
    playSfx("flagCapture", () => seq([
      { freq: 523,  type: "sine", dur: 0.09, gain: 0.20, decay: 0.04 },
      { freq: 659,  type: "sine", dur: 0.09, gain: 0.20, decay: 0.04 },
      { freq: 784,  type: "sine", dur: 0.09, gain: 0.20, decay: 0.04 },
      { freq: 1047, type: "sine", dur: 0.09, gain: 0.22, decay: 0.04 },
      { freq: 1319, type: "sine", dur: 0.22, gain: 0.25, decay: 0.25 },
    ], 100));
  },

  levelUp() {
    playSfx("levelUp", () => seq([
      { freq: 392, type: "triangle", dur: 0.07, gain: 0.17, decay: 0.04 },
      { freq: 523, type: "triangle", dur: 0.07, gain: 0.17, decay: 0.04 },
      { freq: 659, type: "triangle", dur: 0.07, gain: 0.17, decay: 0.04 },
      { freq: 784, type: "triangle", dur: 0.14, gain: 0.20, decay: 0.15 },
    ], 85));
  },

  hint() {
    playSfx("hint", () => seq([
      { freq: 740, type: "sine", dur: 0.07, gain: 0.13, decay: 0.04 },
      { freq: 587, type: "sine", dur: 0.11, gain: 0.11, decay: 0.10 },
    ], 110));
  },

  timerWarning() {
    playSfx("timerWarning", () =>
      tone({ freq: 440, type: "square", dur: 0.06, gain: 0.12, decay: 0.06 })
    );
  },

  timerCritical() {
    playSfx("timerCritical", () => seq([
      { freq: 880, type: "square", dur: 0.05, gain: 0.18, decay: 0.03 },
      { freq: 880, type: "square", dur: 0.05, gain: 0.18, decay: 0.03 },
    ], 80));
  },

  gameOver() {
    SFX.stopBg();
    playSfx("gameOver", () => seq([
      { freq: 660, type: "sawtooth", dur: 0.14, gain: 0.22, decay: 0.06 },
      { freq: 550, type: "sawtooth", dur: 0.14, gain: 0.20, decay: 0.06 },
      { freq: 440, type: "sawtooth", dur: 0.14, gain: 0.18, decay: 0.06 },
      { freq: 330, type: "sawtooth", dur: 0.22, gain: 0.15, decay: 0.18 },
      { freq: 220, type: "sawtooth", dur: 0.30, gain: 0.12, decay: 0.25 },
    ], 130));
  },

  victory() {
    SFX.stopBg();
    playSfx("victory", () => seq([
      { freq: 523,  type: "sine", dur: 0.09, gain: 0.20, decay: 0.04 },
      { freq: 659,  type: "sine", dur: 0.09, gain: 0.20, decay: 0.04 },
      { freq: 784,  type: "sine", dur: 0.09, gain: 0.20, decay: 0.04 },
      { freq: 1047, type: "sine", dur: 0.09, gain: 0.22, decay: 0.04 },
      { freq: 1319, type: "sine", dur: 0.16, gain: 0.25, decay: 0.12 },
      { freq: 1568, type: "sine", dur: 0.30, gain: 0.28, decay: 0.35 },
    ], 95));
  },
};

// ── Auto-resume audio context on first user interaction ─────────────────
// Browsers block audio until user has clicked/typed. This silently kicks
// the context awake on the first interaction so subsequent sounds play.
if (typeof window !== "undefined") {
  const wake = () => {
    getCtx();
    // If music was queued before interaction, restart it
    if (_musicEl && _musicEl.src && _musicEl.paused) {
      const p = _musicEl.play();
      if (p && p.catch) p.catch(() => {});
    }
    window.removeEventListener("click",   wake);
    window.removeEventListener("keydown", wake);
    window.removeEventListener("touchstart", wake);
  };
  window.addEventListener("click",      wake, { once: false });
  window.addEventListener("keydown",    wake, { once: false });
  window.addEventListener("touchstart", wake, { once: false });
}
