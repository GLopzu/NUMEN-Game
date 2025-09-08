// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Start, SelectNumen, NumenDuel } from "../pages/index";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/select" element={<SelectNumen />} />
        <Route path="/duel" element={<NumenDuel />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
