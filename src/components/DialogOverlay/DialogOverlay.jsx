// src/components/Dialog/DialogOverlay.jsx
import "./DialogOverlay.css";

function whoLabel(who) {
  if (who === "PLAYER") return "Tú";
  if (who === "ENEMY")  return "Rival";
  return "";
}

export default function DialogOverlay({ lines = [], index = 0, onNext }) {
  const line = lines[index] || null;
  if (!line) return null;
  const sideClass =
    line.who === "PLAYER" ? "dlg--player" :
    line.who === "ENEMY"  ? "dlg--enemy"  : "dlg--narrator";

  return (
    <div className="dlg">
      <div className={`dlg__bubble ${sideClass}`}>
        {line.who !== "NARRATOR" ? <div className="dlg__name">{whoLabel(line.who)}</div> : null}
        <div className="dlg__text">{line.text}</div>
      </div>
      <button className="dlg__next" onClick={onNext}>Continuar</button>
    </div>
  );
}
