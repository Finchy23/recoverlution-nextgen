/**
 * useTextMaterializer -- How Words Arrive on Glass
 *
 * This is the DELIVER primitive for text content.
 * Instead of text simply "appearing" or "fading in," it MATERIALIZES
 * through a chosen mode that creates presence and demands attention.
 *
 * MODES:
 *
 *   EMERGE     Characters rise from behind the glass surface, one by one,
 *              like thoughts surfacing from the unconscious. Gentle upward
 *              drift with softening blur. Best for Knowing (K) mechanics
 *              and morning chrono context.
 *
 *   DISSOLVE   Text resolves from a noisy/scattered state into clarity,
 *              like a radio signal locking onto the right frequency.
 *              Best for work/social chrono and prediction mechanics.
 *
 *   INSCRIBE   Characters appear left-to-right as if being written by
 *              an invisible hand. The cursor position advances steadily.
 *              Best for narrative_edit mechanic where the user will
 *              then rewrite what was inscribed.
 *
 *   BURN_IN    Text starts fully transparent and slowly sears into the
 *              glass surface, gaining opacity and warmth over several seconds.
 *              Forces slow reading. Best for night chrono and
 *              future_self mechanic.
 *
 *   IMMEDIATE  No animation. Text is fully present from frame 1.
 *              Used in Red state when the PFC is offline and any
 *              animation would be noise, not signal.
 *
 * USAGE:
 * ```tsx
 * const { characters, isComplete, progress } = useTextMaterializer(
 *   'The old pathway is a superhighway. We are building a dirt road.',
 *   'emerge',
 *   { speed: 1.0, startDelay: 500 }
 * );
 *
 * return (
 *   <p>
 *     {characters.map((c, i) => (
 *       <span key={i} style={{
 *         opacity: c.opacity,
 *         transform: `translateY(${c.y}px)`,
 *         filter: `blur(${c.blur}px)`,
 *         display: 'inline-block',
 *         transition: 'none',
 *       }}>
 *         {c.char === ' ' ? '\u00A0' : c.char}
 *       </span>
 *     ))}
 *   </p>
 * );
 * ```
 *
 * ARCHITECTURE:
 * - Uses requestAnimationFrame for 60fps character-level animation
 * - Each character has independent opacity, y-offset, and blur
 * - The engine calculates per-character state from a single elapsed time
 * - No spring physics -- pure deterministic timing for consistency
 * - Respects breath engine sync when provided (characters arrive on exhale)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { TextMaterializeMode } from '@/app/design-system/navicue-mechanics';

// ── Per-character state ───────────────────────────────────────────

export interface CharacterState {
  /** The character (including spaces) */
  char: string;
  /** Character index in the full string */
  index: number;
  /** Current opacity (0-1) */
  opacity: number;
  /** Vertical offset in px (positive = below, negative = above) */
  y: number;
  /** Blur radius in px */
  blur: number;
  /** Whether this character is fully revealed */
  revealed: boolean;
}

// ── Configuration ─────────────────────────────────────────────────

interface MaterializerOptions {
  /**
   * Speed multiplier. 1.0 = default pacing.
   * 0.5 = half speed (contemplative). 2.0 = double speed (urgent).
   */
  speed?: number;

  /** Delay before materialization begins (ms). Default: 0 */
  startDelay?: number;

  /** Time per character in ms. Default varies by mode. */
  msPerChar?: number;

  /**
   * Optional breath amplitude (0-1) to sync materialization pacing.
   * When provided, characters arrive faster during exhale (settling)
   * and slower during inhale (expansion).
   */
  breathAmplitude?: number;

  /** Whether to auto-start. Default: true */
  autoStart?: boolean;

  /** Callback when all characters are revealed */
  onComplete?: () => void;
}

// ── Mode-specific timing defaults ─────────────────────────────────

interface ModeConfig {
  /** Base ms per character */
  msPerChar: number;
  /** Initial y-offset for unrevealed characters */
  startY: number;
  /** Initial blur for unrevealed characters */
  startBlur: number;
  /** Transition duration for each character once its reveal starts */
  charTransitionMs: number;
  /** How many characters are "in flight" simultaneously */
  concurrentChars: number;
}

