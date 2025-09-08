// src/data/arenas.js
// Lista de arenas disponibles. Cada una con nombre y src (ruta del fondo).
export const ARENAS = [
    {
      id: "arena1",
      name: "Bosque Claro",
      src: "/assets/Arenas/Arena1.svg", // ← ajusta a tu asset real
    },
    {
      id: "arena2",
      name: "Caverna Helada",
      src: "/assets/Arenas/Arena2.svg",
    },
    {
      id: "arena3",
      name: "Caverna Helada",
      src: "/assets/Arenas/Arena3.svg",
    },
    {
      id: "arena4",
      name: "Caverna Helada",
      src: "/assets/Arenas/Arena4.svg",
    },
    {
      id: "arena5",
      name: "Caverna Helada",
      src: "/assets/Arenas/Arena5.svg",
    },
    {
      id: "arena6",
      name: "Caverna Helada",
      src: "/assets/Arenas/Arena6.svg",
    },
  ];
  
  export function getArena(id) {
    return ARENAS.find((a) => a.id === id);
  }
  