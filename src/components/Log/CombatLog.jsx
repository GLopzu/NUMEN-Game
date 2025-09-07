import "./CombatLog.css";

function whoLabel(who) {
  if (who === "PLAYER") return "Jugador";
  if (who === "ENEMY") return "Enemigo";
  return who || "";
}

export default function CombatLog({ phase, turn, usesLeft, winner, last, onReset }) {
  const lines = [];

  if (phase === "play") lines.push(`Turno: ${whoLabel(turn)} · Usos restantes: ${usesLeft ?? 0}`);
  else lines.push(`Ganador: ${whoLabel(winner)}`);

  if (last?.action === "attack") {
    const attacker = whoLabel(last.who);
    const hitTxt = last.hitLanded ? "Cara (golpea)" : "Cruz (falla)";
    const dmgTxt = `Daño final: ${last.dmg ?? 0}`;
    lines.push(`${attacker} ataca · Moneda: ${hitTxt} · ${dmgTxt}`);

    if (last.guarded) {
      if (last.guard?.wasHit) {
        const gFlipTxt = last.guard.flip === "cara" ? "Cara" : "Cruz";
        const final    = last.guard.finalDmg ?? 0;
        const tail     = last.guard.consumed
          ? "Guardia consumida (CD 1)."
          : "Guardia se mantiene.";
        lines.push(`Objetivo en Guardia → Moneda: ${gFlipTxt} · Mitiga completamente → Daño final ${final} · ${tail}`);
      } else {
        lines.push("El atacante falló: la Guardia NO se activó y se mantiene.");
      }
    }
  } else if (last?.action === "guard") {
    lines.push(`${whoLabel(last.who)} entra en Guardia.`);
  } else if (last?.action === "switch") {
    lines.push(`${whoLabel(last.who)} realiza Relevo: ${last.from} → ${last.to}.`);
  } else if (last?.action === "pass") {
    const extra = last?.reason === "no_uses" ? " (sin usos disponibles)" : "";
    lines.push(`${whoLabel(last.who)} pasa el turno${extra}.`);
  }

  if (last?.after?.autopass) {
    const skip = whoLabel(last.after.autopass);
    lines.push(`${skip} está en Guardia → turno saltado automáticamente.`);
  }

  return (
    <div className="log">
      {phase === "play" ? (
        lines.map((t, i) => <p key={i}>{t}</p>)
      ) : (
        <p>
          {lines[0]}{" "}
          <button className="log__reset" onClick={onReset}>Reiniciar</button>
        </p>
      )}
    </div>
  );
}
