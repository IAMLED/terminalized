// src/context/GameContext.jsx
import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";
import { LEVELS as BASE_LEVELS, SCORING } from "../data/levels";
import { buildLevelsWithFlags } from "../utils/flagGenerator";

const GameContext = createContext(null);

const INITIAL_STATE = {
  playerName:       "",
  currentLevel:     1,
  score:            0,
  levelScore:       0,
  hintsRemaining:   3,
  completedLevels:  [],
  levelStartTime:   Date.now(),
  totalTime:        0,
  commandHistory:   [],
  gameStarted:      false,
  gameComplete:     false,
  gameOver:         false,        // true when timer ran out
  flagsCapturedAt:  {},           // levelId → ms taken to capture
  // Per-session shuffled+injected levels (regenerated on START_GAME)
  levels:           BASE_LEVELS,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, playerName: (action.name || "").trim().slice(0, 24) };

    case "START_GAME": {
      // Build fresh per-session levels with random flags injected
      const sessionLevels = buildLevelsWithFlags(BASE_LEVELS);
      return {
        ...INITIAL_STATE,
        playerName:    state.playerName,
        levels:        sessionLevels,
        gameStarted:   true,
        levelStartTime: Date.now(),
      };
    }

    case "ADD_SCORE": {
      const level = state.levels.find(l => l.id === state.currentLevel);
      const cap   = level?.pointsAvailable ?? Infinity;
      const newLevelScore = Math.min(cap, Math.max(0, state.levelScore + action.points));
      const delta = newLevelScore - state.levelScore;
      return {
        ...state,
        score:      Math.max(0, state.score + delta),
        levelScore: newLevelScore,
      };
    }

    case "COMPLETE_LEVEL": {
      const elapsed     = Date.now() - state.levelStartTime;
      const level       = state.levels.find(l => l.id === state.currentLevel);
      const timeLimitMs = (level?.timeLimitSecs ?? 600) * 1000;
      // Time bonus: up to 100 pts for finishing in the first 25% of the limit,
      // scaling down to 0 at the deadline.
      const fractionLeft = Math.max(0, (timeLimitMs - elapsed) / timeLimitMs);
      const timeBonus    = Math.floor(fractionLeft * 100);
      const completed    = [...new Set([...state.completedLevels, state.currentLevel])];
      return {
        ...state,
        score: state.score + SCORING.completeLevel + timeBonus,
        completedLevels: completed,
        totalTime: state.totalTime + elapsed,
        flagsCapturedAt: { ...state.flagsCapturedAt, [state.currentLevel]: elapsed },
      };
    }

    case "NEXT_LEVEL": {
      if (state.currentLevel >= state.levels.length) {
        return { ...state, gameComplete: true };
      }
      return {
        ...state,
        currentLevel:   state.currentLevel + 1,
        levelScore:     0,
        hintsRemaining: 3,
        levelStartTime: Date.now(),
      };
    }

    case "USE_HINT":
      if (state.hintsRemaining <= 0) return state;
      return {
        ...state,
        hintsRemaining: state.hintsRemaining - 1,
        score:      Math.max(0, state.score + SCORING.hintUsage),
        levelScore: Math.max(0, state.levelScore + SCORING.hintUsage),
      };

    case "TIME_EXPIRED":
      return { ...state, gameOver: true };

    case "ADD_COMMAND":
      return { ...state, commandHistory: [...state.commandHistory.slice(-50), action.command] };

    case "RESTART":
      // Preserve player name across restart so they don't have to retype
      return { ...INITIAL_STATE, playerName: state.playerName };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const setName       = useCallback((name) => dispatch({ type: "SET_NAME", name }), []);
  const startGame     = useCallback(() => dispatch({ type: "START_GAME" }), []);
  const addScore      = useCallback((points) => dispatch({ type: "ADD_SCORE", points }), []);
  const completeLevel = useCallback(() => dispatch({ type: "COMPLETE_LEVEL" }), []);
  const nextLevel     = useCallback(() => dispatch({ type: "NEXT_LEVEL" }), []);
  const useHint       = useCallback(() => dispatch({ type: "USE_HINT" }), []);
  const addCommand    = useCallback((cmd) => dispatch({ type: "ADD_COMMAND", command: cmd }), []);
  const restart       = useCallback(() => dispatch({ type: "RESTART" }), []);
  const timeExpired   = useCallback(() => dispatch({ type: "TIME_EXPIRED" }), []);

  const currentLevelData = useMemo(
    () => state.levels.find(l => l.id === state.currentLevel) || state.levels[0],
    [state.levels, state.currentLevel],
  );

  return (
    <GameContext.Provider value={{
      ...state,
      currentLevelData,
      totalLevels: state.levels.length,
      setName, startGame, addScore, completeLevel, nextLevel,
      useHint, addCommand, restart, timeExpired,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
