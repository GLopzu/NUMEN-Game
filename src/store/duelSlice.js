import { createSlice } from "@reduxjs/toolkit";
import { tossCoin } from "../lib/coin";
import { instantiateNumen } from "../data/numens";
import { loadRoster } from "../lib/storage";
import { getLevel, getNextLevelId, DEFAULT_LEVEL_ID } from "../data/levels";

const PLAYER = "PLAYER";
const ENEMY  = "ENEMY";

/* ---------- helpers ---------- */
function makePlayerTeamFromRoster() {
  const roster = loadRoster(); // ['drakar','kael',...]
  const ids = Array.isArray(roster) && roster.length ? roster.slice(0, 3) : ["drakar"];
  const active = instantiateNumen(ids[0]);
  const bench  = ids.slice(1).map(instantiateNumen).filter(Boolean);
  return { active, bench };
}
function makeEnemyTeamFromLevel(level) {
  const ids = (level?.enemyTeam || []).slice(0, 3);
  const active = ids[0] ? instantiateNumen(ids[0]) : instantiateNumen("kael");
  const bench  = ids.slice(1).map(instantiateNumen).filter(Boolean);
  return { active, bench };
}
function makeInitialState(levelId = DEFAULT_LEVEL_ID) {
  const level = getLevel(levelId);
  const player = makePlayerTeamFromRoster();
  const enemy  = makeEnemyTeamFromLevel(level);

  return {
    // meta nivel
    levelId,
    arenaId: level.arena,

    // fases: 'intro' (diálogo) → 'play' → 'over'
    phase: "intro",
    dialogQueue: level?.dialogue?.intro || [],
    dialogIndex: 0,

    // turno
    turn : PLAYER, // se decide tras el intro por moneda
    turnTick: 0,

    // equipos
    player: player.active,
    bench : player.bench,       // banca jugador
    enemy : enemy.active,
    enemyBench: enemy.bench,    // banca enemigo

    // estados
    playerGuard: false,
    enemyGuard : false,
    playerGuardCD: 0,
    enemyGuardCD : 0,

    last: null,
    winner: null,

    // UI
    switchMode: false,
  };
}
function finishTurn(state, who) {
  if (who === PLAYER) {
    if (state.playerGuardCD > 0) state.playerGuardCD -= 1;
  } else {
    if (state.enemyGuardCD > 0) state.enemyGuardCD -= 1;
  }
}
function advanceTurnWithAutoPass(state, next) {
  const curr = state.turn;
  finishTurn(state, curr);

  const nextIsGuard = next === PLAYER ? state.playerGuard : state.enemyGuard;
  if (!nextIsGuard) {
    state.turn = next;
    state.turnTick += 1;
    return;
  }
  const after = { ...(state.last?.after || {}), autopass: next };
  state.last = { ...(state.last || {}), after };

  finishTurn(state, next);
  state.turn = curr;
  state.turnTick += 1;
}
function handleKO(state, victim /* 'PLAYER'|'ENEMY' */, killer /* 'PLAYER'|'ENEMY' */) {
  if (victim === PLAYER) {
    const bench = state.bench || [];
    const nextIdx = bench.findIndex(n => !n.defeated && (n.hp ?? n.maxHp) > 0);
    if (nextIdx >= 0) {
      const outgoing = state.player;
      const incoming = bench.splice(nextIdx, 1)[0];

      outgoing.defeated = true;
      bench.push(outgoing);

      state.player = incoming;
      state.playerGuard = false;

      state.last = { who: killer, action: "koSwitch", target: "PLAYER", from: outgoing.id, to: incoming.id };
      const next = killer === PLAYER ? ENEMY : PLAYER;
      advanceTurnWithAutoPass(state, next);
      return true;
    }
    state.phase = "over";
    state.winner = killer;
    return true;
  } else {
    const bench = state.enemyBench || [];
    const nextIdx = bench.findIndex(n => !n.defeated && (n.hp ?? n.maxHp) > 0);
    if (nextIdx >= 0) {
      const outgoing = state.enemy;
      const incoming = bench.splice(nextIdx, 1)[0];

      outgoing.defeated = true;
      bench.push(outgoing);

      state.enemy = incoming;
      state.enemyGuard = false;

      state.last = { who: killer, action: "koSwitch", target: "ENEMY", from: outgoing.id, to: incoming.id };
      const next = killer === PLAYER ? ENEMY : PLAYER;
      advanceTurnWithAutoPass(state, next);
      return true;
    }
    state.phase = "over";
    state.winner = killer;
    return true;
  }
}
function startByCoin(state) {
  const coin = tossCoin(0.5); // 'cara' | 'cruz'
  const starts = coin === "cara" ? PLAYER : ENEMY;
  state.turn = starts;
  state.phase = "play";
  state.last = { action: "coinflip", coin, starts };
  state.turnTick = 0;
}

