// src/components/Log/CombatLog.jsx
export default function CombatLog({ phase, turn, last, usesLeft }) {
  const rows = [];

  if (phase === "play") {
    rows.push(
      <p key="hdr">
        Turno: <b>{turn === "PLAYER" ? "Jugador" : "Enemigo"}</b>
        {usesLeft !== null && usesLeft !== undefined ? (
          <> · Usos restantes: <b>{usesLeft}</b></>
        ) : null}
      </p>
    );
  } else if (phase === "intro") {
    rows.push(<p key="intro">Diálogo inicial…</p>);
  }

  if (last) {
    if (last.action === "coinflip") {
      rows.push(
        <p key="coin">
          Moneda inicial: <b>{last.coin}</b> → Comienza:{" "}
          <b>{last.starts === "PLAYER" ? "Jugador" : "Enemigo"}</b>
        </p>
      );
    } else if (last.action === "basic" || last.action === "attack") {
      rows.push(
        <p key="atk">
          {last.who === "PLAYER" ? "Jugador" : "Enemigo"} ataca · Moneda:{" "}
          {last.hitLanded ? "Cara (éxito)" : "Cruz (falla)"} · Daño base: {last.dmg}
        </p>
      );
      if (last.guarded) {
        if (last.guard?.wasHit) {
          rows.push(
            <p key="g1">
              Objetivo en Guardia → Mitigación {last.guard?.flip === "cara" ? "100%" : "70%"} · Daño final: {last.guard?.finalDmg ?? 0}
            </p>
          );
        } else {
          rows.push(<p key="g2">El atacante falló; la Guardia permanece.</p>);
        }
      }
    } else if (last.action === "guard") {
      rows.push(<p key="grd">{last.who === "PLAYER" ? "Jugador" : "Enemigo"} entra en Guardia.</p>);
    } else if (last.action === "switch") {
      rows.push(<p key="sw">Relevo: {last.from} → {last.to}</p>);
    } else if (last.action === "koSwitch") {
      rows.push(<p key="ko1">¡K.O.! {last.target === "PLAYER" ? "Jugador" : "Enemigo"} cambia forzadamente.</p>);
    } else if (last.action === "pass") {
      rows.push(<p key="ps">{last.who === "PLAYER" ? "Jugador" : "Enemigo"} pasa turno.</p>);
    }
    if (last.after?.autopass) {
      rows.push(
        <p key="ap">
          {last.after.autopass === "PLAYER" ? "Jugador" : "Enemigo"} estaba en Guardia → turno saltado automáticamente.
        </p>
      );
    }
  }

  return <div className="log">{rows}</div>;
}
