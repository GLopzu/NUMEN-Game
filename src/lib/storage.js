// src/lib/storage.js
export const ROSTER_KEY = "numen.roster.v1";

/** Guarda array de ids en orden (máximo 3) */
export function saveRoster(ids) {
  try {
    const clean = (ids || []).filter(Boolean).slice(0, 3);
    localStorage.setItem(ROSTER_KEY, JSON.stringify(clean));
  } catch {}
}

export function loadRoster() {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(Boolean).slice(0, 3) : null;
  } catch {
    return null;
  }
}
