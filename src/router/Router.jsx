import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SelectNumen from "../pages/SelectNumen/SelectNumen"
import NumenDuel from "../pages/NumenDuel/NumenDuel"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/select" replace />} />
        <Route path="/select" element={<SelectNumen />} />
        <Route path="/duel" element={<NumenDuel />} />
      </Routes>
    </BrowserRouter>
  );
}