/* ---------- slice ---------- */
const slice = createSlice({
  name: "duel",
  initialState: makeInitialState(),
  reducers: {
    /** Inicia/recarga un nivel concreto */
    startLevel(state, { payload: levelId }) {
      return makeInitialState(levelId || DEFAULT_LEVEL_ID);
    },
    /** Ir al siguiente nivel (si no hay, no hace nada; el UI se encarga de ocultar el botón) */
    nextLevel(state) {
      const curr = state.levelId || DEFAULT_LEVEL_ID;
      const nextId = getNextLevelId(curr);
      if (!nextId) return state; // último nivel: no avanzamos
      return makeInitialState(nextId);      // ⚠️ al reconstruir desde roster, tu equipo vuelve full vida
    },

    /** Avanza el diálogo de intro; al terminar, decide el turno por moneda */
    nextDialog(state) {
      if (state.phase !== "intro") return;
      const total = state.dialogQueue.length;
      const nextIdx = state.dialogIndex + 1;
      if (nextIdx < total) {
        state.dialogIndex = nextIdx;
        state.last = { action: "dialog", index: nextIdx };
        return;
      }
      startByCoin(state);
    },

    reset(state) { return makeInitialState(state.levelId || DEFAULT_LEVEL_ID); },

    pass(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;
      const next = who === PLAYER ? ENEMY : PLAYER;
      state.last = { who, action: "pass" };
      advanceTurnWithAutoPass(state, next);
    },

    /** Ataque básico sin usos (cara=10, cruz=falla); interactúa con Guardia */
    attackBasic(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;
      if ((who === PLAYER ? state.playerGuard : state.enemyGuard)) return;

      const opp = who === PLAYER ? state.enemy  : state.player;
      const oppGuard = who === PLAYER ? state.enemyGuard : state.playerGuard;

      const baseDmg = 20;
      const flip = tossCoin(0.5);
      const hitLanded = flip === "cara";
      let dmg = hitLanded ? baseDmg : 0;

      let guardInfo = null;

      if (oppGuard) {
        if (hitLanded) {
          const gFlip = tossCoin(0.5); // cara 100% | cruz 70%
          const mitigated = gFlip === "cara" ? 1.0 : 0.7;
          const finalDmg  = Math.max(0, Math.round(dmg * (1 - mitigated)));
          if (finalDmg > 0) opp.hp = Math.max(0, opp.hp - finalDmg);

          if (who === PLAYER) { state.enemyGuard = false; state.enemyGuardCD = 1; }
          else                { state.playerGuard = false; state.playerGuardCD = 1; }

          guardInfo = { wasHit: true, flip: gFlip, mitigated, finalDmg, consumed: true };
          dmg = 0;
        } else {
          guardInfo = { wasHit: false, flip: null, consumed: false };
        }
      } else if (hitLanded) {
        opp.hp = Math.max(0, opp.hp - dmg);
      }

      state.last = { who, action: "basic", hitLanded, dmg, guarded: !!oppGuard, guard: guardInfo };

      // KO / victoria / relevo forzado
      if (opp.hp <= 0) {
        const ended = handleKO(state, who === PLAYER ? ENEMY : PLAYER, who);
        if (ended) return;
      }

      const next = who === PLAYER ? ENEMY : PLAYER;
      advanceTurnWithAutoPass(state, next);
    },

    /* UI Relevo */
    enterSwitch(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;
      if (who !== PLAYER) return;
      if (!state.bench || state.bench.length === 0) return;
      if (state.playerGuard) return;
      state.switchMode = true;
      state.last = { who, action: "enterSwitch" };
    },
    cancelSwitch(state) {
      state.switchMode = false;
      state.last = { ...(state.last || {}), action: "cancelSwitch" };
    },
    switchTo(state, { payload: { who, index } }) {
      if (state.phase !== "play" || state.turn !== who) return;
      if (who !== PLAYER) return;
      if (!state.switchMode) return;
      if (!state.bench || index < 0 || index >= state.bench.length) return;
      if (state.bench[index]?.defeated) return;
      if (state.playerGuard) return;

      const incoming = state.bench[index];
      const outgoing = state.player;

      state.bench.splice(index, 1);
      state.bench.push(outgoing);
      state.player = incoming;
      state.playerGuard = false;

      state.last = { who, action: "switch", from: outgoing.id, to: incoming.id };
      state.switchMode = false;

      advanceTurnWithAutoPass(state, ENEMY);
    },

    /* Guardia (CD se aplica cuando SE USA) */
    guard(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;

      if (who === PLAYER) {
        if (state.playerGuard || state.playerGuardCD > 0) return;
        state.playerGuard = true;
      } else {
        if (state.enemyGuard || state.enemyGuardCD > 0) return;
        state.enemyGuard = true;
      }

      state.last = { who, action: "guard" };
      const next = who === PLAYER ? ENEMY : PLAYER;
      advanceTurnWithAutoPass(state, next);
    },
  },
});

export const {
  startLevel, nextLevel, nextDialog,
  reset, pass,
  enterSwitch, cancelSwitch, switchTo,
  guard, attackBasic,
} = slice.actions;

export default slice.reducer;
export const consts = { PLAYER, ENEMY };
