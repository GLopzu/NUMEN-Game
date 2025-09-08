import { createSlice } from "@reduxjs/toolkit";
import { tossCoin } from "../lib/coin";
import { instantiateNumen, NUMENS } from "../data/numens";
import { loadRoster } from "../lib/storage";

const PLAYER = "PLAYER";
const ENEMY  = "ENEMY";

/* ---------- helpers ---------- */
function pickEnemyId(excludeId) {
  const pool = NUMENS.map(n => n.id).filter(id => id !== excludeId);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : excludeId;
}

function makeTeamFromRoster() {
  const roster = loadRoster();            // ['drakar','kael',...]
  const first  = (roster && roster[0]) || "drakar";
  const bench  = (roster || []).slice(1,3).map(id => ({ ...instantiateNumen(id) })); // bench sin defeated
  return {
    active: instantiateNumen(first),
    bench,
  };
}

function makeInitialState() {
  const team = makeTeamFromRoster();
  const enemyId = pickEnemyId(team.active?.id || "drakar");
  return {
    phase: "play",
    turn : PLAYER,
    turnTick: 0,

    player: team.active,     // activo jugador
    bench : team.bench,      // banca jugador (cada item puede tener {defeated:true})
    enemy : instantiateNumen(enemyId),

    playerGuard: false,
    enemyGuard : false,
    playerGuardCD: 0,        // CD se aplica SOLO cuando la guardia se CONSUME
    enemyGuardCD : 0,

    last: null,              // { who, action, ... , after:{autopass:WHO} }
    winner: null,

    switchMode: false,
  };
}

/** Decrementa CD cuando ese jugador TERMINA su turno */
function finishTurn(state, who) {
  if (who === PLAYER) {
    if (state.playerGuardCD > 0) state.playerGuardCD -= 1;
  } else {
    if (state.enemyGuardCD > 0) state.enemyGuardCD -= 1;
  }
}

/** Avanza turno y, si el siguiente está en Guardia, se autopasa sin consumirla */
function advanceTurnWithAutoPass(state, next) {
  const curr = state.turn;

  // Termina turno del actual
  finishTurn(state, curr);

  const nextIsGuard = next === PLAYER ? state.playerGuard : state.enemyGuard;

  if (!nextIsGuard) {
    state.turn = next;
    state.turnTick += 1;
    console.log("[TURN] set turn =", next, "tick =", state.turnTick);
    return;
  }

  // Autopass porque el siguiente está en Guardia (la guardia NO se consume)
  const after = { ...(state.last?.after || {}), autopass: next };
  state.last = { ...(state.last || {}), after };
  console.log("[TURN] AUTO-PASS of", next);

  // Ese turno del 'next' también termina a efectos de CD
  finishTurn(state, next);

  const back = curr; // vuelve al que estaba antes
  state.turn = back;
  state.turnTick += 1;
  console.log("[TURN] after autopass → turn =", back, "tick =", state.turnTick);
}

/** KO handler: si hay banca viva, entra forzado; si no, derrota */
function handleKO(state, victim /* 'PLAYER' | 'ENEMY' */, killer /* 'PLAYER' | 'ENEMY' */) {
  if (victim === PLAYER) {
    const bench = state.bench || [];
    const nextIdx = bench.findIndex(n => !n.defeated && (n.hp ?? n.maxHp) > 0);
    if (nextIdx >= 0) {
      // mover activo a banca como derrotado y entrar nuevo
      const outgoing = state.player;
      const incoming = bench.splice(nextIdx, 1)[0];

      outgoing.defeated = true;
      bench.push(outgoing);

      state.player = incoming;
      // al entrar otro, la guardia del jugador debe estar inactiva
      state.playerGuard = false;

      state.last = { who: killer, action: "koSwitch", target: "PLAYER", from: outgoing.id, to: incoming.id };

      const nextTurn = killer === PLAYER ? ENEMY : PLAYER;
      advanceTurnWithAutoPass(state, nextTurn);
      return true; // NO terminó la partida
    } else {
      state.phase = "over";
      state.winner = killer;
      return true; // terminó
    }
  } else {
    // Enemigo sin banca (por ahora): derrota directa
    state.phase = "over";
    state.winner = killer;
    return true;
  }
}

