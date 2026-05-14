// src/utils/flagGenerator.js
//
// Auto-generates unique flags for each level at game-start so players can't
// share or look up flags online. Each flag follows the flag{...} format
// but the inner content is random per session/per player.

// Memorable random tokens (no ambiguous chars like 0/O, 1/l/I)
const CHARSET = "abcdefghjkmnpqrstuvwxyz23456789";

function randomToken(length = 4) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return out;
}

/**
 * Generate a single flag: flag{xxxx-xxxx-xxxx}
 * 12 random chars across 3 hyphenated groups = ~58 bits of entropy.
 */
export function generateFlag() {
  return `flag{${randomToken(4)}-${randomToken(4)}-${randomToken(4)}}`;
}

/**
 * Generate a complete set of 7 distinct flags (one per level).
 * Returns an object keyed by level id.
 */
export function generateFlagSet() {
  const flags = {};
  const used  = new Set();
  for (let id = 1; id <= 7; id++) {
    let f;
    do { f = generateFlag(); } while (used.has(f));
    used.add(f);
    flags[id] = f;
  }
  return flags;
}

/**
 * Take a level definition and return a new copy with its flag injected
 * at the level's flagFile path inside fileSystem.
 *
 * The level can specify how the flag should be injected via flagInjection:
 *   - "replace": overwrite the entire file content with the flag string
 *   - "append":  append the flag to existing content (with a newline)
 *   - default:   "replace"
 *
 * Also replaces the level's static `flag` field with the new flag.
 */
export function injectFlagIntoLevel(level, generatedFlag) {
  if (!level.flagFile) {
    console.warn(`Level ${level.id} missing flagFile path`);
    return level;
  }

  const newFS  = { ...level.fileSystem };
  const target = newFS[level.flagFile];
  if (!target) {
    console.warn(`Level ${level.id}: flagFile '${level.flagFile}' not found in fileSystem`);
    return level;
  }

  // Replace any old flag{...} placeholder in the file content with the new flag
  const mode = level.flagInjection || "replace";
  let newContent;
  if (mode === "append") {
    newContent = `${target.content}\n${generatedFlag}`;
  } else if (mode === "placeholder") {
    // Replace any existing flag{...} pattern with the new one
    newContent = target.content.replace(/flag\{[^}]+\}/g, generatedFlag);
  } else {
    newContent = generatedFlag;
  }

  newFS[level.flagFile] = { ...target, content: newContent };
  return { ...level, fileSystem: newFS, flag: generatedFlag };
}

/**
 * Generate flags for all 7 levels and inject them into the level data.
 */
export function buildLevelsWithFlags(levels) {
  const flagSet = generateFlagSet();
  return levels.map(level => injectFlagIntoLevel(level, flagSet[level.id]));
}
