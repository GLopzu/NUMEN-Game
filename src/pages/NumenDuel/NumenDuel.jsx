// src/pages/NumenDuel.jsx
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect, useRef } from "react";
import { attack, reset, pass, consts } from "../../store/duelSlice";
import { getArena } from "../../data/arenas";

import BattleMenu from "../../components/BattleMenu/BattleMenu";
import PlayerSide from "../../components/Side/PlayerSide";
import EnemySide from "../../components/Side/EnemySide";
import CombatLog from "../../components/Log/CombatLog";
import useNumenAnim from "../../components/Anim/useNumenAnim";
import ExitButton from "../../components/Exit/ExitButton"; // <<--- IMPORTA AQUÍ

import "./NumenDuel.css";

const ARENA_ID = "arena1";
const { PLAYER, ENEMY } = consts;

export default function NumenDuel() {
  const dispatch = useDispatch();
  const st = useSelector((s) => s.duel);

  const arena = useMemo(() => getArena(ARENA_ID), []);
  const arenaSrc = arena?.src;

  const playerArt =
    (st.phase === "play" && st.turn === PLAYER
      ? st.player?.select || st.player?.idle
      : st.player?.idle || st.player?.select) || null;

  const enemyArt = st.enemy?.Enemy || st.enemy?.idle || null;

  const pAtk = st.player?.attacks?.[0] || null;
  const eAtk = st.enemy?.attacks?.[0] || null;

  const canAttack =
    st.phase === "play" &&
    st.turn === PLAYER &&
    pAtk &&
    (pAtk.uses ?? 0) > 0;

  const playerAnim = useNumenAnim();
  const enemyAnim  = useNumenAnim();

  const doAttack = () => {
    if (!canAttack) return;
    playerAnim.triggerMelee();
    enemyAnim.triggerHit();
    dispatch(attack(PLAYER));
  };

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
      {/* Botón Salir (arriba a la izquierda) */}
      <ExitButton href="/select" />

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
        art={playerArt}
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

      {/* Log inferior */}
      <CombatLog
        phase={st.phase}
        turn={st.turn}
        usesLeft={usesLeft}
        winner={st.winner}
        onReset={() => dispatch(reset())}
      />
    </main>
  );
}
