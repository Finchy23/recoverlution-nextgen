/**
 * useReceiptCeremony -- How the Pathway Seals
 *
 * This is the SEAL layer of the operating loop:
 *   Sense -> Route -> Deliver -> SEAL
 *
 * When a user completes a receipt (a rep), the ceremony provides
 * the visual/somatic confirmation that the action was received.
 * Not celebrated. Not gamified. RECEIVED. Like a trusted witness
 * nodding once.
 *
 * PHILOSOPHY:
 *   The ceremony is significant without being performative.
 *   It says "this was real" without saying "great job."
 *   It says "the track is deeper" without saying "level up."
 *   The feeling should be: quiet gravity. Like placing a stone
 *   on a cairn. One more.
 *
 * MODES:
 *
 *   ABSORB         The content gently contracts toward a center point,
 *                  opacity reduces, a single soft glow pulse, then gone.
 *                  The moment has been received into the system.
 *                  Best for: tap receipts, counterfactual flips, social pings.
 *
 *   CRYSTALLIZE    A frost-like pattern spreads from the point of last touch.
 *                  The content freezes in place, then slowly dissolves.
 *                  The moment has been preserved.
 *                  Best for: hold receipts, prediction bets, future-self bridges.
 *
 *   DISSOLVE       The content peacefully fades to transparency, leaving
 *                  behind a single faint trace line (like a watermark).
 *                  The moment has passed and that's enough.
 *                  Best for: somatic entrainment, friction design. Red state.
 *
 *   SHATTER_REFORM The content fragments into pieces, scatters briefly,
 *                  then the fragments reassemble into a new statement
 *                  (the rewritten belief). Transformation visible.
 *                  Best for: burn receipts, narrative edits.
 *
 * USAGE:
 * ```tsx
 * const ceremony = useReceiptCeremony('absorb');
 *
 * // When the user completes their receipt:
 * function handleReceiptComplete() {
 *   ceremony.trigger();
 * }
 *
 * // Apply ceremony styles to the content container:
 * <div style={ceremony.containerStyle}>
 *   <NaviCueContent />
 *   {ceremony.phase === 'sealing' && ceremony.overlayElement}
 * </div>
 *
 * // After ceremony completes:
 * useEffect(() => {
 *   if (ceremony.phase === 'sealed') {
 *     onComplete(); // advance to afterglow
 *   }
 * }, [ceremony.phase]);
 * ```
 *
 * ARCHITECTURE:
 * Returns animation state that the consuming component applies
 * to its own DOM. No internal DOM rendering (except optional
 * overlay elements for crystallize/shatter effects).
 * Uses requestAnimationFrame for smooth 60fps transitions.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ReceiptCeremonyMode } from '@/app/design-system/navicue-mechanics';

// ── Phase states ──────────────────────────────────────────────────

export type CeremonyPhase =
  | 'idle'      // Waiting for trigger
  | 'sealing'   // Ceremony in progress
  | 'sealed';   // Complete -- advance to afterglow

// ── Return state ──────────────────────────────────────────────────

export interface CeremonyState {
  /** Current phase of the ceremony */
  phase: CeremonyPhase;

  /** Progress through the ceremony (0-1) */
  progress: number;

  /**
   * CSS properties to apply to the content container.
   * These animate the content through the ceremony.
   */
  containerStyle: React.CSSProperties;

  /**
   * Optional overlay element for modes that need visual layers
   * (crystallize frost pattern, shatter fragments).
   * null in idle phase or for modes that don't need overlays.
   */
  overlayStyle: React.CSSProperties | null;

  /** Trigger the ceremony */
  trigger: (options?: TriggerOptions) => void;

  /** Reset to idle (for re-use) */
  reset: () => void;
}

interface TriggerOptions {
  /** Optional: touch point for directional effects (crystallize) */
  originX?: number;
  originY?: number;
  /** Optional: replacement text for shatter_reform mode */
  reformText?: string;
}

// ── Mode-specific timing ──────────────────────────────────────────

