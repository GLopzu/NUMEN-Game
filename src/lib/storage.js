// src/lib/storage.js
export const ROSTER_KEY = "numen.roster.v1";

// Usamos LOCAL STORAGE (persistente entre sesiones)
const store =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} };

/** Guarda array de ids en orden (máximo 3) */
export function saveRoster(ids) {
  try {
    const clean = (ids || []).filter(Boolean).slice(0, 3);
    store.setItem(ROSTER_KEY, JSON.stringify(clean));
  } catch {}
}

export function loadRoster() {
  try {
    const raw = store.getItem(ROSTER_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(Boolean).slice(0, 3) : null;
  } catch {
    return null;
  }
}
