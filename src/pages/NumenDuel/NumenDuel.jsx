// src/pages/NumenDuel.jsx
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect, useState } from "react";
import {
  startLevel, nextLevel, nextDialog,
  pass, consts,
  enterSwitch, cancelSwitch, switchTo,
  guard as guardAction, attackBasic,
} from "../../store/duelSlice";
import { getArena } from "../../data/arenas";
import { getLevel, getNextLevelId, DEFAULT_LEVEL_ID } from "../../data/levels";
import { getNumen } from "../../data/numens";

import {
  BattleMenu,
  PlayerSide,
  EnemySide,
  CombatLog,
  ExitButton,
  SwitchTray,
  DialogOverlay,
  ResultPopup,
  KOOverlay,
  useNumenAnim,
} from "../../components";

import "./NumenDuel.css";

const { PLAYER, ENEMY } = consts;

export default function NumenDuel() {
  const dispatch = useDispatch();
  const st = useSelector((s) => s.duel);

  const level = useMemo(() => getLevel(st.levelId || DEFAULT_LEVEL_ID), [st.levelId]);
  const arena  = useMemo(() => getArena(st.arenaId || level.arena), [st.arenaId, level.arena]);
  const arenaSrc = arena?.src;

  const playerArt =
    (st.phase === "play" && st.turn === PLAYER
      ? st.player?.select || st.player?.idle
      : st.player?.idle || st.player?.select) || null;
  const enemyArt = st.enemy?.Enemy || st.enemy?.idle || null;

  const playerIsGuard = !!st.playerGuard;
  const playerGuardCD = st.playerGuardCD || 0;

  const canAttack = st.phase === "play" && st.turn === PLAYER && !playerIsGuard;
  const hasBench  = (st.bench?.length || 0) > 0;
  const canSwitch = st.phase === "play" && st.turn === PLAYER && hasBench && !playerIsGuard;
  const canGuard  = st.phase === "play" && st.turn === PLAYER && !playerIsGuard && playerGuardCD === 0;

  const nextId = getNextLevelId(st.levelId || DEFAULT_LEVEL_ID);
  const hasNextLevel = !!nextId;
  const isFinalVictory = st.phase === "over" && st.winner === "PLAYER" && !hasNextLevel;

  const playerAnim = useNumenAnim();
  const enemyAnim  = useNumenAnim();

  // Overlay de KO (imagen y lado)
  const [koOverlay, setKoOverlay] = useState(null); // { side: 'player'|'enemy', src }

  // animación de entrada al montar
  useEffect(() => {
    playerAnim.triggerEnter();
    enemyAnim.triggerEnter();
    // deps vacías para que solo ocurra una vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autopass si jugador está en guardia en su turno
  useEffect(() => {
    if (st.phase !== "play" || st.turn !== PLAYER) return;
    if (!st.playerGuard) return;
    if (st.switchMode) dispatch(cancelSwitch());
    const t = setTimeout(() => dispatch(pass(PLAYER)), 100);
    return () => clearTimeout(t);
  }, [st.phase, st.turn, st.playerGuard, st.switchMode, dispatch]);

  // IA muy simple (NO dependas de playerAnim/enemyAnim para evitar bucles)
  useEffect(() => {
    if (st.phase !== "play" || st.turn !== ENEMY) return;

    const t = setTimeout(() => {
      if (st.enemyGuard) { dispatch(pass(ENEMY)); return; }
      enemyAnim.triggerMelee();
      playerAnim.triggerHit();
      dispatch(attackBasic(ENEMY));
    }, 600);

    return () => clearTimeout(t);
    // dependencias SOLO de estado redux/dispatch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st.phase, st.turn, st.enemyGuard, st.turnTick, st.last?.after?.autopass, dispatch]);

  // KO -> overlay de “muerte” + animación de “in” del nuevo Numen
  useEffect(() => {
    if (st.last?.action !== "koSwitch") return;

    const { target, from } = st.last;
    const base = getNumen(from);
    const src =
      target === "ENEMY"
        ? (base?.Enemy || base?.idle)
        : (base?.select || base?.idle);

    setKoOverlay({ side: target === "ENEMY" ? "enemy" : "player", src });
    const clear = setTimeout(() => setKoOverlay(null), 520);

    // animación de entrada del reemplazo (no metas handlers en deps)
    if (target === "ENEMY") enemyAnim.startSwitchIn();
    else                    playerAnim.startSwitchIn();

    return () => clearTimeout(clear);
    // depende SOLO de la acción
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st.last?.action]);

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

      {/* KO Overlay (muerte global) */}
      {koOverlay ? <KOOverlay side={koOverlay.side} src={koOverlay.src} /> : null}

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
          onSkills={() => dispatch(pass(PLAYER))} // placeholder
          onGuard={() => dispatch(guardAction(PLAYER))}
          onSwitch={() => canSwitch && dispatch(enterSwitch(PLAYER))}
          canAttack={!!canAttack}
          canSkills={false}
          canGuard={!!canGuard}
          canSwitch={!!canSwitch}
        />
      </PlayerSide>

      {/* Banca */}
      <SwitchTray
        enabled={st.switchMode}
        bench={st.bench || []}
        onChoose={async (idx) => {
          if (playerAnim.startSwitchOut) await playerAnim.startSwitchOut();
          dispatch(switchTo({ who: PLAYER, index: idx }));
          if (playerAnim.startSwitchIn) await playerAnim.startSwitchIn();
        }}
        onCancel={() => dispatch(cancelSwitch())}
      />

      {/* Log (sin mensajes de fin de partida) */}
      <CombatLog
        phase={st.phase}
        turn={st.turn}
        last={st.last}
        usesLeft={null}
      />

      {/* Intro de nivel */}
      {st.phase === "intro" ? (
        <DialogOverlay
          lines={st.dialogQueue}
          index={st.dialogIndex}
          onNext={() => dispatch(nextDialog())}
        />
      ) : null}

      {/* Popup de resultado */}
      <ResultPopup
        visible={st.phase === "over"}
        type={
          st.winner === "PLAYER"
            ? (isFinalVictory ? "final" : "win")
            : "defeat"
        }
        levelName={level?.name || ""}
        onNextLevel={() => dispatch(nextLevel())}
        onRestartAll={() => dispatch(startLevel(DEFAULT_LEVEL_ID))}
        onExit={() => { window.location.href = "/select"; }}
      />
    </main>
  );
}
