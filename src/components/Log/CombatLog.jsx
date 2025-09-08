export default function CombatLog({ phase, turn, usesLeft, winner, last, onReset }) {
  const rows = [];

  rows.push(
    <p key="hdr">
      Turno: <b>{turn === "PLAYER" ? "Jugador" : "Enemigo"}</b>
      {usesLeft !== null && usesLeft !== undefined ? (
        <> · Usos restantes: <b>{usesLeft}</b></>
      ) : null}
    </p>
  );

  if (last) {
    if (last.action === "basic" || last.action === "attack") {
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
              Objetivo estaba en Guardia → se activó: mitigación{" "}
              {last.guard?.flip === "cara" ? "100%" : "70%"} · Daño final:{" "}
              {last.guard?.finalDmg ?? 0}
            </p>
          );
        } else {
          rows.push(
            <p key="g2">
              El objetivo estaba en Guardia, pero el golpe falló (la Guardia se mantiene).
            </p>
          );
        }
      }
    } else if (last.action === "guard") {
      rows.push(<p key="grd">{last.who === "PLAYER" ? "Jugador" : "Enemigo"} entra en Guardia.</p>);
    } else if (last.action === "switch") {
      rows.push(<p key="sw">Relevo: {last.from} → {last.to}</p>);
    } else if (last.action === "koSwitch") {
      rows.push(<p key="ko1">¡K.O.! {last.target === "PLAYER" ? "Jugador" : "Enemigo"} cambia forzadamente.</p>);
      rows.push(<p key="ko2">Entra: <b>{last.to}</b></p>);
    } else if (last.action === "pass") {
      rows.push(<p key="ps">{last.who === "PLAYER" ? "Jugador" : "Enemigo"} pasa turno.</p>);
    }
    if (last.after?.autopass) {
      rows.push(
        <p key="ap">
          {last.after.autopass === "PLAYER" ? "Jugador" : "Enemigo"} estaba en Guardia → turno
          saltado automáticamente.
        </p>
      );
    }
  }

  if (phase !== "play") {
    rows.push(
      <p key="end">
        Ganador: <b>{winner}</b>{" "}
        <button style={{ marginLeft: 8 }} onClick={onReset}>
          Reiniciar
        </button>
      </p>
    );
  }

  return <div className="log">{rows}</div>;
}
