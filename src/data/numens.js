// src/data/numens.js
// Estructura de assets por Numen (carpeta por nombre):
// /assets/Numens/<Nombre>/<Nombre>.svg
// /assets/Numens/<Nombre>/<Nombre>_select.svg
// /assets/Numens/<Nombre>/<Nombre>_enemy.svg
// /assets/Numens/<Nombre>/<Nombre>_Frame.svg
// /assets/Numens/<Nombre>/<Nombre>_Relevo.svg

const makeAssets = (ProperName) => {
  const folder = `/assets/Numens/${ProperName}`;
  return {
    idle:   `${folder}/${ProperName}.svg`,
    select: `${folder}/${ProperName}_select.svg`,
    Enemy:  `${folder}/${ProperName}_enemy.svg`,
    frame:  `${folder}/${ProperName}_Frame.svg`,
    relevo: `${folder}/${ProperName}_Relevo.svg`,
  };
};

export const NUMENS = [
  {
    id: "drakar",
    name: "Drakar",
    maxHp: 140,
    description: "Guerrero testarudo.",
    passive: "—",
    ...makeAssets("Drakar"),
    attacks: [{ id: "atk10", name: "Ataque", dmg: 10, usesMax: 10, kind: "coin_on_heads_10" }],
  },
  {
    id: "merida",
    name: "Merida",
    maxHp: 120,
    description: "Arquera precisa.",
    passive: "—",
    ...makeAssets("Merida"),
    attacks: [{ id: "atk10", name: "Ataque", dmg: 10, usesMax: 10, kind: "coin_on_heads_10" }],
  },
  {
    id: "kael",
    name: "Kael",
    maxHp: 140,
    description: "Aventurero goliat.",
    passive: "—",
    ...makeAssets("Kael"),
    attacks: [{ id: "atk10", name: "Ataque", dmg: 10, usesMax: 10, kind: "coin_on_heads_10" }],
  },
  {
    id: "nox",
    name: "Nox",
    maxHp: 110,
    description: "Sombras y venenos.",
    passive: "—",
    ...makeAssets("Nox"),
    attacks: [{ id: "atk10", name: "Ataque", dmg: 10, usesMax: 10, kind: "coin_on_heads_10" }],
  },
  {
    id: "verdantius",
    name: "Verdantius",
    maxHp: 150,
    description: "Guardia del bosque.",
    passive: "—",
    ...makeAssets("Verdantius"),
    attacks: [{ id: "atk10", name: "Ataque", dmg: 10, usesMax: 10, kind: "coin_on_heads_10" }],
  },
  {
    id: "aeilor",
    name: "Aeilor",
    maxHp: 125,
    description: "Maestro del viento.",
    passive: "—",
    ...makeAssets("Aeilor"),
    attacks: [{ id: "atk10", name: "Ataque", dmg: 10, usesMax: 10, kind: "coin_on_heads_10" }],
  },
  {
    id: "mortimer",
    name: "Mortimer",
    maxHp: 130,
    description: "Nigromante sarcástico.",
    passive: "—",
    ...makeAssets("Mortimer"),
    attacks: [{ id: "atk10", name: "Ataque", dmg: 10, usesMax: 10, kind: "coin_on_heads_10" }],
  },
];

/** Mantengo este export para tu SelectNumen.jsx */
export function listNumens() {
  // Devuelve los objetos tal cual (id, name, frame, relevo, select, idle, etc.)
  return NUMENS;
}

export function getNumen(id) {
  return NUMENS.find((n) => n.id === id);
}

export function instantiateNumen(id) {
  const base = getNumen(id);
  if (!base) return null;
  return {
    id: base.id,
    name: base.name,
    hp: base.maxHp,
    maxHp: base.maxHp,
    description: base.description,
    passive: base.passive,
    idle: base.idle,
    select: base.select,
    Enemy: base.Enemy,
    frame: base.frame,
    relevo: base.relevo,
    attacks: base.attacks.map((a) => ({ ...a, uses: a.usesMax })),
  };
}

// Opcional: por si en algún sitio importas por defecto
export default NUMENS;
