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
      src: "/arena/ice_cave.jpg",
    },
    // agrega más arenas aquí...
  ];
  
  export function getArena(id) {
    return ARENAS.find((a) => a.id === id);
  }
  