// src/components/Anim/useNumenAnim.js
import { useState, useRef, useCallback } from "react";

const DUR = {
  melee: 650,
  hit: 320,
  switchOut: 350,
  switchIn: 450,
  enter: 450,
};

export default function useNumenAnim() {
  const [anim, setAnim] = useState(null);   // 'melee' | 'attack' | null
  const [hit, setHit] = useState(false);
  const [swap, setSwap] = useState(null);   // 'out' | 'in' | 'enter' | null
  const timers = useRef([]);

  const withTimer = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  const triggerMelee = () => {
    setAnim("melee");
    withTimer(() => setAnim(null), DUR.melee + 10);
  };

  const triggerHit = () => {
    setHit(true);
    withTimer(() => setHit(false), DUR.hit + 10);
  };

  const triggerEnter = () => {
    setSwap("enter");
    withTimer(() => setSwap(null), DUR.enter + 10);
  };

  const startSwitchOut = useCallback(() => {
    setSwap("out");
    return new Promise((resolve) => {
      withTimer(() => { setSwap(null); resolve(); }, DUR.switchOut);
    });
  }, []);

  const startSwitchIn = useCallback(() => {
    setSwap("in");
    return new Promise((resolve) => {
      withTimer(() => { setSwap(null); resolve(); }, DUR.switchIn);
    });
  }, []);

  return {
    anim, hit, swap,
    triggerMelee, triggerHit, triggerEnter,
    startSwitchOut, startSwitchIn,
    DUR,
  };
}
