// src/components/Side/PlayerSide.jsx
import "./PlayerSide.css";
import "../NumenHP/NumenHP"
import "../Anim/NumenArt.css";

export default function PlayerSide({
  hp = 0,
  art = null,
  hit = false,
  anim = null,
  children = null,
}) {
  const isAttack = anim === "melee" || anim === "attack";
  const animClass = isAttack ? "anim-attack--player" : "";

  return (
    <section className="side side--player">
      {/* Arte anclado abajo-izquierda del contenedor */}
      <div className={`side__art ${animClass} ${hit ? "is-hit" : ""}`}>
        {art ? <img src={art} alt="Jugador" /> : null}
      </div>

      {/* HUD FIJO (no depende del tamaño del arte) */}
      <div className="hud hud--player">
        <div className={`hp-badge ${hit ? "is-hit" : ""}`}>
          {hp ?? 0}
          <span className="hp-badge__unit">·pdv</span>
        </div>

        <div className="hud__menu">
          {children /* BattleMenu (ya trae className="battle-menu") */}
        </div>
      </div>
    </section>
  );
}
