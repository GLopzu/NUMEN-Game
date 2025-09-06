// src/store/duelSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { tossCoin } from "../lib/coin";
import { instantiateNumen } from "../data/numens";

const PLAYER = "PLAYER";
const ENEMY = "ENEMY";

const makeInitialState = () => ({
  phase: "play",   // 'play' | 'over'
  turn: PLAYER,    // por ahora empieza el jugador
  player: instantiateNumen("drakar"), // Tú
  enemy:  instantiateNumen("kael"),   // IA
  last: null,      // { who, flip, dmg }
  winner: null,
});

const slice = createSlice({
  name: "duel",
  initialState: makeInitialState(),
  reducers: {
    reset(state) {
      Object.assign(state, makeInitialState());
    },
    attack(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;

      const me  = who === PLAYER ? state.player : state.enemy;
      const opp = who === PLAYER ? state.enemy  : state.player;
      const atk = me?.attacks?.[0]; // Único ataque en este MVP

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
      state.turn = who === PLAYER ? ENEMY : PLAYER;
    },
    pass(state, { payload: who }) {
      if (state.phase !== "play" || state.turn !== who) return;
      state.last = { who, flip: null, dmg: null };
      state.turn = who === PLAYER ? ENEMY : PLAYER;
    },
  },
});

export const { reset, attack, pass } = slice.actions;
export default slice.reducer;
export const consts = { PLAYER, ENEMY };
