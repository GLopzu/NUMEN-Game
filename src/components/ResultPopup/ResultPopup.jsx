// src/components/ResultPopup/ResultPopup.jsx
import "./ResultPopup.css";

export default function ResultPopup({
  visible = false,
  type = "win", // 'win' | 'defeat' | 'final'
  levelName = "",
  onNextLevel,
  onRestartAll,
  onExit,
}) {
  if (!visible) return null;

  let title = "";
  let body = "";
  let actions = null;

  if (type === "win") {
    title = "¡Bien hecho!";
    body = `Has vencido en ${levelName}.`;
    actions = (
      <div className="rp__actions">
        <button className="rp__btn rp__btn--primary" onClick={onNextLevel}>
          Siguiente nivel
        </button>
      </div>
    );
  } else if (type === "defeat") {
    title = "Has sido derrotado";
    body =
      "Perdiste tu oportunidad de hacerte con el trono. Puedes volver a intentarlo desde el inicio, conservando tu equipo.";
    actions = (
      <div className="rp__actions">
        <button className="rp__btn" onClick={onExit}>Salir</button>
        <button className="rp__btn rp__btn--primary" onClick={onRestartAll}>
          Reiniciar desde el principio
        </button>
      </div>
    );
  } else {
    // final
    title = "¡Victoria total!";
    body =
      "Has acabado con todo un reino. Los súbditos se arrodillan… coronado rey de la nada.";
    actions = (
      <div className="rp__actions">
        <button className="rp__btn" onClick={onExit}>Volver a selección</button>
        <button className="rp__btn rp__btn--primary" onClick={onRestartAll}>
          Reiniciar desde el principio
        </button>
      </div>
    );
  }

  return (
    <div className="rp__backdrop">
      <div className="rp__card">
        <h3 className="rp__title">{title}</h3>
        <p className="rp__body">{body}</p>
        {actions}
      </div>
    </div>
  );
}
