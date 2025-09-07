// src/pages/SelectNumen.jsx
import { useMemo, useState } from "react";
import { listNumens, getNumen } from "../../data/numens"
import { saveRoster } from "../../lib/storage"
import NumenCard from "../../components/Select/NumenCard"
import TeamSlots from "../../components/Select/TeamSlots"
import "./SelectNumen.css";

export default function SelectNumen() {
  const all = useMemo(() => listNumens(), []);
  const [selected, setSelected] = useState([]); // array de ids (max 3)
  const maxTeam = 3;

  const add = (id) => {
    if (selected.includes(id)) return;
    if (selected.length >= maxTeam) return;
    setSelected([...selected, id]);
  };
  const removeAt = (idx) => {
    setSelected(selected.filter((_, i) => i !== idx));
  };

  const ready = selected.length >= 1;
  const onReady = () => {
    saveRoster(selected);
    // navega al duelo (si usas router, puedes usar useNavigate en su lugar)
    window.location.assign("/duel");
  };

  return (
    <main className="select">
      <h1 className="select__title">Selección de Numen</h1>

      <div className="select__layout">
        {/* Grid izquierda */}
        <section className="select__grid" aria-label="Catálogo de Numens">
          {all.map((n) => (
            <NumenCard
              key={n.id}
              numen={n}
              selected={selected.includes(n.id)}
              disabled={!selected.includes(n.id) && selected.length >= maxTeam}
              onClick={() => add(n.id)}
            />
          ))}
        </section>

        {/* Sidebar derecha */}
        <aside className="select__team" aria-label="Equipo">
          <TeamSlots
            selected={selected.map(id => getNumen(id))}
            onRemove={removeAt}
            max={maxTeam}
          />
          <button className="select__ready" onClick={onReady} disabled={!ready}>
            LISTO
          </button>
        </aside>
      </div>
    </main>
  );
}