/* ---------- slice ---------- */
const slice = createSlice({
  name: "duel",
  initialState: makeInitialState(),
  reducers: {
    reset(state) {
      Object.assign(state, makeInitialState());
    },

    pass(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;

      const next = who === PLAYER ? ENEMY : PLAYER;
      state.last = { who, action: "pass" };
      advanceTurnWithAutoPass(state, next);
    },

    /**
     * Ataque BÁSICO sin usos:
     * - Moneda: cara → 10 de daño; cruz → falla
     * - No se puede usar si el atacante está en Guardia
     * - Interactúa con Guardia del objetivo
     * - Si deja KO → relevo forzado si hay banca; si no, derrota
     */
    attackBasic(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;

      // No atacas si TÚ estás en guardia
      if ((who === PLAYER ? state.playerGuard : state.enemyGuard)) return;

      const me  = who === PLAYER ? state.player : state.enemy;
      const opp = who === PLAYER ? state.enemy  : state.player;

      const oppGuardActive = who === PLAYER ? state.enemyGuard : state.playerGuard;

      // Golpe básico
      const baseDmg = 10;
      const flip = tossCoin(0.5);          // "cara" | "cruz"
      const hitLanded = flip === "cara";
      let dmg = hitLanded ? baseDmg : 0;

      let guardInfo = null;

      if (oppGuardActive) {
        if (hitLanded) {
          // Guardia se activa → mitigación completa (cara) o 70% (cruz)
          const gFlip = tossCoin(0.5);
          const mitigated = gFlip === "cara" ? 1.0 : 0.7;
          const finalDmg  = Math.max(0, Math.round(dmg * (1 - mitigated)));
          if (finalDmg > 0) {
            opp.hp = Math.max(0, opp.hp - finalDmg);
          }

          // Se consume Guardia y entra CD
          if (who === PLAYER) { state.enemyGuard = false; state.enemyGuardCD = 1; }
          else                { state.playerGuard = false; state.playerGuardCD = 1; }

          guardInfo = {
            wasHit: true,
            flip: gFlip,
            mitigated,
            finalDmg,
            broke: true,
            consumed: true,
          };

          dmg = 0; // daño “base” ya no se aplica tal cual (se reporta en guardInfo)
        } else {
          // atacante falló → guardia permanece
          guardInfo = { wasHit: false, flip: null, consumed: false };
        }
      } else if (hitLanded) {
        opp.hp = Math.max(0, opp.hp - dmg);
      }

      state.last = {
        who,
        action: "basic",
        hitLanded,
        dmg,
        guarded: oppGuardActive,
        guard: guardInfo,
      };

      // ¿K.O.?
      if (opp.hp <= 0) {
        const ended = handleKO(state, who === PLAYER ? ENEMY : PLAYER, who);
        if (ended) return;
      }

      // Cambia turno normal
      const next = who === PLAYER ? ENEMY : PLAYER;
      advanceTurnWithAutoPass(state, next);
    },

    /* UI: modo relevo */
    enterSwitch(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;
      if (who === PLAYER && (!state.bench || state.bench.length === 0)) return;
      if (who === PLAYER && state.playerGuard) return;  // no se puede relevar en guardia
      state.switchMode = true;
      state.last = { who, action: "enterSwitch" };
    },
    cancelSwitch(state) {
      state.switchMode = false;
      state.last = { ...(state.last || {}), action: "cancelSwitch" };
    },
    switchTo(state, { payload: { who, index } }) {
      if (state.phase !== "play" || state.turn !== who) return;
      if (!state.switchMode) return;

      if (who === PLAYER) {
        if (!state.bench || index < 0 || index >= state.bench.length) return;
        // No permitir KO
        if (state.bench[index]?.defeated) return;

        const incoming = state.bench[index];
        const outgoing = state.player;

        state.bench.splice(index, 1);
        state.bench.push(outgoing);
        state.player = incoming;

        state.playerGuard = false; // al entrar otro, sin guardia activa

        state.last = { who, action: "switch", switch: true, from: outgoing.id, to: incoming.id };
        state.switchMode = false;
        console.log("[SWITCH] from", outgoing.id, "to", incoming.id);

        advanceTurnWithAutoPass(state, ENEMY);
      }
    },

    /* Activar Guardia (sin CD aquí; el CD se aplica cuando SE USA) */
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
      console.log("[GUARD]", who, "→ active (CD se aplicará SOLO si se usa)");
      const next = who === PLAYER ? ENEMY : PLAYER;
      advanceTurnWithAutoPass(state, next);
    },
  },
});

export const {
  reset, pass,
  enterSwitch, cancelSwitch, switchTo,
  guard,
  attackBasic,
} = slice.actions;

export default slice.reducer;
export const consts = { PLAYER, ENEMY };
