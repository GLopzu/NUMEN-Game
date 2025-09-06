// src/components/BattleMenu/BattleMenu.jsx
import "./BattleMenu.css";

export default function BattleMenu({
  onAttack,
  onSkills,
  onGuard,
  onSwitch,
  canAttack = true,
  canSkills = false,
  canGuard = false,
  canSwitch = false,
}) {
  return (
    <div className="battle-menu">
      <button
        className="btn"
        onClick={canAttack ? onAttack : undefined}
        disabled={!canAttack}
        aria-disabled={!canAttack}
      >
        <span className="btn__label">Ataque</span>
      </button>

      <button
        className="btn"
        onClick={canSkills ? onSkills : undefined}
        disabled={!canSkills}
        aria-disabled={!canSkills}
      >
        <span className="btn__label">Habilidades</span>
      </button>

      <button
        className="btn"
        onClick={canGuard ? onGuard : undefined}
        disabled={!canGuard}
        aria-disabled={!canGuard}
      >
        <span className="btn__label">Guardia</span>
      </button>

      <button
        className="btn"
        onClick={canSwitch ? onSwitch : undefined}
        disabled={!canSwitch}
        aria-disabled={!canSwitch}
      >
        <span className="btn__label">Relevo</span>
      </button>
    </div>
  );
}
