// src/data/levels.js
// Cada nivel define:
//  - id, name
//  - arena: id de arena (usa getArena en la UI)
//  - enemyTeam: ids de Numens (1 activo + resto banca)
//  - dialogue.intro: array de líneas { who: 'PLAYER'|'ENEMY'|'NARRATOR', text: string }

export const LEVELS = [
  {
    id: "level1",
    name: "Bosque Noche",
    arena: "arena1",
    enemyTeam: ["merida"],
    dialogue: {
      intro: [
        { who: "PLAYER", text: "¿Dónde esta tu señor?" },
        { who: "ENEMY",  text: "No te lo dire" },
      ],
    },
  },
  {
    id: "level2",
    name: "Bosque Día",
    arena: "arena2",
    enemyTeam: ["kael", "merida"],
    dialogue: {
      intro: [
        { who: "PLAYER", text: "Dejame seguir mi camino" },
        { who: "ENEMY",  text: "No eres bienvenido" },
      ],
    },
  },
  {
    id: "level3",
    name: "Pueblo",
    arena: "arena3",
    enemyTeam: ["nox", "kael", "merida"],
    dialogue: {
      intro: [
        { who: "PLAYER", text: "¿Por qué no se rinden?" },
        { who: "ENEMY",  text: "No llegaras al capitolio del Señor Mort" },
      ],
    },
  },
  {
    id: "level4",
    name: "Bosque Magico",
    arena: "arena4",
    enemyTeam: ["verdantius", "kael", "nox"],
    dialogue: {
      intro: [
        { who: "PLAYER", text: "No molestes en mi camino, tortuga" },
        { who: "ENEMY",  text: "..." },
      ],
    },
  },
  {
    id: "level5",
    name: "Castillo",
    arena: "arena5",
    enemyTeam: ["aeilor", "nox", "verdantius"],
    dialogue: {
      intro: [
        { who: "PLAYER", text: "No pueden determe" },
        { who: "ENEMY",  text: "Ya lo veremos" },
      ],
    },
  },
  {
    id: "level6",
    name: "Capitolio",
    arena: "arena6",
    enemyTeam: ["mortimer", "aeilor", "merida"],
    dialogue: {
      intro: [
        { who: "PLAYER", text: "Eres mio, Mortimer" },
        { who: "ENEMY",  text: "¿Por qué quieres lo que ya destruiste? somos lo que queda del reino..." },
      ],
    },
  },
];

export const DEFAULT_LEVEL_ID = LEVELS[0].id;

export function getLevel(id) {
  return LEVELS.find((lv) => lv.id === id) || LEVELS[0];
}

/** Devuelve el id del siguiente nivel o null si ya estás en el último */
export function getNextLevelId(currentId) {
  const idx = LEVELS.findIndex((lv) => lv.id === currentId);
  if (idx === -1) return null;
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1].id : null;
}

/** (Opcional) saber si es el último nivel */
export function isLastLevel(currentId) {
  const idx = LEVELS.findIndex((lv) => lv.id === currentId);
  return idx !== -1 && idx === LEVELS.length - 1;
}
