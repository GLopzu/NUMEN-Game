// src/pages/NumenDuel.jsx
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect, useRef } from "react";
import {
  attack,
  reset,
  pass,
  consts,
  enterSwitch,
  cancelSwitch,
  switchTo,
  guard as guardAction,
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

  // Arena
  const arena = useMemo(() => getArena(ARENA_ID), []);
  const arenaSrc = arena?.src;

  // Arte dinámico por turno (tu Numen usa "select" en tu turno)
  const playerArt =
    (st.phase === "play" && st.turn === PLAYER
      ? st.player?.select || st.player?.idle
      : st.player?.idle || st.player?.select) || null;

  const enemyArt = st.enemy?.Enemy || st.enemy?.idle || null;

  // Ataques
  const pAtk = st.player?.attacks?.[0] || null;
  const eAtk = st.enemy?.attacks?.[0] || null;

  const playerIsGuard = !!st.playerGuard;
  const playerGuardCD = st.playerGuardCD || 0;

  const canAttack =
    st.phase === "play" &&
    st.turn === PLAYER &&
    !playerIsGuard &&
    pAtk &&
    (pAtk.uses ?? 0) > 0;

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

  // Animación de entrada
  useEffect(() => {
    playerAnim.triggerEnter();
    enemyAnim.triggerEnter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // DEBUG: ver cada cambio de turno y tick
  useEffect(() => {
    console.log("[UI] phase:", st.phase, "| turn:", st.turn, "| tick:", st.turnTick);
  }, [st.phase, st.turn, st.turnTick]);

  // === Failsafe: si llega mi turno y sigo en Guardia, paso automático ===
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

  // === IA ENEMIGA ===
  // Depende de turnTick además del turno; así actúa tras autopass aunque el turno siga en ENEMY.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (st.phase !== "play") return;
    if (st.turn !== ENEMY) return;

    const t = setTimeout(() => {
      if (st.enemyGuard) {
        console.log("[AI] enemy in guard → PASS");
        dispatch(pass(ENEMY));
        return;
      }
      console.log("[AI] enemy ATTACK");
      enemyAnim.triggerMelee();
      playerAnim.triggerHit();
      dispatch(attack(ENEMY));
    }, 600);

    return () => clearTimeout(t);
    // 👇 agregamos turnTick y autopass para que SIEMPRE reaccione
  }, [st.phase, st.turn, st.enemyGuard, st.turnTick, st.last?.after?.autopass, dispatch]);

  // Acciones del jugador
  const doAttack = () => {
    if (!canAttack) return;
    playerAnim.triggerMelee();
    enemyAnim.triggerHit();
    dispatch(attack(PLAYER));
  };

  const usesLeft = st.turn === PLAYER ? (pAtk?.uses ?? 0) : (eAtk?.uses ?? 0);

  // Relevo (salida → switch → entrada)
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
      {/* Botón Salir */}
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
          onGuard={() => canGuard && dispatch(guardAction(PLAYER))}
          onSwitch={() => canSwitch && dispatch(enterSwitch(PLAYER))}
          canAttack={!!canAttack}
          canSkills={false}
          canGuard={!!canGuard}
          canSwitch={!!canSwitch}
        />
      </PlayerSide>

      {/* Menú de relevo */}
      <SwitchTray
        enabled={st.switchMode}
        bench={st.bench || []}
        onChoose={handleSwitchChoose}
        onCancel={() => dispatch(cancelSwitch())}
      />

      {/* Log */}
      <CombatLog
        phase={st.phase}
        turn={st.turn}
        usesLeft={usesLeft}
        winner={st.winner}
        last={st.last}
        onReset={() => dispatch(reset())}
      />
    </main>
  );
}
