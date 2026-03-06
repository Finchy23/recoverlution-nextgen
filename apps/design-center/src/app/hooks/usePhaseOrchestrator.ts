/**
 * PHASE ORCHESTRATOR
 * ==================
 *
 * The conductor of the NaviCue temporal arc.
 * Drives the enter → active → resolve phase transitions with
 * configurable durations and automatic progression.
 *
 * LAYER 5 RESPONSIBILITY: This hook IS the Temporal Bookends engine.
 *
 * ARCHITECTURE:
 *   - Receives entrance/exit specs (duration, user-action requirements)
 *   - Manages phase state machine: loading → entering → active → resolving → receipt → complete
 *   - Exposes elapsed timers per phase and total
 *   - Listens for atom resolution signal to trigger exit
 *   - Enforces the 800ms Rule (atmosphere settles before text)
 *
 * CONSUMERS:
 *   - NaviCueCompositor (drives phase prop to atoms)
 *   - Materialization renderer (triggers text entrance timing)
 *   - Player UI (shows phase indicator)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { PlayerPhase } from '@/navicue-types';

export interface OrchestratorConfig {
  /** Entrance duration in ms (0 for instant entrances like Cold Arrival) */
  entranceDurationMs: number;
  /** Exit duration in ms */
  exitDurationMs: number;
  /** Whether the entrance requires user action (Breath Gate, Threshold) */
  entranceRequiresAction: boolean;
  /** Time atmosphere renders before text appears (default 800ms) */
  atmosphereSettleMs?: number;
}

export interface OrchestratorState {
  phase: PlayerPhase;
  /** Elapsed time in current phase (ms) */
  phaseElapsed: number;
  /** Total elapsed time since entering (ms) */
  totalElapsed: number;
  /** Whether the atmosphere has settled (800ms Rule) */
  atmosphereSettled: boolean;
  /** Whether text should be visible */
  textVisible: boolean;
  /** The atom-facing phase (maps PlayerPhase → AtomPhase) */
  atomPhase: 'enter' | 'active' | 'resolve';
}

export interface OrchestratorControls {
  /** Start the NaviCue (transition from loading to entering) */
  start: () => void;
  /** Signal that the user completed the entrance action (Breath Gate, Threshold) */
  completeEntranceAction: () => void;
  /** Signal that the atom has resolved (triggers exit transition) */
  signalResolution: () => void;
  /** Reset everything to loading state */
  reset: () => void;
  /** Skip to active phase (for testing) */
  skipToActive: () => void;
}

const DEFAULT_ATMOSPHERE_SETTLE = 800;

export function usePhaseOrchestrator(
  config: OrchestratorConfig
): [OrchestratorState, OrchestratorControls] {
  const [phase, setPhase] = useState<PlayerPhase>('loading');
  const phaseStartRef = useRef(0);
  const totalStartRef = useRef(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const frameRef = useRef<number>(0);
  const actionCompletedRef = useRef(false);
  // Counter to force effect re-evaluation when actionCompleted changes
  const [actionTrigger, setActionTrigger] = useState(0);

  const settleMs = config.atmosphereSettleMs ?? DEFAULT_ATMOSPHERE_SETTLE;

  // ── Phase transition logging ──────────────────────────────
  const prevPhaseRef = useRef<PlayerPhase>('loading');
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      console.log(`%c[Orchestrator] ${prevPhaseRef.current} → ${phase}`, 'color: #ff88ff; font-weight: bold', {
        entranceDurationMs: config.entranceDurationMs,
        exitDurationMs: config.exitDurationMs,
        requiresAction: config.entranceRequiresAction,
        actionCompleted: actionCompletedRef.current,
      });
      prevPhaseRef.current = phase;
    }
  }, [phase, config.entranceDurationMs, config.exitDurationMs, config.entranceRequiresAction]);

  // ── Animation loop for elapsed timers ─────────────────────
  useEffect(() => {
    if (phase === 'loading' || phase === 'complete') {
      return;
    }

    const tick = () => {
      const now = performance.now();
      setPhaseElapsed(now - phaseStartRef.current);
      setTotalElapsed(now - totalStartRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [phase]);

  // ── Auto-advance from entering → active ───────────────────
  useEffect(() => {
    if (phase !== 'entering') return;

    // If entrance requires user action, don't auto-advance
    if (config.entranceRequiresAction && !actionCompletedRef.current) return;

    // If entrance has a duration, wait for it
    if (config.entranceDurationMs > 0) {
      const timer = setTimeout(() => {
        setPhase('active');
        phaseStartRef.current = performance.now();
        setPhaseElapsed(0);
      }, config.entranceDurationMs);
      return () => clearTimeout(timer);
    }

    // Instant entrance (Cold Arrival)
    setPhase('active');
    phaseStartRef.current = performance.now();
    setPhaseElapsed(0);
  }, [phase, config.entranceDurationMs, config.entranceRequiresAction, actionTrigger]);

  // ── Auto-advance from resolving → receipt → complete ──────
  useEffect(() => {
    if (phase !== 'resolving') return;

    const timer = setTimeout(() => {
      setPhase('receipt');
      phaseStartRef.current = performance.now();
      setPhaseElapsed(0);

      // Auto-advance from receipt to complete after 3s
      setTimeout(() => {
        setPhase('complete');
      }, 3000);
    }, config.exitDurationMs);

    return () => clearTimeout(timer);
  }, [phase, config.exitDurationMs]);

  // ── Derived state ─────────────────────────────────────────
  const atmosphereSettled = phase === 'entering'
    ? phaseElapsed >= settleMs
    : phase !== 'loading';

  const textVisible = phase === 'entering'
    ? atmosphereSettled
    : phase === 'active' || phase === 'resolving' || phase === 'receipt';

  const atomPhase: 'enter' | 'active' | 'resolve' =
    phase === 'entering' ? 'enter' :
    phase === 'resolving' || phase === 'receipt' || phase === 'complete' ? 'resolve' :
    'active';

  // ── Controls ──────────────────────────────────────────────
  const start = useCallback(() => {
    const now = performance.now();
    totalStartRef.current = now;
    phaseStartRef.current = now;
    actionCompletedRef.current = false;
    setPhaseElapsed(0);
    setTotalElapsed(0);
    setPhase('entering');
  }, []);

  const completeEntranceAction = useCallback(() => {
    actionCompletedRef.current = true;
    setActionTrigger(prev => prev + 1);
  }, []);

  const signalResolution = useCallback(() => {
    if (phase === 'active') {
      setPhase('resolving');
      phaseStartRef.current = performance.now();
      setPhaseElapsed(0);
    }
  }, [phase]);

  const reset = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setPhase('loading');
    setPhaseElapsed(0);
    setTotalElapsed(0);
    actionCompletedRef.current = false;
  }, []);

  const skipToActive = useCallback(() => {
    const now = performance.now();
    if (totalStartRef.current === 0) totalStartRef.current = now;
    phaseStartRef.current = now;
    actionCompletedRef.current = false;
    setPhaseElapsed(0);
    setPhase('active');
  }, []);

  return [
    { phase, phaseElapsed, totalElapsed, atmosphereSettled, textVisible, atomPhase },
    { start, completeEntranceAction, signalResolution, reset, skipToActive },
  ];
}