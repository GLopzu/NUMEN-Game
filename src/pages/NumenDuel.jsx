// src/pages/NumenDuel.jsx
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect, useRef } from "react";
import { attack, reset, pass, consts } from "../store/duelSlice";
import { getArena } from "../data/arenas";

import BattleMenu from "../components/BattleMenu/BattleMenu";
import PlayerSide from "../components/Side/PlayerSide";
import EnemySide from "../components/Side/EnemySide";
import useNumenAnim from "../components/Anim/useNumenAnim";

import "./NumenDuel.css";

const ARENA_ID = "arena1";
const { PLAYER, ENEMY } = consts;

export default function NumenDuel() {
  const dispatch = useDispatch();
  const st = useSelector((s) => s.duel);

  // Fondo/arena
  const arena = useMemo(() => getArena(ARENA_ID), []);
  const arenaSrc = arena?.src;

  // === Arte dinámico por turno ===
  // Jugador: si es su turno -> usar "select"; si no, "idle"
  const playerArt =
    (st.phase === "play" && st.turn === PLAYER
      ? st.player?.select || st.player?.idle
      : st.player?.idle || st.player?.select) || null;

  // Enemigo: usar su arte de enemigo (o fallback a idle)
  const enemyArt = st.enemy?.Enemy || st.enemy?.idle || null;

  // Ataques (dinámicos por Numen)
  const pAtk = st.player?.attacks?.[0] || null;
  const eAtk = st.enemy?.attacks?.[0] || null;

  const canAttack =
    st.phase === "play" &&
    st.turn === PLAYER &&
    pAtk &&
    (pAtk.uses ?? 0) > 0;

  // Control de animaciones
  const playerAnim = useNumenAnim();
  const enemyAnim  = useNumenAnim();

  const doAttack = () => {
    if (!canAttack) return;
    // anim: mi Numen avanza; enemigo recibe
    playerAnim.triggerMelee();
    enemyAnim.triggerHit();
    dispatch(attack(PLAYER));
  };

  // IA enemiga: solo tras tu jugada (no al montar)
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (st.phase !== "play" || st.turn !== ENEMY) return;
    if (st.last?.who !== PLAYER) return;

    const t = setTimeout(() => {
      enemyAnim.triggerMelee();
      playerAnim.triggerHit();
      dispatch(attack(ENEMY));
    }, 600);

    return () => clearTimeout(t);
  }, [st.phase, st.turn, st.last?.who, dispatch]);

  const usesLeft = st.turn === PLAYER ? (pAtk?.uses ?? 0) : (eAtk?.uses ?? 0);

  return (
    <main
      className="arena"
      style={arenaSrc ? { backgroundImage: `url(${arenaSrc})` } : undefined}
    >
      {/* Enemigo (izquierda) */}
      <EnemySide
        hp={st.enemy?.hp}
        art={enemyArt}
        hit={enemyAnim.hit}
        anim={enemyAnim.anim}
      />

      {/* Jugador (derecha) */}
      <PlayerSide
        hp={st.player?.hp}
        art={playerArt}            // <<-- usa select en tu turno
        hit={playerAnim.hit}
        anim={playerAnim.anim}
      >
        <BattleMenu
          onAttack={doAttack}
          onSkills={() => dispatch(pass(PLAYER))}
          onGuard={() => dispatch(pass(PLAYER))}
          onSwitch={() => dispatch(pass(PLAYER))}
          canAttack={!!canAttack}
          canSkills={false}
          canGuard={false}
          canSwitch={false}
        />
      </PlayerSide>

      {/* Log */}
      <div className="log">
        {st.phase === "play" ? (
          <p>
            Turno: <b>{st.turn}</b> · Usos restantes: <b>{usesLeft}</b>
            {st.last && (
              <>
                {" "}· Última jugada: <b>{st.last.who}</b>
                {st.last.flip ? ` (${st.last.flip})` : ""}
                {typeof st.last.dmg === "number" ? ` · daño: ${st.last.dmg}` : ""}
              </>
            )}
          </p>
        ) : (
          <p>
            Ganador: <b>{st.winner}</b>{" "}
            <button style={{ marginLeft: 8 }} onClick={() => dispatch(reset())}>
              Reiniciar
            </button>
          </p>
        )}
      </div>
    </main>
  );
}
