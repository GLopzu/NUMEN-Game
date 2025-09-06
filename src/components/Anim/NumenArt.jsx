// src/components/Anim/NumenArt.jsx
import "./NumenArt.css";

export default function NumenArt({
  src,
  alt = "Numen",
  side = "player",   // "player" | "enemy"
  anim = null,       // "melee"|"attack"|null
  hit = false,
}) {
  const isPlayer = side === "player";
  const isAttack = anim === "melee" || anim === "attack";

  const animClass = isAttack
    ? isPlayer
      ? "anim-attack--player"
      : "anim-attack--enemy"
    : "";

  const hitClass = hit ? "is-hit" : "";

  return (
    <div className={`side__art ${animClass} ${hitClass}`.trim()}>
      {src ? <img src={src} alt={alt} /> : null}
    </div>
  );
}
