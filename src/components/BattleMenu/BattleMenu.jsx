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
      <button className="btn" onClick={canAttack ? onAttack : undefined} disabled={!canAttack}>
        Ataque
      </button>
      <button className="btn" onClick={canSkills ? onSkills : undefined} disabled={!canSkills}>
        Habilidades
      </button>
      <button className="btn" onClick={canGuard ? onGuard : undefined} disabled={!canGuard}>
        Guardia
      </button>
      <button className="btn" onClick={canSwitch ? onSwitch : undefined} disabled={!canSwitch}>
        Relevo
      </button>
    </div>
  );
}