interface CeremonyTiming {
  /** Total duration of the sealing phase in ms */
  duration: number;
  /** Easing function */
  easing: (t: number) => number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

const CEREMONY_TIMINGS: Record<ReceiptCeremonyMode, CeremonyTiming> = {
  absorb: {
    duration: 1200,
    easing: easeOutCubic,
  },
  crystallize: {
    duration: 2000,
    easing: easeInOutQuart,
  },
  dissolve: {
    duration: 1500,
    easing: easeOutCubic,
  },
  shatter_reform: {
    duration: 2800,
    easing: easeOutExpo,
  },
};

// ── The Hook ──────────────────────────────────────────────────────

export function useReceiptCeremony(
  mode: ReceiptCeremonyMode,
  options?: {
    /** Callback when ceremony completes (sealed) */
    onSealed?: () => void;
    /** Custom duration override in ms */
    duration?: number;
  },
) {
  const { onSealed, duration: customDuration } = options ?? {};

  const timing = CEREMONY_TIMINGS[mode];
  const duration = customDuration ?? timing.duration;

  const [phase, setPhase] = useState<CeremonyPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [originPoint, setOriginPoint] = useState({ x: 0.5, y: 0.5 });

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const onSealedRef = useRef(onSealed);
  onSealedRef.current = onSealed;

  // ── Calculate container style from mode + progress ──────────

  const getContainerStyle = useCallback(
    (p: number, currentPhase: CeremonyPhase): React.CSSProperties => {
      if (currentPhase === 'idle') {
        return {};
      }

      const easedP = timing.easing(p);

      switch (mode) {
        case 'absorb': {
          // Contract toward center, fade out, slight glow pulse at ~40%
          const scale = 1 - easedP * 0.15; // 1.0 -> 0.85
          const opacity = 1 - easedP; // 1.0 -> 0.0
          const glowOpacity = p > 0.3 && p < 0.6 ? 0.15 * Math.sin((p - 0.3) / 0.3 * Math.PI) : 0;
          return {
            transform: `scale(${scale})`,
            opacity,
            filter: glowOpacity > 0 ? `brightness(${1 + glowOpacity})` : undefined,
            transition: 'none',
            willChange: 'transform, opacity, filter',
          };
        }

        case 'crystallize': {
          // Two phases:
          // 0-0.6: content freezes (slight desaturation + blur)
          // 0.6-1.0: frozen content dissolves
          if (easedP < 0.6) {
            const freezeP = easedP / 0.6;
            return {
              filter: `saturate(${1 - freezeP * 0.4}) blur(${freezeP * 0.5}px)`,
              opacity: 1,
              transition: 'none',
              willChange: 'filter, opacity',
            };
          }
          const dissolveP = (easedP - 0.6) / 0.4;
          return {
            filter: `saturate(0.6) blur(${0.5 + dissolveP * 2}px)`,
            opacity: 1 - dissolveP,
            transition: 'none',
            willChange: 'filter, opacity',
          };
        }

        case 'dissolve': {
          // Simple, peaceful fade with slight upward drift
          return {
            opacity: 1 - easedP,
            transform: `translateY(${-easedP * 8}px)`,
            transition: 'none',
            willChange: 'opacity, transform',
          };
        }

        case 'shatter_reform': {
          // Three phases:
          // 0-0.3: content fragments (slight shake + blur)
          // 0.3-0.6: fragments scatter (scale down, spread)
          // 0.6-1.0: reform into new state (scale up, clear)
          if (easedP < 0.3) {
            const shakeP = easedP / 0.3;
            const shakeX = Math.sin(shakeP * Math.PI * 6) * 3 * (1 - shakeP);
            return {
              transform: `translateX(${shakeX}px)`,
              filter: `blur(${shakeP * 2}px)`,
              opacity: 1,
              transition: 'none',
              willChange: 'transform, filter, opacity',
            };
          }
          if (easedP < 0.6) {
            const scatterP = (easedP - 0.3) / 0.3;
            return {
              transform: `scale(${1 - scatterP * 0.3})`,
              filter: `blur(${2 + scatterP * 4}px)`,
              opacity: 1 - scatterP * 0.7,
              transition: 'none',
              willChange: 'transform, filter, opacity',
            };
          }
          const reformP = (easedP - 0.6) / 0.4;
          return {
            transform: `scale(${0.7 + reformP * 0.3})`,
            filter: `blur(${6 * (1 - reformP)}px)`,
            opacity: 0.3 + reformP * 0.7,
            transition: 'none',
            willChange: 'transform, filter, opacity',
          };
        }

        default:
          return {};
      }
    },
    [mode, timing],
  );

  // ── Calculate overlay style ─────────────────────────────────

  const getOverlayStyle = useCallback(
    (p: number, currentPhase: CeremonyPhase): React.CSSProperties | null => {
      if (currentPhase !== 'sealing') return null;

      const easedP = timing.easing(p);

      switch (mode) {
        case 'crystallize': {
          // Frost radial expanding from touch point
          if (easedP > 0.6) return null; // frost dissolves with content
          const frostP = easedP / 0.6;
          const frostRadius = frostP * 150;
          return {
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle ${frostRadius}% at ${originPoint.x * 100}% ${originPoint.y * 100}%, rgba(200, 220, 240, ${0.08 * (1 - frostP)}) 0%, transparent ${frostRadius}%)`,
            zIndex: 10,
          };
        }

        case 'absorb': {
          // Subtle central glow pulse
          if (p < 0.2 || p > 0.7) return null;
          const glowP = (p - 0.2) / 0.5;
          const glowOpacity = Math.sin(glowP * Math.PI) * 0.06;
          return {
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, ${glowOpacity}) 0%, transparent 50%)`,
            zIndex: 10,
          };
        }

        default:
          return null;
      }
    },
    [mode, timing, originPoint],
  );

