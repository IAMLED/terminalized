// src/context/GameContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from "react";
import { LEVELS, SCORING } from "../data/levels";

const GameContext = createContext(null);

const INITIAL_STATE = {
  currentLevel: 1,
  score: 0,
  levelScore: 0,        // score earned on current level only
  hintsRemaining: 2,
  completedLevels: [],
  levelStartTime: Date.now(),
  totalTime: 0,
  commandHistory: [],
  gameStarted: false,
  gameComplete: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "START_GAME":
      return { ...INITIAL_STATE, gameStarted: true, levelStartTime: Date.now() };

    case "ADD_SCORE": {
      const level = LEVELS.find(l => l.id === state.currentLevel);
      const cap = level?.pointsAvailable ?? Infinity;
      // Don't let levelScore exceed the cap
      const newLevelScore = Math.min(cap, Math.max(0, state.levelScore + action.points));
      const delta = newLevelScore - state.levelScore;
      return {
        ...state,
        score: Math.max(0, state.score + delta),
        levelScore: newLevelScore,
      };
    }

    case "COMPLETE_LEVEL": {
      const elapsed = Date.now() - state.levelStartTime;
      const level = LEVELS.find(l => l.id === state.currentLevel);
      const timeLimitMs = (level?.timeLimitSecs ?? 600) * 1000;
      // Time bonus: up to 50 pts for finishing quickly (scales with time limit)
      const timeBonus = action.expired ? 0 : Math.max(0, Math.floor((timeLimitMs - elapsed) / timeLimitMs * 50));
      const completed = [...new Set([...state.completedLevels, state.currentLevel])];
      return {
        ...state,
        score: state.score + SCORING.completeLevel + timeBonus,
        levelScore: state.levelScore,   // keep as-is; reset on NEXT_LEVEL
        completedLevels: completed,
        totalTime: state.totalTime + elapsed,
      };
    }

    case "NEXT_LEVEL": {
      if (state.currentLevel >= LEVELS.length) {
        return { ...state, gameComplete: true };
      }
      return {
        ...state,
        currentLevel: state.currentLevel + 1,
        levelScore: 0,
        hintsRemaining: 3,
        levelStartTime: Date.now(),
      };
    }

    case "USE_HINT":
      if (state.hintsRemaining <= 0) return state;
      return {
        ...state,
        hintsRemaining: state.hintsRemaining - 1,
        score: Math.max(0, state.score + SCORING.hintUsage),
        levelScore: Math.max(0, state.levelScore + SCORING.hintUsage),
      };

    case "TIME_EXPIRED": {
      // Penalise and move on
      const newScore = Math.max(0, state.score + SCORING.timeExpiredPenalty);
      const completed = [...new Set([...state.completedLevels, state.currentLevel])];
      return {
        ...state,
        score: newScore,
        completedLevels: completed,
        totalTime: state.totalTime + (Date.now() - state.levelStartTime),
      };
    }

    case "ADD_COMMAND":
      return { ...state, commandHistory: [...state.commandHistory.slice(-50), action.command] };

    case "RESTART":
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const startGame     = useCallback(() => dispatch({ type: "START_GAME" }), []);
  const addScore      = useCallback((points) => dispatch({ type: "ADD_SCORE", points }), []);
  const completeLevel = useCallback((expired = false) => dispatch({ type: "COMPLETE_LEVEL", expired }), []);
  const nextLevel     = useCallback(() => dispatch({ type: "NEXT_LEVEL" }), []);
  const useHint       = useCallback(() => dispatch({ type: "USE_HINT" }), []);
  const addCommand    = useCallback((cmd) => dispatch({ type: "ADD_COMMAND", command: cmd }), []);
  const restart       = useCallback(() => dispatch({ type: "RESTART" }), []);
  const timeExpired   = useCallback(() => dispatch({ type: "TIME_EXPIRED" }), []);

  const currentLevelData = LEVELS.find((l) => l.id === state.currentLevel) || LEVELS[0];

  return (
    <GameContext.Provider value={{
      ...state,
      currentLevelData,
      totalLevels: LEVELS.length,
      startGame, addScore, completeLevel, nextLevel,
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
