// src/components/Anim/useNumenAnim.js
import { useState, useRef, useCallback, useMemo, useEffect } from "react";

export default function useNumenAnim() {
  const [anim, setAnim] = useState(null);  // 'attack' | null
  const [hit, setHit]   = useState(false); // true cuando recibe golpe
  const [swap, setSwap] = useState(null);  // 'in' | 'out' | null

  // refs para limpiar timeouts
  const timers = useRef(new Set());
  const addTimer = (id) => { timers.current.add(id); };
  const clearAll = () => { for (const id of timers.current) clearTimeout(id); timers.current.clear(); };

  useEffect(() => clearAll, []); // limpiar al desmontar

  const triggerMelee = useCallback(() => {
    setAnim("attack");
    const t = setTimeout(() => setAnim(null), 680);
    addTimer(t);
  }, []);

  const triggerHit = useCallback(() => {
    setHit(true);
    const t = setTimeout(() => setHit(false), 320);
    addTimer(t);
  }, []);

  const startSwitchOut = useCallback(() => {
    return new Promise((resolve) => {
      setSwap("out");
      const t = setTimeout(() => { setSwap(null); resolve(); }, 280);
      addTimer(t);
    });
  }, []);

  const startSwitchIn = useCallback(() => {
    return new Promise((resolve) => {
      setSwap("in");
      const t = setTimeout(() => { setSwap(null); resolve(); }, 380);
      addTimer(t);
    });
  }, []);

  const triggerEnter = useCallback(() => {
    setSwap("in");
    const t = setTimeout(() => setSwap(null), 400);
    addTimer(t);
  }, []);

  // devolver un objeto estable (misma identidad entre renders)
  return useMemo(() => ({
    anim, hit, swap,
    triggerMelee, triggerHit,
    startSwitchOut, startSwitchIn,
    triggerEnter,
  }), [anim, hit, swap, triggerMelee, triggerHit, startSwitchOut, startSwitchIn, triggerEnter]);
}
