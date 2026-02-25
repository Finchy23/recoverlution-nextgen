/**
 * useBreathEngine -- The Somatic Heartbeat
 *
 * A continuous oscillator that everything else can lock to.
 * This is the PULSE of the delivery layer.
 *
 * Returns a smooth breath cycle with phase awareness:
 *   inhale -> hold_in -> exhale -> hold_out -> inhale -> ...
 *
 * Components sync their animations, opacity, scale, and pacing
 * to this rhythm. When the glass surface breathes, when particles
 * slow, when text pauses between lines -- it's all locked to
 * this engine.
 *
 * PATTERNS:
 *   calm_478:  4s inhale, 7s hold, 8s exhale (parasympathetic activation)
 *   box:       4s inhale, 4s hold, 4s exhale, 4s hold (regulation)
 *   simple:    4s inhale, 4s exhale (baseline calm)
 *   energize:  2s inhale, 1s hold, 4s exhale (activating)
 *
 * USAGE:
 * ```tsx
 * const breath = useBreathEngine('calm_478');
 *
 * // Sync a circle's scale to the breath
 * <motion.div
 *   animate={{ scale: 0.85 + breath.amplitude * 0.3 }}
 *   transition={{ duration: 0.1, ease: 'linear' }}
 * />
 *
 * // Know what phase we're in
 * {breath.phase === 'inhale' && <span>Breathe in...</span>}
 *
 * // Track total cycles for rep counting
 * {breath.cycleCount >= 3 && <ReceiptButton />}
 * ```
 *
 * ARCHITECTURE:
 * Uses requestAnimationFrame for smooth 60fps updates.
 * Phase transitions are calculated from elapsed time, not timeouts,
 * so they never drift. The amplitude is a smooth sine curve that
 * peaks at end-of-inhale and troughs at end-of-exhale.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { BreathPattern } from '@/app/design-system/navicue-mechanics';

// ── Phase definitions per pattern ─────────────────────────────────

interface PhaseSpec {
  name: BreathPhase;
  duration: number; // ms
}

type BreathPhase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';

const PATTERNS: Record<BreathPattern, PhaseSpec[]> = {
  calm_478: [
    { name: 'inhale',   duration: 4000 },
    { name: 'hold_in',  duration: 7000 },
    { name: 'exhale',   duration: 8000 },
    // No hold_out in 4-7-8
  ],
  box: [
    { name: 'inhale',   duration: 4000 },
    { name: 'hold_in',  duration: 4000 },
    { name: 'exhale',   duration: 4000 },
    { name: 'hold_out', duration: 4000 },
  ],
  simple: [
    { name: 'inhale',   duration: 4000 },
    { name: 'exhale',   duration: 4000 },
  ],
  energize: [
    { name: 'inhale',   duration: 2000 },
    { name: 'hold_in',  duration: 1000 },
    { name: 'exhale',   duration: 4000 },
  ],
};

// ── Return state ──────────────────────────────────────────────────

export interface BreathState {
  /** Current breath phase */
  phase: BreathPhase;

  /** Progress within current phase (0 -> 1) */
  phaseProgress: number;

  /** Progress within entire cycle (0 -> 1) */
  cycleProgress: number;

  /** Number of completed cycles */
  cycleCount: number;

  /**
   * Smooth amplitude for visual sync (0 -> 1 -> 0).
   * Peaks at end of inhale, troughs at end of exhale.
   * During holds, maintains the level.
   * This is the primary value components should bind to.
   */
  amplitude: number;

  /** Whether the engine is currently running */
  active: boolean;

  /** Total elapsed time in ms */
  elapsed: number;
}

// ── The Hook ──────────────────────────────────────────────────────