const MODE_CONFIGS: Record<TextMaterializeMode, ModeConfig> = {
  emerge: {
    msPerChar: 55,
    startY: 12,         // rises from below
    startBlur: 4,
    charTransitionMs: 400,
    concurrentChars: 5,  // soft wave of 5 chars
  },
  dissolve: {
    msPerChar: 40,
    startY: 0,           // no vertical movement
    startBlur: 8,        // heavy blur -> clear
    charTransitionMs: 350,
    concurrentChars: 8,  // wider wave (frequency signal)
  },
  inscribe: {
    msPerChar: 45,
    startY: 0,
    startBlur: 0,        // no blur -- just opacity
    charTransitionMs: 150,
    concurrentChars: 1,  // strict left-to-right (typewriter)
  },
  burn_in: {
    msPerChar: 90,
    startY: 0,
    startBlur: 1,        // very slight blur
    charTransitionMs: 1200, // slow sear
    concurrentChars: 12, // many chars searing at once
  },
  immediate: {
    msPerChar: 0,
    startY: 0,
    startBlur: 0,
    charTransitionMs: 0,
    concurrentChars: Infinity,
  },
};

// ── Easing ────────────────────────────────────────────────────────

/** Sine ease-out: fast start, gentle landing */
function easeOutSine(t: number): number {
  return Math.sin(t * Math.PI * 0.5);
}

/** Quadratic ease-in-out: smooth both ends */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ── The Hook ──────────────────────────────────────────────────────