  // ── Animation loop ──────────────────────────────────────────────

  const tick = useCallback((timestamp: number) => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const p = Math.min(1, elapsed / duration);

    setProgress(p);

    if (p >= 1) {
      setPhase('sealed');
      onSealedRef.current?.();
      return; // Stop the loop
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [duration]);

  // ── Trigger ─────────────────────────────────────────────────────

  const trigger = useCallback((opts?: TriggerOptions) => {
    if (opts?.originX !== undefined && opts?.originY !== undefined) {
      setOriginPoint({ x: opts.originX, y: opts.originY });
    }
    setPhase('sealing');
    setProgress(0);
    startTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // ── Reset ───────────────────────────────────────────────────────

  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setPhase('idle');
    setProgress(0);
    setOriginPoint({ x: 0.5, y: 0.5 });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    phase,
    progress,
    containerStyle: getContainerStyle(progress, phase),
    overlayStyle: getOverlayStyle(progress, phase),
    trigger,
    reset,
  };
}

// ── Utility: Rep counter narrative ────────────────────────────────

/**
 * Generate the cumulative reflection string for a receipt type.
 * Uses the receipt profile's template with real counts.
 *
 * This is the PHYSICS framing:
 * "You have walked this pathway 50 times.
 *  The physical structure of your brain is different today
 *  than it was 60 days ago."
 *
 * NOT gamification. NOT achievements. Physics.
 */
export function formatRepReflection(
  template: string,
  count: number,
  daysSinceFirst: number,
): string {
  return template
    .replace('{count}', String(count))
    .replace('{daysSinceFirst}', String(daysSinceFirst));
}

/**
 * Get the "incomplete" response for a mechanic + heat band.
 * In Red state, ALWAYS silent. No additional cognitive load.
 * In other states, uses the mechanic's defined response.
 */
export function getIncompleteResponse(
  mechanic: { incompleteResponse: 'silent' | 'acknowledge' | 'validate' },
  heatBand: 'green' | 'amber' | 'red',
): string | null {
  if (heatBand === 'red') return null; // Always silent in Red

  switch (mechanic.incompleteResponse) {
    case 'silent':
      return null;
    case 'acknowledge':
      return 'The path is still here.';
    case 'validate':
      return 'Stepping away is the right call sometimes.';
  }
}
