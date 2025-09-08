// src/components/KOOverlay/KOOverlay.jsx
import "./KOOverlay.css";

export default function KOOverlay({ side = "enemy", src = null }) {
  if (!src) return null;
  return (
    <div className={`ko ${side === "player" ? "ko--player" : "ko--enemy"}`}>
      <img src={src} alt="KO" />
    </div>
  );
}
