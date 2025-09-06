// src/components/HP/NumenHP.jsx
import "./NumenHp.css"
export default function NumenHP({ hp = 0 }) {
    return (
      <div className="hp-badge">
        {hp ?? 0}
        <span className="hp-badge__unit">·pdv</span>
      </div>
    );
  }
  