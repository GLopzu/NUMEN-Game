// src/components/Side/PlayerSide.jsx
import "./PlayerSide.css";
import "../NumenHP/NumenHP";
import "../Anim/NumenArt.css";

export default function PlayerSide({
  hp = 0,
  art = null,
  hit = false,
  anim = null,
  swap = null,
  children = null,
}) {
  const isAttack = anim === "melee" || anim === "attack";
  const animClass = isAttack ? "anim-attack--player" : "";
  const swapClass = swap === "in" ? "anim-switch-in" : swap === "out" ? "anim-switch-out" : "";

  return (
    <section className="side side--player">
      <div className={`side__art ${animClass} ${swapClass} ${hit ? "is-hit" : ""}`.trim()}>
        {art ? <img src={art} alt="Jugador" /> : null}
      </div>

      <div className="hud hud--player">
        <div className="hp-badge">
          {hp ?? 0}
          <span className="hp-badge__unit">·pdv</span>
        </div>
        <div className="hud__menu">{children}</div>
      </div>
    </section>
  );
}
