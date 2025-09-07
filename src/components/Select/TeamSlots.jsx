// src/components/Select/TeamSlots.jsx
import "./TeamSlots.css";

export default function TeamSlots({ selected = [], onRemove, max = 3 }) {
  const slots = new Array(max).fill(null).map((_, i) => selected[i] || null);

  return (
    <div className="team">
      {slots.map((numen, i) => (
        <button
          key={i}
          className={`team__slot ${numen ? "is-filled" : ""}`}
          title={numen ? `${numen.name} (quitar)` : "Vacío"}
          onClick={() => numen && onRemove(i)}
        >
          {numen?.frame ? <img src={numen.frame} alt={numen.name} /> : null}
        </button>
      ))}
    </div>
  );
}
