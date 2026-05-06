// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import Welcome  from "./pages/Welcome";
import Game     from "./pages/Game";
import Victory  from "./pages/Victory";
import GameOver from "./pages/GameOver";

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Welcome />} />
          <Route path="/game"     element={<Game />} />
          <Route path="/victory"  element={<Victory />} />
          <Route path="/gameover" element={<GameOver />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}
