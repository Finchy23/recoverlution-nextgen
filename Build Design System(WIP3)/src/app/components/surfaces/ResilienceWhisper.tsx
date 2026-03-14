/**
 * RESILIENCE WHISPER — Warm Degradation Indicator
 *
 * A subtle, beautiful indicator that appears when the organism
 * is in a degraded state. Never a red error banner — always
 * a warm whisper that feels intentional, like a candle in fog.
 *
 * Rule: Degrade into beauty, not into failure screens.
 *
 * Postures:
 *   'full'      — invisible (everything works)
 *   'degraded'  — soft amber dot + whisper label
 *   'offline'   — gentle breathing dot + "offline" murmur
 *   'reduced'   — no indicator (user chose this)
 *   'low-power' — faint dot, no animation
 */

import { motion, AnimatePresence } from 'motion/react';
import type { ResiliencePosture } from '../runtime/resilience-seam';
import {
  room, font, typeSize, tracking, weight, opacity, timing,
  glow, radii, layer, void_,
} from '../design-system/surface-tokens';

// ─── Posture Visual Config ───

interface PostureVisual {
  color: string;
  label: string;
  breathe: boolean;
  glowAlpha: string;
}

const POSTURE_VISUALS: Record<ResiliencePosture, PostureVisual | null> = {
  full: null,       // invisible
  reduced: null,    // user preference, don't indicate
  degraded: {
    color: '#c4956a',     // warm amber
    label: 'partial',
    breathe: true,
    glowAlpha: '12',
  },
  offline: {
    color: '#8b7d9a',     // soft violet-grey
    label: 'offline',
    breathe: true,
    glowAlpha: '15',
  },
  'low-power': {
    color: '#7a8b7d',     // muted sage
    label: 'conserving',
    breathe: false,
    glowAlpha: '08',
  },
};

// ─── Component ───

interface ResilienceWhisperProps {
  posture: ResiliencePosture;
  breath: number;
  /** Optional: name of the runtime that's down */
  runtimeName?: string;
  /** Position variant */
  position?: 'top-right' | 'top-left' | 'bottom-right';
}

export function ResilienceWhisper({
  posture,
  breath,
  runtimeName,
  position = 'top-right',
}: ResilienceWhisperProps) {
  const visual = POSTURE_VISUALS[posture];

  // Position styles
  const positionStyle: React.CSSProperties = {
    'top-right':    { top: 10, right: 10 },
    'top-left':     { top: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  }[position];

  return (
    <AnimatePresence>
      {visual && (
        <motion.div
          className="absolute pointer-events-none flex items-center gap-2"
          style={{
            ...positionStyle,
            zIndex: layer.float,
            padding: '5px 10px',
            borderRadius: radii.frameInner,
            background: void_.shroud,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Breathing dot */}
          <div
            className="rounded-full"
            style={{
              width: 4 + (visual.breathe ? Math.sin(breath * Math.PI * 2) * 0.6 : 0),
              height: 4 + (visual.breathe ? Math.sin(breath * Math.PI * 2) * 0.6 : 0),
              background: visual.color,
              opacity: opacity.gentle,
              boxShadow: glow.warm(visual.color, visual.glowAlpha),
              transition: visual.breathe ? timing.t.fadeSlow : 'none',
              flexShrink: 0,
            }}
          />

          {/* Label */}
          <span
            style={{
              fontFamily: font.sans,
              fontSize: typeSize.trace,
              fontWeight: weight.medium,
              letterSpacing: tracking.normal,
              textTransform: 'uppercase',
              color: visual.color,
              opacity: opacity.murmur,
              whiteSpace: 'nowrap',
            }}
          >
            {runtimeName ? `${runtimeName} ${visual.label}` : visual.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
