/**
 * NEUROADAPTIVE SENSING — The Room Reads You
 *
 * §11: "The system should read interaction patterns and
 * adjust temperature without explicit user input."
 *
 * The Governor's heat band should not be a manual slider.
 * It should rise when the user is agitated and cool when calm.
 *
 * Signals we read:
 *   Interaction Velocity  — rapid taps/clicks = escalation
 *   Hold Duration         — long holds = regulation, short aborts = frustration
 *   Stillness             — no interaction = cooling
 *   Motion Amplitude      — large pointer movements = agitation
 *   Resolve Rate          — frequent resolves = engagement (neutral/cool)
 *   Abort Rate            — frequent hold-aborts = frustration (escalation)
 *
 * The sensing engine produces a continuous 0-1 "arousal" signal.
 * The TemperatureProvider maps arousal → HeatBand.
 *
 * All sensing is local — no data leaves the device.
 * No PII is collected. We read physics, not identity.
 */

import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import type { HeatBandId } from './doctrine';

// ═══════════════════════════════════════════════════
// SIGNAL TYPES
// ═══════════════════════════════════════════════════

export type InteractionSignal =
  | { type: 'tap' }
  | { type: 'holdStart' }
  | { type: 'holdEnd'; durationMs: number; completed: boolean }
  | { type: 'resolve' }
  | { type: 'abort' }
  | { type: 'pointerMove'; velocity: number }
  | { type: 'modeShift' };

// ═══════════════════════════════════════════════════
// AROUSAL ENGINE
// ═══════════════════════════════════════════════════

interface ArousalState {
  /** Current arousal level (0-1) */
  arousal: number;
  /** Derived heat band */
  band: HeatBandId;
  /** Recent interaction timestamps (for velocity calculation) */
  recentTaps: number[];
  /** Recent abort count (rolling window) */
  recentAborts: number;
  /** Recent resolve count (rolling window) */
  recentResolves: number;
  /** Time of last interaction */
  lastInteractionMs: number;
  /** Consecutive short holds (frustration signal) */
  consecutiveShortHolds: number;
}

const INITIAL_STATE: ArousalState = {
  arousal: 0,
  band: 0,
  recentTaps: [],
  recentAborts: 0,
  recentResolves: 0,
  lastInteractionMs: Date.now(),
  consecutiveShortHolds: 0,
};

// Thresholds
const TAP_WINDOW_MS = 3000;        // count taps in last 3s
const RAPID_TAP_THRESHOLD = 4;     // 4+ taps in window = agitation
const SHORT_HOLD_MS = 200;         // holds shorter than this = abort/frustration
const STILLNESS_COOL_MS = 8000;    // 8s stillness triggers cooling
const STILLNESS_COOL_RATE = 0.008; // arousal drops per tick during stillness
const MAX_AROUSAL = 1;
const MIN_AROUSAL = 0;

// Arousal → Band mapping
function arousalToBand(arousal: number): HeatBandId {
  if (arousal < 0.15) return 0;  // Safe & Social
  if (arousal < 0.35) return 1;  // Alert
  if (arousal < 0.55) return 2;  // Dysregulated
  if (arousal < 0.75) return 3;  // Fight/Flight
  return 4;                       // Survival
}

// ═══════════════════════════════════════════════════
// HOOK: useNeuroadaptiveSensing
// ═══════════════════════════════════════════════════

export interface NeuroadaptiveSensingResult {
  /** Current arousal level (0-1) */
  arousal: number;
  /** Derived heat band from arousal */
  suggestedBand: HeatBandId;
  /** Feed an interaction signal into the engine */
  signal: (event: InteractionSignal) => void;
  /** Reset arousal to baseline */
  reset: () => void;
  /** Whether the system is actively sensing */
  active: boolean;
  /** Toggle sensing on/off */
  setActive: (active: boolean) => void;
}

