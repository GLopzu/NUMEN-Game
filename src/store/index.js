// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import duel from "./duelSlice";

export const store = configureStore({
  reducer: { duel },
});
