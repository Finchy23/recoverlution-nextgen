/**
 * SEQUENCE THERMODYNAMICS — §11
 *
 * "The room should not stay at the same temperature forever.
 *  Healing happens in arcs — tension builds, peaks, releases."
 *
 * Arc Patterns:
 *
 *   Plateau-Release
 *     Hold at a band for X seconds, then drop 1 band.
 *     Models sustained regulation → parasympathetic release.
 *     Used in: Studio (guided practices), Read (deep absorption)
 *
 *   Descent-Return
 *     Cool from current band toward 0 over time,
 *     then slowly warm back to starting point.
 *     Models: grounding → re-engagement cycle.
 *     Used in: Control (proof geometry), Talk (guided corridor)
 *
 *   Containment-Bloom
 *     Compress to Band 3 (max simplification),
 *     hold briefly, then bloom open to Band 0.
 *     Models: "it's too much" → "I can handle this" cycle.
 *     Used in: Action (NaviCues), emergency de-escalation
 *
 *   Breathing-Wave
 *     Oscillate between two bands rhythmically,
 *     like a somatic breathing pattern.
 *     Models: sympathetic/parasympathetic oscillation.
 *     Used in: Play (sonic field), ambient background regulation
 *
 * Each arc pattern is a generator function that yields
 * HeatBand values over time. The SequenceEngine drives
 * them through the TemperatureProvider.
 */

import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import type { HeatBandId } from './doctrine';

// ═══════════════════════════════════════════════════
// ARC PATTERN DEFINITIONS
// ═══════════════════════════════════════════════════

export type ArcPatternId = 'plateau-release' | 'descent-return' | 'containment-bloom' | 'breathing-wave';

export interface ArcKeyframe {
  band: HeatBandId;
  /** Hold at this band for this many ms before moving to next */
  holdMs: number;
  /** Transition easing to this keyframe */
  easing: 'linear' | 'ease-in' | 'ease-out' | 'breath';
}

export interface ArcPattern {
  id: ArcPatternId;
  label: string;
  description: string;
  /** Whether the arc loops infinitely */
  loop: boolean;
  /** The keyframes that define the arc shape */
  keyframes: ArcKeyframe[];
}

// ── Plateau-Release ──
// Band 2 → hold 6s → Band 1 → hold 4s → Band 0
const plateauRelease: ArcPattern = {
  id: 'plateau-release',
  label: 'Plateau-Release',
  description: 'Sustained regulation → parasympathetic release',
  loop: false,
  keyframes: [
    { band: 2, holdMs: 6000, easing: 'ease-in' },
    { band: 1, holdMs: 4000, easing: 'ease-out' },
    { band: 0, holdMs: 3000, easing: 'ease-out' },
  ],
};

// ── Descent-Return ──
// Current → 0 → hold → climb back
const descentReturn: ArcPattern = {
  id: 'descent-return',
  label: 'Descent-Return',
  description: 'Grounding → re-engagement cycle',
  loop: false,
  keyframes: [
    { band: 2, holdMs: 2000, easing: 'ease-in' },
    { band: 1, holdMs: 2000, easing: 'ease-out' },
    { band: 0, holdMs: 5000, easing: 'ease-out' },
    { band: 1, holdMs: 3000, easing: 'ease-in' },
    { band: 2, holdMs: 2000, easing: 'ease-in' },
  ],
};

// ── Containment-Bloom ──
// Compress to 3 → hold → bloom to 0
const containmentBloom: ArcPattern = {
  id: 'containment-bloom',
  label: 'Containment-Bloom',
  description: '"Too much" → "I can handle this"',
  loop: false,
  keyframes: [
    { band: 3, holdMs: 3000, easing: 'ease-in' },
    { band: 2, holdMs: 1500, easing: 'breath' },
    { band: 1, holdMs: 2000, easing: 'ease-out' },
    { band: 0, holdMs: 4000, easing: 'ease-out' },
  ],
};

// ── Breathing-Wave ──
// Oscillate 0 ↔ 2 rhythmically
const breathingWave: ArcPattern = {
  id: 'breathing-wave',
  label: 'Breathing-Wave',
  description: 'Sympathetic/parasympathetic oscillation',
  loop: true,
  keyframes: [
    { band: 0, holdMs: 4000, easing: 'breath' },
    { band: 1, holdMs: 2000, easing: 'breath' },
    { band: 2, holdMs: 3000, easing: 'breath' },
    { band: 1, holdMs: 2000, easing: 'breath' },
    { band: 0, holdMs: 4000, easing: 'breath' },
  ],
};

