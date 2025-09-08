// src/components/Anim/NumenArt.jsx
import "./NumenArt.css";

export default function NumenArt({ src, alt, side, anim = null, hit = false, swap = null }) {
  // melee lateral
  const meleeClass =
    anim === "melee"
      ? side === "player"
        ? "anim-melee-player"
        : "anim-melee-enemy"
      : "";

  // golpe sacudida
  const hitClass = hit ? "is-hit" : "";

  // relevo / aparición (dirige por lado)
  const swapClass =
    swap === "out"
      ? side === "player"
        ? "anim-switch-out-player"
        : "anim-switch-out-enemy"
      : swap === "in" || swap === "enter"
      ? side === "player"
        ? "anim-switch-in-player"
        : "anim-switch-in-enemy"
      : "";

  return (
    <div className={`side__art ${meleeClass} ${hitClass} ${swapClass}`.trim()}>
      {src ? <img src={src} alt={alt} /> : null}
    </div>
  );
}
