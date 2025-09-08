// src/components/Side/EnemySide.jsx
import "./EnemySide.css";
import "../NumenHP/NumenHP";
import "../Anim/NumenArt.css";

export default function EnemySide({ hp = 0, art = null, hit = false, anim = null, swap = null }) {
  const isAttack = anim === "melee" || anim === "attack";
  const animClass = isAttack ? "anim-attack--enemy" : "";
  const swapClass = swap === "in" ? "anim-switch-in" : swap === "out" ? "anim-switch-out" : "";

  return (
    <section className="side side--enemy">
      <div className={`side__art ${animClass} ${swapClass} ${hit ? "is-hit" : ""}`.trim()}>
        {art ? <img src={art} alt="Enemigo" /> : null}
      </div>

      <div className="hud hud--enemy">
        <div className="hp-badge">
          {hp ?? 0}
          <span className="hp-badge__unit">·pdv</span>
        </div>
      </div>
    </section>
  );
}
