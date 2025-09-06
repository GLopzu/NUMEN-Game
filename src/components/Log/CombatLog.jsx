// src/components/Log/CombatLog.jsx
import "./CombatLog.css";

export default function CombatLog({ phase, turn, usesLeft, winner, onReset }) {
  const isPlay = phase === "play";
  return (
    <div className="combat-log" role="status" aria-live="polite">
      <div className={`combat-log__panel ${isPlay ? "" : "is-end"}`}>
        {isPlay ? (
          <>
            <span className="combat-log__label">Turno:</span>
            <b className="combat-log__value">{turn}</b>
            <span className="combat-log__sep">·</span>
            <span className="combat-log__label">Usos restantes:</span>
            <b className="combat-log__value">{usesLeft}</b>
          </>
        ) : (
          <>
            <span className="combat-log__label">Ganador:</span>
            <b className="combat-log__value">{winner}</b>
            <button className="combat-log__btn" onClick={onReset}>
              Reiniciar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
