// src/lib/coin.js
export function tossCoin(p = 0.5) {
    return Math.random() < p ? "cara" : "cruz";
  }
  export const coinEmoji = (s) => (s === "cara" ? "🟡" : "⚫");
  