export function useBreathEngine(
  pattern: BreathPattern | null,
  options?: {
    /** Auto-start on mount? Default: true */
    autoStart?: boolean;
    /** Callback fired on each completed cycle */
    onCycleComplete?: (cycleCount: number) => void;
  },
) {
  const { autoStart = true, onCycleComplete } = options ?? {};

  const [state, setState] = useState<BreathState>({
    phase: 'inhale',
    phaseProgress: 0,
    cycleProgress: 0,
    cycleCount: 0,
    amplitude: 0,
    active: false,
    elapsed: 0,
  });

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const activeRef = useRef(false);
  const cycleCountRef = useRef(0);
  const onCycleCompleteRef = useRef(onCycleComplete);
  onCycleCompleteRef.current = onCycleComplete;

  // Pre-compute total cycle duration and cumulative phase boundaries
  const phases = pattern ? PATTERNS[pattern] : null;
  const totalDuration = phases
    ? phases.reduce((sum, p) => sum + p.duration, 0)
    : 0;

  /**
   * Calculate amplitude from cycle position.
   *
   * The amplitude curve:
   * - Rises smoothly during inhale (0 -> 1)
   * - Holds at 1.0 during hold_in
   * - Falls smoothly during exhale (1 -> 0)
   * - Holds at 0.0 during hold_out
   *
   * Uses sine easing for organic feel.
   */
  const calcAmplitude = useCallback((cycleMs: number): number => {
    if (!phases || totalDuration === 0) return 0;

    let elapsed = cycleMs % totalDuration;
    let cumulativeMs = 0;

    for (const phase of phases) {
      const phaseEnd = cumulativeMs + phase.duration;

      if (elapsed < phaseEnd) {
        const phaseElapsed = elapsed - cumulativeMs;
        const phaseProgress = phaseElapsed / phase.duration;

        switch (phase.name) {
          case 'inhale': {
            // Sine ease-out: smooth acceleration to peak
            return Math.sin(phaseProgress * Math.PI * 0.5);
          }
          case 'hold_in':
            return 1.0;
          case 'exhale': {
            // Sine ease-in: smooth deceleration to trough
            return Math.cos(phaseProgress * Math.PI * 0.5);
          }
          case 'hold_out':
            return 0.0;
        }
      }

      cumulativeMs = phaseEnd;
    }

    return 0;
  }, [phases, totalDuration]);

  /**
   * Determine which phase we're in at a given cycle position.
   */
  const calcPhase = useCallback((cycleMs: number): { phase: BreathPhase; phaseProgress: number } => {
    if (!phases || totalDuration === 0) {
      return { phase: 'inhale', phaseProgress: 0 };
    }

    let elapsed = cycleMs % totalDuration;
    let cumulativeMs = 0;

    for (const p of phases) {
      const phaseEnd = cumulativeMs + p.duration;

      if (elapsed < phaseEnd) {
        return {
          phase: p.name,
          phaseProgress: (elapsed - cumulativeMs) / p.duration,
        };
      }

      cumulativeMs = phaseEnd;
    }

    return { phase: phases[0].name, phaseProgress: 0 };
  }, [phases, totalDuration]);

  // ── Animation loop ──────────────────────────────────────────────

  const tick = useCallback((timestamp: number) => {
    if (!activeRef.current || !phases || totalDuration === 0) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const cycleMs = elapsed % totalDuration;
    const cycleProgress = cycleMs / totalDuration;
    const newCycleCount = Math.floor(elapsed / totalDuration);

    // Check for cycle completion
    if (newCycleCount > cycleCountRef.current) {
      cycleCountRef.current = newCycleCount;
      onCycleCompleteRef.current?.(newCycleCount);
    }

    const { phase, phaseProgress } = calcPhase(cycleMs);
    const amplitude = calcAmplitude(cycleMs);

    setState({
      phase,
      phaseProgress,
      cycleProgress,
      cycleCount: newCycleCount,
      amplitude,
      active: true,
      elapsed,
    });

    rafRef.current = requestAnimationFrame(tick);
  }, [phases, totalDuration, calcPhase, calcAmplitude]);

  // ── Controls ────────────────────────────────────────────────────

  const start = useCallback(() => {
    if (!pattern || activeRef.current) return;
    activeRef.current = true;
    startTimeRef.current = 0;
    cycleCountRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [pattern, tick]);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setState(prev => ({ ...prev, active: false }));
  }, []);

  const reset = useCallback(() => {
    stop();
    cycleCountRef.current = 0;
    setState({
      phase: 'inhale',
      phaseProgress: 0,
      cycleProgress: 0,
      cycleCount: 0,
      amplitude: 0,
      active: false,
      elapsed: 0,
    });
  }, [stop]);

  // ── Lifecycle ───────────────────────────────────────────────────

  useEffect(() => {
    if (autoStart && pattern) {
      start();
    }
    return () => {
      activeRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // Only re-run when pattern or autoStart changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, autoStart]);

  return {
    ...state,
    start,
    stop,
    reset,
    /** Total cycle duration in ms (for external timing) */
    cycleDuration: totalDuration,
    /** Current pattern name (or null if disabled) */
    pattern,
  };
}

// ── Utility: get phase label for UI ─────────────────────────────

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'Breathe in',
  hold_in: 'Hold',
  exhale: 'Let go',
  hold_out: 'Rest',
};

export function getBreathPhaseLabel(phase: BreathPhase): string {
  return PHASE_LABELS[phase];
}

/**
 * Get the dominant instruction for a breath pattern.
 * Used for minimal Red-state UI: just the breathing guidance.
 */
export function getBreathInstruction(phase: BreathPhase): string {
  switch (phase) {
    case 'inhale':   return 'in';
    case 'hold_in':  return 'hold';
    case 'exhale':   return 'out';
    case 'hold_out': return 'rest';
  }
}
