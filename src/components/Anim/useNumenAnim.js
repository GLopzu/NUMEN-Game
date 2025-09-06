// src/components/Anim/useNumenAnim.js
import { useState, useRef } from "react";

export const ANIM_DURATION = {
  melee: 650, // ms (debe coincidir con NumenArt.css)
  hit: 320,
};

export default function useNumenAnim() {
  const [anim, setAnim] = useState(null);  // "melee" | null
  const [hit, setHit] = useState(false);

  const meleeTimer = useRef(null);
  const hitTimer = useRef(null);

  const triggerMelee = () => {
    clearTimeout(meleeTimer.current);
    setAnim("melee");
    meleeTimer.current = setTimeout(() => setAnim(null), ANIM_DURATION.melee);
  };

  const triggerAttack = triggerMelee;

  const triggerHit = () => {
    clearTimeout(hitTimer.current);
    setHit(true);
    hitTimer.current = setTimeout(() => setHit(false), ANIM_DURATION.hit);
  };

  return { anim, hit, triggerMelee, triggerAttack, triggerHit };
}
