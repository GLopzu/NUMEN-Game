// src/store/duelSlice.js
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
  const roster = loadRoster();
  const ids = (roster && roster.length) ? roster : ["drakar"];
  const active = instantiateNumen(ids[0]);
  const bench  = ids.slice(1).map(instantiateNumen).filter(Boolean);
  return { active, bench };
}

function makeInitialState() {
  const team = makeTeamFromRoster();
  const enemyId = pickEnemyId(team.active?.id || "drakar");
  return {
    phase: "play",
    turn : PLAYER,
    turnTick: 0,         // sube en cada cambio de turno (incl. autopass)
    player: team.active,
    bench : team.bench,
    enemy : instantiateNumen(enemyId),

    playerGuard: false,
    enemyGuard : false,
    playerGuardCD: 0,    // CD se aplica SOLO cuando la guardia se CONSUME
    enemyGuardCD : 0,

    last: null,          // { who, action, ... , after:{autopass:WHO} }
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

/**
 * Avanza el turno hacia `next`.
 * - Primero “termina” el turno del jugador actual (curr) ⇒ CD–.
 * - Si `next` está en guardia, hace AUTOPASS ⇒ también “termina” ese turno ⇒ CD–,
 *   y el turno vuelve al otro.
 */
function advanceTurnWithAutoPass(state, next) {
  const curr = next === PLAYER ? ENEMY : PLAYER;

  // Termina turno del actual (quien estaba jugando)
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

  // Ese turno del 'next' también se considera “terminado” a efectos de CD
  finishTurn(state, next);

  const back = curr; // vuelve al que estaba antes
  state.turn = back;
  state.turnTick += 1;
  console.log("[TURN] after autopass → turn =", back, "tick =", state.turnTick);
}

/* ---------- slice ---------- */
const slice = createSlice({
  name: "duel",
  initialState: makeInitialState(),
  reducers: {
    reset(state) {
      console.log("[RESET]");
      Object.assign(state, makeInitialState());
    },

    attack(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;

      // No puedes atacar si tú estás en guardia
      if ((who === PLAYER ? state.playerGuard : state.enemyGuard)) return;

      const me  = who === PLAYER ? state.player : state.enemy;
      const opp = who === PLAYER ? state.enemy  : state.player;
      const oppGuardActive = who === PLAYER ? state.enemyGuard : state.playerGuard;

      const atk = me?.attacks?.[0];

      // ⛑️ Sin ataque o sin usos ⇒ PASS automático
      if (!atk || atk.uses <= 0) {
        state.last = { who, action: "pass", reason: "no_uses" };
        console.log("[PASS]", who, "(no uses)");
        const next = who === PLAYER ? ENEMY : PLAYER;
        advanceTurnWithAutoPass(state, next);
        return;
      }

      atk.uses -= 1;

      const coin = tossCoin(0.5); // cara = golpea
      const hitLanded = coin === "cara";
      let dmg = hitLanded ? atk.dmg : 0;

      let guardInfo = null;

      if (oppGuardActive) {
        if (hitLanded) {
          // ✅ Guardia se ACTIVA y MITIGA COMPLETO → daño final 0
          const gFlip = tossCoin(0.5);     // solo para log
          const mitigated = dmg;
          const finalDmg  = 0;

          // Consumir Guardia y poner CD=1 (del objetivo)
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

          dmg = 0;
        } else {
          // ❌ Falló el atacante → Guardia NO se activa, permanece
          guardInfo = { wasHit: false, flip: null, consumed: false };
          // dmg ya es 0
        }
      } else if (hitLanded) {
        // Sin guardia
        opp.hp = Math.max(0, opp.hp - dmg);
      }

      state.last = {
        who,
        action: "attack",
        hitLanded,
        dmg,
        guarded: oppGuardActive,
        guard: guardInfo,
      };
      console.log(
        "[ATTACK]",
        who,
        "hit:",
        hitLanded,
        "dmg:",
        dmg,
        "guarded:",
        oppGuardActive,
        "guardConsumed:",
        guardInfo?.consumed
      );

      if (opp.hp <= 0) {
        state.phase = "over";
        state.winner = who;
        console.log("[OVER] winner =", who);
        return;
      }

      const next = who === PLAYER ? ENEMY : PLAYER;
      advanceTurnWithAutoPass(state, next);
    },

    pass(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;
      state.last = { who, action: "pass" };
      console.log("[PASS]", who);
      const next = who === PLAYER ? ENEMY : PLAYER;
      advanceTurnWithAutoPass(state, next);
    },

    /* UI de relevo */
    enterSwitch(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;
      if (who !== PLAYER) return;
      if (!state.bench || state.bench.length === 0) return;
      if (state.playerGuard) return;          // no relevo en guardia
      state.switchMode = true;
      console.log("[SWITCH] enter UI");
    },
    cancelSwitch(state) {
      state.switchMode = false;
      console.log("[SWITCH] cancel UI");
    },

    switchTo(state, { payload }) {
      const { who, index } = payload || {};
      if (state.phase !== "play" || state.turn !== who) return;
      if (who !== PLAYER) return;
      if (!state.switchMode) return;
      if (!state.bench || state.bench.length === 0) return;
      if (index < 0 || index >= state.bench.length) return;
      if (state.playerGuard) return;

      const incoming = state.bench[index];
      const outgoing = state.player;

      state.bench.splice(index, 1);
      state.bench.push(outgoing);
      state.player = incoming;

      state.last = { who, action: "switch", switch: true, from: outgoing.id, to: incoming.id };
      state.switchMode = false;
      console.log("[SWITCH] from", outgoing.id, "to", incoming.id);

      advanceTurnWithAutoPass(state, ENEMY);
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
  reset, attack, pass,
  enterSwitch, cancelSwitch, switchTo,
  guard,
} = slice.actions;

export default slice.reducer;
export const consts = { PLAYER, ENEMY };
