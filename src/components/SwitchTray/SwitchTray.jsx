// src/components/SwitchTray/SwitchTray.jsx
import "./SwitchTray.css";
import "../NumenHP/NumenHP"

/**
 * Menú superior derecho que muestra la banca.
 * Siempre visible; sólo interactivo cuando enabled === true.
 * Imagen priorizada: relevo -> frame -> select -> idle
 */
export default function SwitchTray({
  enabled = false,
  bench = [],
  onChoose,   // (index) => void
  onCancel,   // () => void
}) {
  const stateClass = enabled ? "is-enabled" : "is-disabled";

  return (
    <div className={`switch-tray ${stateClass}`} aria-disabled={!enabled}>
      <div className="switch-tray__header">
        <span className="switch-tray__title">
          {enabled ? "Relevar a…" : "Banca (pulsa Relevo para cambiar)"}
        </span>
        {enabled ? (
          <button
            className="switch-tray__close"
            onClick={onCancel}
            aria-label="Cancelar relevo"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="switch-tray__list">
        {bench.map((n, i) => {
          const imgSrc = n.relevo || n.frame || n.select || n.idle || "";
          return (
            <button
              key={n.id || i}
              className="switch-tray__card"
              onClick={enabled ? () => onChoose(i) : undefined}
              disabled={!enabled}
              title={n.name}
            >
              <div className="switch-tray__img">
                {imgSrc ? <img src={imgSrc} alt={n.name} /> : null}
              </div>

              <div className="switch-tray__meta">
                <div className="switch-tray__name">{n.name}</div>
                <div className="switch-tray__hp hp-badge">
                  {n.hp ?? 0}
                  <span className="hp-badge__unit">·pdv</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
