/**
 * BREATH ENGINE HOOK
 * ══════════════════
 * Shared hook for breath-synchronized animation.
 * Used by DeviceMirror, Overview hero, MotionLab, and any
 * component that needs to pulse with the user's breath.
 *
 * Returns a 0-1 amplitude and the current phase name.
 * The easing is sinusoidal for natural breathing feel.
 */

import { useState, useEffect, useRef } from 'react';
import type { BreathPatternId } from '@/navicue-types';

// ─── Pattern Definitions ────────────────────────────────────
// Canonical type is BreathPatternId in navicue-types.ts.
// Re-exported here as BreathPattern for backward compatibility.

export type BreathPattern = BreathPatternId;

interface BreathPhase {
  name: string;
  duration: number;
}

const BREATH_PATTERNS: Record<BreathPattern, BreathPhase[]> = {
  /** 4-7-8 pattern — calming, long exhale */
  calm: [
    { name: 'inhale', duration: 4000 },
    { name: 'hold', duration: 7000 },
    { name: 'exhale', duration: 8000 },
  ],
  /** 4-4-4-4 box breathing — balanced, grounding */
  box: [
    { name: 'inhale', duration: 4000 },
    { name: 'hold', duration: 4000 },
    { name: 'exhale', duration: 4000 },
    { name: 'rest', duration: 4000 },
  ],
  /** Simple 4-4 — minimal, rhythmic */
  simple: [
    { name: 'inhale', duration: 4000 },
    { name: 'exhale', duration: 4000 },
  ],
  /** 2-1-2-1 — activating, energizing */
  energize: [
    { name: 'inhale', duration: 2000 },
    { name: 'hold', duration: 1000 },
    { name: 'exhale', duration: 2000 },
    { name: 'rest', duration: 1000 },
  ],
} as const;

// ─── Easing ─────────────────────────────────────────────────

/** Sinusoidal ease — natural breathing feel */
const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

// ─── Hook ───────────────────────────────────────────────────

export interface BreathState {
  /** 0-1 amplitude. 0 = fully exhaled, 1 = fully inhaled */
  amplitude: number;
  /** Current phase name */
  phase: string;
  /** Total cycle duration in ms */
  cycleDuration: number;
}

export function useBreathEngine(pattern: BreathPattern = 'calm'): BreathState {
  const [amplitude, setAmplitude] = useState(0);
  const [phase, setPhase] = useState('inhale');
  const frameRef = useRef<number>(0);
  const startRef = useRef(performance.now());

  const phases = BREATH_PATTERNS[pattern];
  const totalCycle = phases.reduce((s, p) => s + p.duration, 0);

  useEffect(() => {
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) % totalCycle;
      let accumulated = 0;

      for (const p of phases) {
        if (elapsed < accumulated + p.duration) {
          const progress = (elapsed - accumulated) / p.duration;
          setPhase(p.name);

          if (p.name === 'inhale') setAmplitude(easeInOutSine(progress));
          else if (p.name === 'exhale') setAmplitude(1 - easeInOutSine(progress));
          else if (p.name === 'hold') setAmplitude(1);
          else setAmplitude(0); // rest
          break;
        }
        accumulated += p.duration;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [pattern, phases, totalCycle]);

  return { amplitude, phase, cycleDuration: totalCycle };
}
