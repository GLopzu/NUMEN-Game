// src/pages/NumenDuel.jsx
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { attack, pass, reset, consts } from "../store/duelSlice";
import { ARENAS, getArena } from "../data/arenas";
import ActionButton from "../components/index";
import "./NumenDuel.css";

const ARENA_ID = "arena1";

function useLastLines(last, consts) {
  if (!last) return [];
  const whoTxt = last.who === consts.PLAYER ? "El jugador" : "El jugador enemigo";
  if (last.flip) {
    const l1 = `${whoTxt} sacó ${last.flip}`;
    const l2 = last.dmg > 0 ? `${whoTxt} hizo ${last.dmg} de daño` : `${whoTxt} no hizo daño`;
    return [l1, l2];
  }
  return [`${whoTxt} pasó el turno`];
}

export default function NumenDuel() {
  const dispatch = useDispatch();
  const st = useSelector((s) => s.duel);
  const { PLAYER, ENEMY } = consts;

  // --- estado de animación / lock de UI ---
  const [anim, setAnim] = useState({ p: false, e: false });  // p: player, e: enemy
  const [hit,  setHit]  = useState({ p: false, e: false });  // “temblor” objetivo
  const [lock, setLock] = useState(false);                   // evita spam de acciones

  const lines = useLastLines(st.last, consts);

  // Arena seleccionada
  const arena = getArena(ARENA_ID) || ARENAS[0];
  const arenaStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.15)), url(${arena?.src ?? ""})`,
    }),
    [arena?.src]
  );

  const pAtk = st.player?.attacks?.[0];
  const eAtk = st.enemy?.attacks?.[0];

  // Imagen del jugador: idle normalmente, select cuando es su turno
  const playerImg =
    st.phase === "play" && st.turn === PLAYER && st.player?.select
      ? st.player.select
      : st.player?.idle;

  // Ejecuta animación + aplica el ataque (jugador o IA)
  const doAttack = (who) => {
    if (lock || st.phase !== "play" || st.turn !== who) return;

    const atk = who === PLAYER ? pAtk : eAtk;
    if (!atk || atk.uses <= 0) return;

    setLock(true);

    // 1) anim del atacante
    if (who === PLAYER) setAnim((a) => ({ ...a, p: true }));
    else setAnim((a) => ({ ...a, e: true }));

    // 2) pequeño “shake” del defensor en el impacto
    setTimeout(() => {
      if (who === PLAYER) setHit((h) => ({ ...h, e: true }));
      else setHit((h) => ({ ...h, p: true }));
    }, 260);

    // 3) aplicar daño (tirada de moneda) unos ms después del impacto
    setTimeout(() => {
      dispatch(attack(who));
    }, 300);

    // 4) quitar shake
    setTimeout(() => {
      if (who === PLAYER) setHit((h) => ({ ...h, e: false }));
      else setHit((h) => ({ ...h, p: false }));
    }, 520);

    // 5) terminar animación y desbloquear UI
    setTimeout(() => {
      setAnim({ p: false, e: false });
      setLock(false);
    }, 700);
  };

  // IA: cuando sea su turno y no haya lock
  useEffect(() => {
    if (st.phase !== "play" || st.turn !== ENEMY || lock) return;
    const t = setTimeout(() => {
      if (eAtk && eAtk.uses > 0) doAttack(ENEMY);
      else dispatch(pass(ENEMY));
    }, 600);
    return () => clearTimeout(t);
  }, [st.phase, st.turn, ENEMY, eAtk?.uses, lock]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="arena" style={arenaStyle}>
      {/* Salir y ronda */}
      <a className="arena__exit" href="#">Salir</a>
      <div className="arena__round">
        <span className="title">Ronda</span>
        <span className="num">01</span>
      </div>

      {/* Enemigo (izquierda) */}
      <section className="side side--enemy">
        <div className={`side__art ${anim.e ? "anim-melee-enemy" : ""} ${hit.e ? "is-hit" : ""}`}>
          {st.enemy?.Enemy ? (
            <img src={st.enemy.Enemy} alt="Enemigo" />
          ) : st.enemy?.idle ? (
            <img src={st.enemy.idle} alt="Enemigo" />
          ) : null}
        </div>
        <div className={`hp-badge ${hit.e ? "is-hit" : ""}`}>
          {st.enemy?.hp ?? 0}
          <span className="hp-badge__unit">·pdv</span>
        </div>
      </section>

      {/* Jugador (derecha) */}
      <section className="side side--player">
        <div className={`hp-badge ${hit.p ? "is-hit" : ""}`}>
          {st.player?.hp ?? 0}
          <span className="hp-badge__unit">·pdv</span>
        </div>
        <div className={`side__art ${anim.p ? "anim-melee-player" : ""} ${hit.p ? "is-hit" : ""}`}>
          {playerImg ? <img src={playerImg} alt="Jugador" /> : null}
        </div>
      </section>

      {/* Menú de acciones con ActionButton (SVG inline) */}
      <nav className="actions">
        <ActionButton
          onClick={() => doAttack(PLAYER)}
          disabled={lock || st.phase !== "play" || st.turn !== PLAYER || !pAtk || pAtk.uses <= 0}
        >
          Habilidades
        </ActionButton>

        <ActionButton disabled title="En el duelo mínimo no hay Relevo">
          Relevo
        </ActionButton>

        <ActionButton disabled title="En el duelo mínimo no hay Guardia">
          Guardia
        </ActionButton>
      </nav>

      {/* Log inferior */}
      <div className="log">
        {st.phase === "play" ? (
          <p>
            Turno: <b>{st.turn}</b> · Usos restantes:{" "}
            <b>{st.turn === PLAYER ? (pAtk?.uses ?? 0) : (eAtk?.uses ?? 0)}</b>
          </p>
        ) : (
          <p>
            Ganador: <b>{st.winner}</b>{" "}
            <button style={{ marginLeft: 8 }} onClick={() => dispatch(reset())}>Reiniciar</button>
          </p>
        )}
        {lines.map((t, i) => <p key={i}>{t}</p>)}
      </div>
    </main>
  );
}
