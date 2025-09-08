import "./SwitchTray.css";
import "../NumenHP/NumenHP"

/**
 * Menú superior derecho que muestra la banca.
 * Siempre visible; sólo interactivo cuando enabled === true.
 * Imagen priorizada: relevo -> frame -> select -> idle
 * Si el numen está derrotado (defeated) se renderiza deshabilitado y con badge “K.O.”.
 */
export default function SwitchTray({
  enabled = false,
  bench = [],
  onChoose,   // (index) => void
  onCancel,   // () => void
}) {
  const stateClass = enabled ? "is-enabled" : "is-disabled";
  return (
    <div className={`switch-tray ${stateClass}`}>
      <div className="switch-tray__header">
        <div className="switch-tray__title"></div>
        {enabled ? (
          <button className="switch-tray__close" onClick={onCancel} title="Cancelar relevo">✕</button>
        ) : null}
      </div>

      <div className="switch-tray__list">
        {bench.map((n, i) => {
          const src = n.relevo || n.frame || n.select || n.idle || "";
          const ko  = !!n.defeated || (n.hp ?? n.maxHp) <= 0;
          return (
            <button
              key={i}
              className={`switch-tray__item ${ko ? "is-ko" : ""}`}
              onClick={enabled && !ko ? () => onChoose(i) : undefined}
              disabled={!enabled || ko}
              title={n.name}
            >
              <div className="switch-tray__img">
                {src ? <img src={src} alt={n.name} draggable="false" /> : <div className="ph" />}
                {ko ? <span className="switch-tray__badge">K.O.</span> : null}
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