export function useNeuroadaptiveSensing(
  /** Called when the suggested band changes */
  onBandChange?: (band: HeatBandId) => void,
): NeuroadaptiveSensingResult {
  const stateRef = useRef<ArousalState>({ ...INITIAL_STATE });
  const [arousal, setArousal] = useState(0);
  const [suggestedBand, setSuggestedBand] = useState<HeatBandId>(0);
  const [active, setActive] = useState(true);
  const rafRef = useRef(0);
  const prevBandRef = useRef<HeatBandId>(0);
  const prevArousalRef = useRef(0);
  // Stable ref for callback to avoid effect restarts
  const onBandChangeRef = useRef(onBandChange);
  onBandChangeRef.current = onBandChange;

  // Process an interaction signal
  const signal = useCallback((event: InteractionSignal) => {
    if (!active) return;
    const s = stateRef.current;
    const now = Date.now();
    s.lastInteractionMs = now;

    switch (event.type) {
      case 'tap': {
        // Add to recent taps
        s.recentTaps.push(now);
        // Prune old taps
        s.recentTaps = s.recentTaps.filter(t => now - t < TAP_WINDOW_MS);
        // Rapid tapping escalates
        if (s.recentTaps.length >= RAPID_TAP_THRESHOLD) {
          s.arousal = Math.min(MAX_AROUSAL, s.arousal + 0.12);
        } else {
          s.arousal = Math.min(MAX_AROUSAL, s.arousal + 0.02);
        }
        break;
      }

      case 'holdStart': {
        // Slight arousal bump (anticipation)
        s.arousal = Math.min(MAX_AROUSAL, s.arousal + 0.01);
        break;
      }

      case 'holdEnd': {
        if (event.completed) {
          // Successful hold = regulation signal → cool
          s.consecutiveShortHolds = 0;
          s.arousal = Math.max(MIN_AROUSAL, s.arousal - 0.05);
        } else if (event.durationMs < SHORT_HOLD_MS) {
          // Short abort = frustration signal → heat
          s.consecutiveShortHolds++;
          const frustrationBoost = Math.min(0.15, s.consecutiveShortHolds * 0.04);
          s.arousal = Math.min(MAX_AROUSAL, s.arousal + frustrationBoost);
        } else {
          // Medium abort — neutral
          s.consecutiveShortHolds = 0;
        }
        break;
      }

      case 'resolve': {
        // Resolve = completion = cooling
        s.recentResolves++;
        s.consecutiveShortHolds = 0;
        s.arousal = Math.max(MIN_AROUSAL, s.arousal - 0.08);
        break;
      }

      case 'abort': {
        // Explicit abort = frustration
        s.recentAborts++;
        s.arousal = Math.min(MAX_AROUSAL, s.arousal + 0.06);
        break;
      }

      case 'pointerMove': {
        // Large, fast movements = agitation
        if (event.velocity > 800) {
          s.arousal = Math.min(MAX_AROUSAL, s.arousal + 0.01);
        }
        break;
      }

      case 'modeShift': {
        // Mode shift = slight bump (cognitive load)
        s.arousal = Math.min(MAX_AROUSAL, s.arousal + 0.03);
        break;
      }
    }

    // Clamp
    s.arousal = Math.max(MIN_AROUSAL, Math.min(MAX_AROUSAL, s.arousal));
  }, [active]);

  // Cooling loop — runs continuously, cools arousal during stillness
  useEffect(() => {
    if (!active) return;

    const tick = () => {
      const s = stateRef.current;
      const now = Date.now();
      const timeSinceInteraction = now - s.lastInteractionMs;

      // Passive cooling
      if (timeSinceInteraction > STILLNESS_COOL_MS) {
        s.arousal = Math.max(MIN_AROUSAL, s.arousal - STILLNESS_COOL_RATE);
      }

      // Natural decay (arousal always drifts toward baseline)
      s.arousal = Math.max(MIN_AROUSAL, s.arousal - 0.001);

      // Decay rolling counters
      if (timeSinceInteraction > 10000) {
        s.recentAborts = Math.max(0, s.recentAborts - 1);
        s.recentResolves = Math.max(0, s.recentResolves - 1);
      }

      // Update React state ONLY when values meaningfully change
      const newBand = arousalToBand(s.arousal);
      const arousalChanged = Math.abs(s.arousal - prevArousalRef.current) > 0.005;
      const bandChanged = newBand !== prevBandRef.current;

      if (arousalChanged) {
        prevArousalRef.current = s.arousal;
        setArousal(s.arousal);
      }

      if (bandChanged) {
        prevBandRef.current = newBand;
        setSuggestedBand(newBand);
        onBandChangeRef.current?.(newBand);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  const reset = useCallback(() => {
    stateRef.current = { ...INITIAL_STATE, lastInteractionMs: Date.now() };
    setArousal(0);
    setSuggestedBand(0);
    prevBandRef.current = 0;
  }, []);

  return useMemo(() => ({
    arousal,
    suggestedBand,
    signal,
    reset,
    active,
    setActive,
  }), [arousal, suggestedBand, signal, reset, active]);
}