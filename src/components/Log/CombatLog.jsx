// src/components/Log/CombatLog.jsx
export default function CombatLog({ phase, turn, usesLeft, winner, onReset }) {
    return (
      <div className="log">
        {phase === "play" ? (
          <p>
            Turno: <b>{turn}</b> · Usos restantes: <b>{usesLeft}</b>
          </p>
        ) : (
          <p>
            Ganador: <b>{winner}</b>{" "}
            <button style={{ marginLeft: 8 }} onClick={onReset}>
              Reiniciar
            </button>
          </p>
        )}
      </div>
    );
  }
  