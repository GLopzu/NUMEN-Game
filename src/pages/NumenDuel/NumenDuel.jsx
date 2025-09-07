// src/pages/NumenDuel.jsx
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect, useRef } from "react";
import { attack, reset, pass, consts, enterSwitch, cancelSwitch, switchTo } from "../../store/duelSlice";
import { getArena } from "../../data/arenas";

import BattleMenu from "../../components/BattleMenu/BattleMenu";
import PlayerSide from "../../components/Side/PlayerSide";
import EnemySide from "../../components/Side/EnemySide";
import CombatLog from "../../components/Log/CombatLog";
import useNumenAnim from "../../components/Anim/useNumenAnim";
import ExitButton from "../../components/Exit/ExitButton";
import SwitchTray from "../../components/SwitchTray/SwitchTray";

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
    st.phase === "play" && st.turn === PLAYER && pAtk && (pAtk.uses ?? 0) > 0;

  const hasBench  = (st.bench?.length || 0) > 0;
  const canSwitch = st.phase === "play" && st.turn === PLAYER && hasBench;

  const playerAnim = useNumenAnim();
  const enemyAnim  = useNumenAnim();

  // Entrada al montar
  useEffect(() => {
    playerAnim.triggerEnter();
    enemyAnim.triggerEnter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doAttack = () => {
    if (!canAttack) return;
    playerAnim.triggerMelee();
    enemyAnim.triggerHit();
    dispatch(attack(PLAYER));
  };

  // IA: responde tras tu acción
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

  // Relevo: salir -> switch -> entrar
  const handleSwitchChoose = async (idx) => {
    await playerAnim.startSwitchOut();
    dispatch(switchTo({ who: PLAYER, index: idx }));
    await playerAnim.startSwitchIn();
  };

  return (
    <main
      className="arena"
      style={arenaSrc ? { backgroundImage: `url(${arenaSrc})` } : undefined}
    >
      <ExitButton href="/select" />

      {/* Enemigo */}
      <EnemySide
        hp={st.enemy?.hp}
        art={enemyArt}
        hit={enemyAnim.hit}
        anim={enemyAnim.anim}
        swap={enemyAnim.swap}
      />

      {/* Jugador */}
      <PlayerSide
        hp={st.player?.hp}
        art={playerArt}
        hit={playerAnim.hit}
        anim={playerAnim.anim}
        swap={playerAnim.swap}
      >
        <BattleMenu
          onAttack={doAttack}
          onSkills={() => dispatch(pass(PLAYER))}
          onGuard={() => dispatch(pass(PLAYER))}
          onSwitch={() => canSwitch && dispatch(enterSwitch(PLAYER))}
          canAttack={!!canAttack}
          canSkills={false}
          canGuard={false}
          canSwitch={!!canSwitch}
        />
      </PlayerSide>

      {/* Menú de relevo: SIEMPRE VISIBLE; interactivo solo en switchMode */}
      <SwitchTray
        enabled={st.switchMode}
        bench={st.bench || []}
        onChoose={handleSwitchChoose}
        onCancel={() => dispatch(cancelSwitch())}
      />

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
