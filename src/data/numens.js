// src/data/numens.js
// Cada Numen ahora tiene:
//  - idle:   imagen para su estado en batalla (cuando eres tú)
//  - select: imagen para la pantalla de selección (o avatar)
//  - Enemy:  imagen para cuando ese Numen aparece como enemigo (orientación/arte alterno)

export const NUMENS = [
  {
    id: "drakar",
    name: "Drakar",
    maxHp: 140,
    description: "Guerrero testarudo.",
    passive: "—",
    idle:   "/assets/Numens/Drakar.svg",
    select: "/assets/Numens/Drakar_select.svg",
    Enemy:  "/assets/numens/drakar/enemy.png",
    attacks: [
      { id: "atk10", name: "Ataque", dmg: 10, usesMax: 10, kind: "coin_on_heads_10" },
    ],
  },
  {
    id: "kael",
    name: "Kael",
    maxHp: 140,
    description: "Aventurero goliat que no se rinde.",
    passive: "—",
    idle:   "/assets/numens/kael/idle.png",
    select: "/assets/numens/kael/select.png",
    Enemy:  "/assets/Numens/Kael_enemy.svg",
    attacks: [
      { id: "atk10", name: "Ataque", dmg: 10, usesMax: 10, kind: "coin_on_heads_10" },
    ],
  },
];

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
    attacks: base.attacks.map((a) => ({ ...a, uses: a.usesMax })),
  };
}
