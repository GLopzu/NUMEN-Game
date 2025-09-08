// src/pages/Start.jsx
import { useEffect, useCallback } from "react";
import "./Start.css";

/**
 * Pantalla de inicio.
 * Cambia bgSrc a la ruta de tu imagen (la que ya tiene logo + fondo).
 */
export default function Start() {
  const bgSrc = "/assets/ui/Home_backround.svg"; // <-- ajusta a tu ruta real

  const goSelect = useCallback(() => {
    window.location.assign("/select");
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        goSelect();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goSelect]);

  return (
    <main
      className="start"
      onClick={goSelect}
      style={{ backgroundImage: `url(${bgSrc})` }}
      role="button"
      aria-label="Click para empezar"
      tabIndex={0}
    >
      {/* Si quieres oscurecer un poco el fondo para el texto, deja el veil */}
      <div className="start__veil" />

      <p className="start__cta">Click para empezar</p>
    </main>
  );
}