export const arcPatterns: Record<ArcPatternId, ArcPattern> = {
  'plateau-release': plateauRelease,
  'descent-return': descentReturn,
  'containment-bloom': containmentBloom,
  'breathing-wave': breathingWave,
};

// ═══════════════════════════════════════════════════
// SEQUENCE ENGINE HOOK
// ═══════════════════════════════════════════════════

export interface SequenceEngineResult {
  /** Whether a sequence is currently playing */
  playing: boolean;
  /** The active pattern (null if stopped) */
  activePattern: ArcPatternId | null;
  /** Current keyframe index */
  currentKeyframe: number;
  /** Progress through current keyframe hold (0-1) */
  holdProgress: number;
  /** The current band being output by the sequence */
  currentBand: HeatBandId;
  /** Start a sequence */
  play: (patternId: ArcPatternId) => void;
  /** Stop the current sequence */
  stop: () => void;
  /** Pause/resume */
  togglePause: () => void;
  /** Whether paused */
  paused: boolean;
}

export function useSequenceEngine(
  /** Called when the sequence wants to change the band */
  onBandChange: (band: HeatBandId) => void,
): SequenceEngineResult {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activePattern, setActivePattern] = useState<ArcPatternId | null>(null);
  const [currentKeyframe, setCurrentKeyframe] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [currentBand, setCurrentBand] = useState<HeatBandId>(0);

  const keyframeStartRef = useRef(0);
  const pausedAtRef = useRef(0);
  const rafRef = useRef(0);
  // Stable ref for callback to avoid effect restarts
  const onBandChangeRef = useRef(onBandChange);
  onBandChangeRef.current = onBandChange;
  // Track last emitted progress to throttle state updates
  const lastProgressRef = useRef(0);
  // Track last emitted band to avoid duplicate calls
  const lastBandRef = useRef<HeatBandId>(0);

  // Playback loop
  useEffect(() => {
    if (!playing || paused || !activePattern) return;

    const pattern = arcPatterns[activePattern];
    const keyframe = pattern.keyframes[currentKeyframe];
    if (!keyframe) {
      setPlaying(false);
      setActivePattern(null);
      return;
    }

    // Set band for this keyframe (only if changed)
    if (keyframe.band !== lastBandRef.current) {
      lastBandRef.current = keyframe.band;
      setCurrentBand(keyframe.band);
      onBandChangeRef.current(keyframe.band);
    }
    keyframeStartRef.current = performance.now();
    lastProgressRef.current = 0;

    const tick = () => {
      const elapsed = performance.now() - keyframeStartRef.current;
      const progress = Math.min(1, elapsed / keyframe.holdMs);

      // Only update holdProgress state when it changes meaningfully (every ~5%)
      if (Math.abs(progress - lastProgressRef.current) > 0.05 || progress >= 1) {
        lastProgressRef.current = progress;
        setHoldProgress(progress);
      }

      if (progress >= 1) {
        // Move to next keyframe
        const nextIndex = currentKeyframe + 1;
        if (nextIndex >= pattern.keyframes.length) {
          if (pattern.loop) {
            setCurrentKeyframe(0);
          } else {
            setPlaying(false);
            setActivePattern(null);
          }
        } else {
          setCurrentKeyframe(nextIndex);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, paused, activePattern, currentKeyframe]);

  const play = useCallback((patternId: ArcPatternId) => {
    setActivePattern(patternId);
    setCurrentKeyframe(0);
    setHoldProgress(0);
    setPaused(false);
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    setPlaying(false);
    setActivePattern(null);
    setCurrentKeyframe(0);
    setHoldProgress(0);
    setPaused(false);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const togglePause = useCallback(() => {
    setPaused(p => !p);
  }, []);

  return useMemo(() => ({
    playing,
    activePattern,
    currentKeyframe,
    holdProgress,
    currentBand,
    play,
    stop,
    togglePause,
    paused,
  }), [playing, activePattern, currentKeyframe, holdProgress, currentBand, play, stop, togglePause, paused]);
}