// src/store/duelSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { tossCoin } from "../lib/coin";
import { instantiateNumen, NUMENS } from "../data/numens";
import { loadRoster } from "../lib/storage";

const PLAYER = "PLAYER";
const ENEMY  = "ENEMY";

/* === Helpers === */
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
    phase: "play",            // 'play' | 'over'
    turn : PLAYER,            // empieza jugador
    player: team.active,      // Numen activo del jugador
    bench : team.bench,       // banca del jugador (array de instancias)
    enemy : instantiateNumen(enemyId),
    last  : null,             // { who, flip, dmg, switch? }
    winner: null,
    switchMode: false,        // UI: menú de relevo activo
  };
}

/* === Slice === */
const slice = createSlice({
  name: "duel",
  initialState: makeInitialState(),
  reducers: {
    reset(state) {
      Object.assign(state, makeInitialState());
    },

    /* ---- Ataque ---- */
    attack(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;

      const me  = (who === PLAYER) ? state.player : state.enemy;
      const opp = (who === PLAYER) ? state.enemy  : state.player;
      const atk = me?.attacks?.[0];
      if (!atk || atk.uses <= 0) return;

      atk.uses -= 1;

      const flip = tossCoin(0.5);
      const dmg  = flip === "cara" ? atk.dmg : 0;
      if (dmg > 0) opp.hp = Math.max(0, opp.hp - dmg);

      state.last = { who, flip, dmg };

      if (opp.hp <= 0) {
        state.phase = "over";
        state.winner = who;
        return;
      }
      state.turn = (who === PLAYER) ? ENEMY : PLAYER;
    },

    /* ---- Pasar ---- */
    pass(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;
      state.last = { who, flip: null, dmg: null };
      state.turn = (who === PLAYER) ? ENEMY : PLAYER;
    },

    /* ---- Relevo: UI ---- */
    enterSwitch(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;
      if (who !== PLAYER) return;                 // sólo jugador por ahora
      if (!state.bench || state.bench.length === 0) return;
      state.switchMode = true;
    },
    cancelSwitch(state) { state.switchMode = false; },

    /* ---- Relevo: Acción ---- */
    switchTo(state, { payload }) {
      const { who, index } = payload || {};
      if (state.phase !== "play" || state.turn !== who) return;
      if (who !== PLAYER) return;
      if (!state.switchMode) return;
      if (!state.bench || state.bench.length === 0) return;
      if (index < 0 || index >= state.bench.length) return;

      const incoming = state.bench[index];
      const outgoing = state.player;

      // quita el elegido de la banca …
      state.bench.splice(index, 1);
      // … mete el activo actual al fondo de la banca
      state.bench.push(outgoing);
      // … actualiza activo
      state.player = incoming;

      state.last = { who, switch: true, from: outgoing.id, to: incoming.id };
      state.switchMode = false;
      state.turn = ENEMY; // relevar cuenta como acción
    },
  },
});

export const { reset, attack, pass, enterSwitch, cancelSwitch, switchTo } = slice.actions;
export default slice.reducer;
export const consts = { PLAYER, ENEMY };
