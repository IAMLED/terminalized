// src/App.jsx
import React from "react";
// HashRouter is used so refreshing on /game, /victory, /gameover etc. works
// without requiring server-side SPA fallback config. URLs look like #/game.
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import Welcome  from "./pages/Welcome";
import Game     from "./pages/Game";
import Victory  from "./pages/Victory";
import GameOver from "./pages/GameOver";

export default function App() {
  return (
    <GameProvider>
      <HashRouter>
        <Routes>
          <Route path="/"         element={<Welcome />} />
          <Route path="/game"     element={<Game />} />
          <Route path="/victory"  element={<Victory />} />
          <Route path="/gameover" element={<GameOver />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </GameProvider>
  );
}
