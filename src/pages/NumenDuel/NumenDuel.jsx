// src/pages/NumenDuel.jsx
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect } from "react";
import {
  startLevel, nextLevel, nextDialog,
  pass, consts,
  enterSwitch, cancelSwitch, switchTo,
  guard as guardAction, attackBasic,
} from "../../store/duelSlice";
import { getArena } from "../../data/arenas";
import { getLevel, getNextLevelId, DEFAULT_LEVEL_ID } from "../../data/levels";

import {
  BattleMenu,
  PlayerSide,
  EnemySide,
  CombatLog,
  ExitButton,
  SwitchTray,
  DialogOverlay,
  useNumenAnim,
} from "../../components";

import "./NumenDuel.css";

const { PLAYER, ENEMY } = consts;

export default function NumenDuel() {
  const dispatch = useDispatch();
  const st = useSelector((s) => s.duel);

  // Datos de nivel / arena
  const level = useMemo(() => getLevel(st.levelId || DEFAULT_LEVEL_ID), [st.levelId]);
  const arena  = useMemo(() => getArena(st.arenaId || level.arena), [st.arenaId, level.arena]);
  const arenaSrc = arena?.src;

  // Arte por turno (tu Numen usa 'select' en tu turno)
  const playerArt =
    (st.phase === "play" && st.turn === PLAYER
      ? st.player?.select || st.player?.idle
      : st.player?.idle || st.player?.select) || null;
  const enemyArt = st.enemy?.Enemy || st.enemy?.idle || null;

  // Habilitadores de acciones
  const playerIsGuard = !!st.playerGuard;
  const playerGuardCD = st.playerGuardCD || 0;

  const canAttack = st.phase === "play" && st.turn === PLAYER && !playerIsGuard;
  const hasBench  = (st.bench?.length || 0) > 0;
  const canSwitch = st.phase === "play" && st.turn === PLAYER && hasBench && !playerIsGuard;
  const canGuard  = st.phase === "play" && st.turn === PLAYER && !playerIsGuard && playerGuardCD === 0;

  // Siguiente nivel
  const nextId = getNextLevelId(st.levelId || DEFAULT_LEVEL_ID);
  const hasNextLevel = !!nextId;
  const isFinalVictory = st.phase === "over" && st.winner === "PLAYER" && !hasNextLevel;

  // Animaciones
  const playerAnim = useNumenAnim();
  const enemyAnim  = useNumenAnim();

  // Autocarga del nivel si algo no cuadra
  useEffect(() => {
    if (!st.levelId) dispatch(startLevel(DEFAULT_LEVEL_ID));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto al montar
  useEffect(() => {
    playerAnim.triggerEnter();
    enemyAnim.triggerEnter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-pass si el jugador está en guardia en su propio turno
  useEffect(() => {
    if (st.phase !== "play" || st.turn !== PLAYER) return;
    if (!st.playerGuard) return;
    if (st.switchMode) dispatch(cancelSwitch());
    const t = setTimeout(() => dispatch(pass(PLAYER)), 100);
    return () => clearTimeout(t);
  }, [st.phase, st.turn, st.playerGuard, st.switchMode, dispatch]);

  // IA simple del enemigo
  useEffect(() => {
    if (st.phase !== "play" || st.turn !== ENEMY) return;

    const t = setTimeout(() => {
      if (st.enemyGuard) { dispatch(pass(ENEMY)); return; }
      enemyAnim.triggerMelee();
      playerAnim.triggerHit();
      dispatch(attackBasic(ENEMY));
    }, 600);

    return () => clearTimeout(t);
  }, [st.phase, st.turn, st.enemyGuard, st.turnTick, st.last?.after?.autopass, dispatch, enemyAnim, playerAnim]);

  // Acciones UI
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

      {/* Lado enemigo (izquierda) */}
      <EnemySide
        hp={st.enemy?.hp}
        art={enemyArt}
        hit={enemyAnim.hit}
        anim={enemyAnim.anim}
        swap={enemyAnim.swap}
      />

      {/* Lado jugador (derecha) */}
      <PlayerSide
        hp={st.player?.hp}
        art={playerArt}
        hit={playerAnim.hit}
        anim={playerAnim.anim}
        swap={playerAnim.swap}
      >
        <BattleMenu
          onAttack={doAttack}
          onSkills={() => dispatch(pass(PLAYER))} // placeholder
          onGuard={() => dispatch(guardAction(PLAYER))}
          onSwitch={() => canSwitch && dispatch(enterSwitch(PLAYER))}
          canAttack={!!canAttack}
          canSkills={false}
          canGuard={!!canGuard}
          canSwitch={!!canSwitch}
        />
      </PlayerSide>

      {/* Banca (relevo) */}
      <SwitchTray
        enabled={st.switchMode}
        bench={st.bench || []}
        onChoose={async (idx) => {
          // animación de salida/entrada si tu hook las implementa
          if (playerAnim.startSwitchOut) await playerAnim.startSwitchOut();
          dispatch(switchTo({ who: PLAYER, index: idx }));
          if (playerAnim.startSwitchIn) await playerAnim.startSwitchIn();
        }}
        onCancel={() => dispatch(cancelSwitch())}
      />

      {/* Log inferior (con final de juego si aplica) */}
      <CombatLog
        phase={st.phase}
        turn={st.turn}
        usesLeft={null}
        winner={st.winner}
        last={st.last}
        onReset={() => dispatch(startLevel(st.levelId || DEFAULT_LEVEL_ID))}
        hasNextLevel={hasNextLevel}
        onNextLevel={() => dispatch(nextLevel())}
        isFinalVictory={isFinalVictory}
        onFinalRestart={() => dispatch(startLevel(DEFAULT_LEVEL_ID))}
        onGoToMenu={() => { window.location.href = "/select"; }}
      />

      {/* Diálogo de introducción del nivel */}
      {st.phase === "intro" ? (
        <DialogOverlay
          lines={st.dialogQueue}
          index={st.dialogIndex}
          onNext={() => dispatch(nextDialog())}
        />
      ) : null}
    </main>
  );
}
