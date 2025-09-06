// src/components/Side/EnemySide.jsx
import "./EnemySide.css";
import "../NumenHP/NumenHP"
import "../Anim/NumenArt.css";

export default function EnemySide({ hp = 0, art = null, hit = false, anim = null }) {
  const isAttack = anim === "melee" || anim === "attack";
  const animClass = isAttack ? "anim-attack--enemy" : "";

  return (
    <section className="side side--enemy">
      {/* Arte anclado abajo-izquierda del contenedor */}
      <div className={`side__art ${animClass} ${hit ? "is-hit" : ""}`}>
        {art ? <img src={art} alt="Enemigo" /> : null}
      </div>

      {/* HUD FIJO (solo HP aquí) */}
      <div className="hud hud--enemy">
        <div className={`hp-badge ${hit ? "is-hit" : ""}`}>
          {hp ?? 0}
          <span className="hp-badge__unit">·pdv</span>
        </div>
      </div>
    </section>
  );
}
