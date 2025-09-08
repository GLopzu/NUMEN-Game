import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect } from "react";
import {
  reset,
  pass,
  consts,
  enterSwitch,
  cancelSwitch,
  switchTo,
  guard as guardAction,
  attackBasic,          // <<--- usar el nuevo ataque
} from "../../store/duelSlice";
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

  const playerIsGuard = !!st.playerGuard;
  const playerGuardCD = st.playerGuardCD || 0;

  // Ataque básico SIEMPRE (salvo guardia o estados futuros)
  const canAttack =
    st.phase === "play" &&
    st.turn === PLAYER &&
    !playerIsGuard;

  const hasBench  = (st.bench?.length || 0) > 0;
  const canSwitch =
    st.phase === "play" && st.turn === PLAYER && hasBench && !playerIsGuard;

  const canGuard =
    st.phase === "play" &&
    st.turn === PLAYER &&
    !playerIsGuard &&
    playerGuardCD === 0;

  // Animaciones
  const playerAnim = useNumenAnim();
  const enemyAnim  = useNumenAnim();

  useEffect(() => {
    playerAnim.triggerEnter();
    enemyAnim.triggerEnter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("[UI] phase:", st.phase, "| turn:", st.turn, "| tick:", st.turnTick);
  }, [st.phase, st.turn, st.turnTick]);

  // Failsafe: si me queda mi turno y estoy en Guardia, paso automáticamente
  useEffect(() => {
    if (st.phase !== "play") return;
    if (st.turn !== PLAYER) return;
    if (!st.playerGuard) return;

    if (st.switchMode) dispatch(cancelSwitch());

    const t = setTimeout(() => {
      console.log("[UI] Failsafe PASS (PLAYER still guarding)");
      dispatch(pass(PLAYER));
    }, 120);

    return () => clearTimeout(t);
  }, [st.phase, st.turn, st.playerGuard, st.switchMode, dispatch]);

  // IA enemiga
  useEffect(() => {
    if (st.phase !== "play" || st.turn !== ENEMY) return;

    const t = setTimeout(() => {
      if (st.enemyGuard) {
        console.log("[AI] enemy in guard → PASS");
        dispatch(pass(ENEMY));
        return;
      }
      console.log("[AI] enemy BASIC ATTACK");
      enemyAnim.triggerMelee();
      playerAnim.triggerHit();
      dispatch(attackBasic(ENEMY));
    }, 600);

    return () => clearTimeout(t);
  }, [st.phase, st.turn, st.enemyGuard, st.turnTick, st.last?.after?.autopass, dispatch, enemyAnim, playerAnim]);

  const doAttack = () => {
    if (!canAttack) return;
    playerAnim.triggerMelee();
    enemyAnim.triggerHit();
    dispatch(attackBasic(PLAYER));
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
          onSkills={() => dispatch(pass(PLAYER))}     // placeholder
          onGuard={() => dispatch(guardAction(PLAYER))}
          onSwitch={() => canSwitch && dispatch(enterSwitch(PLAYER))}
          canAttack={!!canAttack}
          canSkills={false}           // hasta que implementemos habilidades
          canGuard={!!canGuard}
          canSwitch={!!canSwitch}
        />
      </PlayerSide>

      {/* Menú de relevo */}
      <SwitchTray
        enabled={st.switchMode}
        bench={st.bench || []}
        onChoose={async (idx) => {
          await playerAnim.startSwitchOut();
          dispatch(switchTo({ who: PLAYER, index: idx }));
          await playerAnim.startSwitchIn();
        }}
        onCancel={() => dispatch(cancelSwitch())}
      />

      {/* Log (ya no mostramos "usos restantes" para ataque básico) */}
      <CombatLog
        phase={st.phase}
        turn={st.turn}
        usesLeft={null}
        winner={st.winner}
        last={st.last}
        onReset={() => dispatch(reset())}
      />
    </main>
  );
}