export function useTextMaterializer(
  text: string,
  mode: TextMaterializeMode,
  options?: MaterializerOptions,
) {
  const {
    speed = 1.0,
    startDelay = 0,
    msPerChar: customMsPerChar,
    breathAmplitude,
    autoStart = true,
    onComplete,
  } = options ?? {};

  const config = MODE_CONFIGS[mode];
  const baseMsPerChar = customMsPerChar ?? config.msPerChar;
  const effectiveMsPerChar = baseMsPerChar / speed;

  // Memoize character array
  const chars = useMemo(() => text.split(''), [text]);

  const [characters, setCharacters] = useState<CharacterState[]>(() =>
    chars.map((char, index) => ({
      char,
      index,
      opacity: mode === 'immediate' ? 1 : 0,
      y: mode === 'immediate' ? 0 : config.startY,
      blur: mode === 'immediate' ? 0 : config.startBlur,
      revealed: mode === 'immediate',
    }))
  );

  const [isComplete, setIsComplete] = useState(mode === 'immediate');
  const [progress, setProgress] = useState(mode === 'immediate' ? 1 : 0);

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const activeRef = useRef(false);
  const completeFiredRef = useRef(mode === 'immediate');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // ── Calculate per-character state from elapsed time ──────────

  const calcCharState = useCallback(
    (charIndex: number, elapsed: number): Omit<CharacterState, 'char' | 'index'> => {
      if (mode === 'immediate') {
        return { opacity: 1, y: 0, blur: 0, revealed: true };
      }

      // When does this character START revealing?
      const charStartTime = startDelay + (charIndex * effectiveMsPerChar);

      if (elapsed < charStartTime) {
        return {
          opacity: 0,
          y: config.startY,
          blur: config.startBlur,
          revealed: false,
        };
      }

      // How far through its transition is this character?
      const charElapsed = elapsed - charStartTime;
      const t = Math.min(1, charElapsed / config.charTransitionMs);

      // Apply breath modulation if available
      // During exhale (low amplitude), text arrives faster
      // During inhale (high amplitude), text pauses slightly
      const breathMod = breathAmplitude !== undefined
        ? 1 - (breathAmplitude * 0.3) // 30% speed reduction at peak inhale
        : 1;

      const effectiveT = Math.min(1, t * breathMod + (1 - breathMod));

      switch (mode) {
        case 'emerge': {
          const easedT = easeOutSine(effectiveT);
          return {
            opacity: easedT,
            y: config.startY * (1 - easedT),
            blur: config.startBlur * (1 - easedT),
            revealed: effectiveT >= 0.95,
          };
        }

        case 'dissolve': {
          const easedT = easeInOutQuad(effectiveT);
          // Dissolve: blur reduces, opacity increases, slight scale
          return {
            opacity: easedT,
            y: 0,
            blur: config.startBlur * (1 - easedT),
            revealed: effectiveT >= 0.95,
          };
        }

        case 'inscribe': {
          // Sharp on/off with very slight fade
          const easedT = effectiveT >= 0.5 ? 1 : effectiveT * 2;
          return {
            opacity: easedT,
            y: 0,
            blur: 0,
            revealed: effectiveT >= 0.5,
          };
        }

        case 'burn_in': {
          // Very slow opacity build, slight warmth (simulated via opacity curve)
          const easedT = easeInOutQuad(effectiveT);
          // Burn-in has a distinctive two-phase opacity curve:
          // 0-60%: very slow (searing in)
          // 60-100%: accelerates to full (locked in)
          const burnOpacity = easedT < 0.6
            ? easedT * 0.4 / 0.6  // 0 -> 0.4 over first 60%
            : 0.4 + (easedT - 0.6) * 0.6 / 0.4; // 0.4 -> 1.0 over last 40%
          return {
            opacity: burnOpacity,
            y: 0,
            blur: config.startBlur * (1 - easedT),
            revealed: easedT >= 0.95,
          };
        }

        default:
          return { opacity: 1, y: 0, blur: 0, revealed: true };
      }
    },
    [mode, config, effectiveMsPerChar, startDelay, breathAmplitude],
  );

  // ── Animation loop ──────────────────────────────────────────────

  const tick = useCallback((timestamp: number) => {
    if (!activeRef.current) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;

    // Calculate all character states
    const newChars: CharacterState[] = chars.map((char, i) => ({
      char,
      index: i,
      ...calcCharState(i, elapsed),
    }));

    setCharacters(newChars);

    // Calculate overall progress
    const revealedCount = newChars.filter(c => c.revealed).length;
    const p = chars.length > 0 ? revealedCount / chars.length : 1;
    setProgress(p);

    // Check completion
    if (p >= 1 && !completeFiredRef.current) {
      completeFiredRef.current = true;
      setIsComplete(true);
      onCompleteRef.current?.();
      return; // Stop the loop
    }

    if (p < 1) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [chars, calcCharState]);

  // ── Controls ────────────────────────────────────────────────────

  const start = useCallback(() => {
    if (mode === 'immediate' || activeRef.current) return;
    activeRef.current = true;
    startTimeRef.current = 0;
    completeFiredRef.current = false;
    setIsComplete(false);
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);
  }, [mode, tick]);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    completeFiredRef.current = false;
    setIsComplete(mode === 'immediate');
    setProgress(mode === 'immediate' ? 1 : 0);
    setCharacters(
      chars.map((char, index) => ({
        char,
        index,
        opacity: mode === 'immediate' ? 1 : 0,
        y: mode === 'immediate' ? 0 : config.startY,
        blur: mode === 'immediate' ? 0 : config.startBlur,
        revealed: mode === 'immediate',
      }))
    );
  }, [stop, chars, mode, config]);

  // ── Lifecycle ───────────────────────────────────────────────────

  useEffect(() => {
    if (autoStart && mode !== 'immediate') {
      start();
    }
    return () => {
      activeRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, mode, autoStart]);

  // Reset characters when text or mode changes
  useEffect(() => {
    if (mode === 'immediate') {
      setCharacters(
        chars.map((char, index) => ({
          char,
          index,
          opacity: 1,
          y: 0,
          blur: 0,
          revealed: true,
        }))
      );
      setIsComplete(true);
      setProgress(1);
      completeFiredRef.current = true;
    }
  }, [text, mode, chars]);

  return {
    /** Per-character animation state */
    characters,
    /** Whether all characters have been fully revealed */
    isComplete,
    /** Overall progress (0-1) */
    progress,
    /** Start the materialization (if not auto-started) */
    start,
    /** Pause the materialization */
    stop,
    /** Reset to initial state */
    reset,
    /** The mode currently in use */
    mode,
  };
}

// ── Helper: render materialized text ─────────────────────────────

/**
 * Convenience component for rendering materialized text.
 * Handles the span-per-character pattern with proper whitespace.
 */
export function MaterializedText({
  characters,
  style,
  className,
}: {
  characters: CharacterState[];
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <span style={style} className={className}>
      {characters.map((c) => (
        <span
          key={c.index}
          style={{
            opacity: c.opacity,
            transform: c.y !== 0 ? `translateY(${c.y}px)` : undefined,
            filter: c.blur > 0.1 ? `blur(${c.blur}px)` : undefined,
            display: 'inline-block',
            whiteSpace: c.char === ' ' ? 'pre' : undefined,
            willChange: c.revealed ? 'auto' : 'opacity, transform, filter',
          }}
        >
          {c.char === ' ' ? '\u00A0' : c.char}
        </span>
      ))}
    </span>
  );
}
