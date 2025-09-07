// src/components/Exit/ExitButton.jsx
import "./ExitButton.css";

/**
 * Botón "Salir" que navega a la pantalla de selección.
 * Usa <a href="/select"> para funcionar con o sin router.
 */
export default function ExitButton({ href = "/select", label = "Salir" }) {
  return (
    <a className="exit-btn" href={href} aria-label={label}>
      <span className="exit-btn__label">{label}</span>
    </a>
  );
}
