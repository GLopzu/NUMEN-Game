// src/components/Select/NumenCard.jsx
import "./NumenCard.css";

export default function NumenCard({ numen, selected, disabled, onClick }) {
  const { id, name, frame, select, idle } = numen;

  // En selección usamos PRIORIDAD: frame → select → idle
  const src = frame || select || idle || "";

  return (
    <button
      className={`numen-card ${selected ? "is-selected" : ""}`}
      onClick={onClick}
      disabled={disabled && !selected}
      aria-pressed={selected}
      aria-label={name}
      title={name}
      data-id={id}
    >
      <div className="numen-card__img">
        {src ? (
          <img src={src} alt={name} draggable="false" />
        ) : (
          <div className="numen-card__ph" />
        )}
      </div>
      <div className="numen-card__name">{name}</div>
    </button>
  );
}
