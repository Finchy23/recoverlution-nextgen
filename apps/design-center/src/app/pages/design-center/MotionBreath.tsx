/**
 * MOTION BREATH
 * ═════════════
 * Breath pattern playground + motion curve visualizer.
 * Renders inside MotionLab's LabShell — no section wrapper needed.
 *
 * DEPENDENCIES:
 *   - useBreathEngine (shared hook — canonical breath engine)
 *   - dc-tokens (SIGNATURE_PALETTES, glass, sectionAccents)
 *   - design-tokens (colors, fonts, surfaces, motion)
 *
 * COLOR DERIVATION:
 *   calm    → poetic-precision palette (purple light)
 *   box     → neural-reset palette (cyan)
 *   simple  → motion section accent (warm amber)
 *   energize → quiet-authority palette (green)
 */

import { useState, useEffect, useRef } from 'react';
import { motion as motionLib, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, motion as motionTokens } from '@/design-tokens';
import { getSignaturePalette, sectionAccents, glass } from './dc-tokens';
import { useBreathEngine, type BreathPattern } from './hooks/useBreathEngine';

// ─── Breath Pattern Definitions ─────────────────────────────
// Phase timings live in useBreathEngine. Here we define the
// metadata and visual identity for each pattern, derived from tokens.

const poeticPrecision = getSignaturePalette('poetic-precision')!;
const neuralReset = getSignaturePalette('neural-reset')!;
const quietAuthority = getSignaturePalette('quiet-authority')!;

interface BreathPatternDef {
  id: BreathPattern;
  name: string;
  rhythm: string;
  essence: string;
  /** Phase labels for timeline visualization */
  phases: { name: string; durationSec: number; label: string }[];
  /** Accent color (mid opacity) for particles/glow */
  accent: string;
  /** Low-opacity glow for ambient backgrounds */
  glow: string;
  /** Solid primary color for orb core */
  primary: string;
}

const BREATH_PATTERNS: BreathPatternDef[] = [
  {
    id: 'calm',
    name: 'Calm',
    rhythm: '4 - 7 - 8',
    essence: 'The parasympathetic reset. Exhale twice the inhale.',
    phases: [
      { name: 'inhale', durationSec: 4, label: 'in' },
      { name: 'hold', durationSec: 7, label: 'hold' },
      { name: 'exhale', durationSec: 8, label: 'out' },
    ],
    accent: poeticPrecision.accent,
    glow: poeticPrecision.glow,
    primary: poeticPrecision.primary,
  },
  {
    id: 'box',
    name: 'Box',
    rhythm: '4 - 4 - 4 - 4',
    essence: 'Equal sides. The nervous system finds its center.',
    phases: [
      { name: 'inhale', durationSec: 4, label: 'in' },
      { name: 'hold', durationSec: 4, label: 'hold' },
      { name: 'exhale', durationSec: 4, label: 'out' },
      { name: 'rest', durationSec: 4, label: 'rest' },
    ],
    accent: neuralReset.accent,
    glow: neuralReset.glow,
    primary: neuralReset.primary,
  },
  {
    id: 'simple',
    name: 'Simple',
    rhythm: '4 - 4',
    essence: 'Morning priming. Clear and bright.',
    phases: [
      { name: 'inhale', durationSec: 4, label: 'in' },
      { name: 'exhale', durationSec: 4, label: 'out' },
    ],
    accent: `rgba(255, 182, 119, 0.4)`, // motion amber — no signature match, derived from sectionAccents.motion
    glow: `rgba(255, 182, 119, 0.12)`,
    primary: sectionAccents.motion,
  },
  {
    id: 'energize',
    name: 'Energize',
    rhythm: '2 - 1 - 2 - 1',
    essence: 'Short, rhythmic. The body wakes.',
    phases: [
      { name: 'inhale', durationSec: 2, label: 'in' },
      { name: 'hold', durationSec: 1, label: 'hold' },
      { name: 'exhale', durationSec: 2, label: 'out' },
      { name: 'rest', durationSec: 1, label: 'rest' },
    ],
    accent: quietAuthority.accent,
    glow: quietAuthority.glow,
    primary: quietAuthority.primary,
  },
];

// ─── Motion Curves (derived from design-tokens.motion) ──────

interface MotionCurve {
  name: string;
  /** Control points for cubic-bezier */
  cubic: number[];
  description: string;
  duration: string;
  /** Token path reference */
  tokenRef: string;
}

const MOTION_CURVES: MotionCurve[] = [
  {
    name: 'arrival',
    cubic: [0.16, 1, 0.3, 1],
    description: 'How things appear. Generous deceleration.',
    duration: '800ms',
    tokenRef: 'motion.easing.default',
  },
  {
    name: 'departure',
    cubic: [0.7, 0, 0.84, 0],
    description: 'How things leave. Quick, clean, no lingering.',
    duration: motionTokens.duration.slow,
    tokenRef: 'motion.duration.slow',
  },
  {
    name: 'spring',
    cubic: [0.22, 1, 0.36, 1],
    description: 'The living feel. 2px overshoot on land.',
    duration: motionTokens.duration.slower,
    tokenRef: 'motion.easing.spring',
  },
  {
    name: 'breath',
    cubic: [0.37, 0, 0.63, 1],
    description: 'Sine-based. How the pulse syncs.',
    duration: 'continuous',
    tokenRef: 'useBreathEngine',
  },
];

// ─── Curve Visualizer ───────────────────────────────────────

function CurveVisualizer({ curve, index }: { curve: MotionCurve; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = 8;

    ctx.clearRect(0, 0, w, h);

    // Grid lines — using glass.subtle opacity
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad + ((h - pad * 2) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
      ctx.stroke();
    }

    // Curve — using brand purple
    ctx.strokeStyle = `${colors.brand.purple.primary}80`; // 50% opacity
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const [x1, y1, x2, y2] = curve.cubic;
    const steps = 60;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = 3 * x1;
      const bx = 3 * (x2 - x1) - cx;
      const ax = 1 - cx - bx;
      const cy = 3 * y1;
      const by = 3 * (y2 - y1) - cy;
      const ay = 1 - cy - by;

      const px = ((ax * t + bx) * t + cx) * t;
      const py = ((ay * t + by) * t + cy) * t;

      const screenX = pad + px * (w - pad * 2);
      const screenY = h - pad - py * (h - pad * 2);

      if (i === 0) ctx.moveTo(screenX, screenY);
      else ctx.lineTo(screenX, screenY);
    }

    ctx.stroke();
  }, [curve]);

  return (
    <motionLib.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}
    >
      <canvas
        ref={canvasRef}
        width={120}
        height={80}
        style={{ borderRadius: 12, background: surfaces.glass.subtle }}
      />
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.neutral.white,
            opacity: 0.4,
            letterSpacing: '0.04em',
          }}
        >
          {curve.name}
        </div>
        <div
          style={{
            fontFamily: fonts.primary,
            fontSize: 11,
            color: colors.neutral.white,
            opacity: 0.2,
            marginTop: 4,
            lineHeight: 1.4,
            maxWidth: 120,
          }}
        >
          {curve.description}
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 8,
            color: colors.neutral.white,
            opacity: 0.1,
            marginTop: 4,
            letterSpacing: '0.03em',
          }}
        >
          {curve.tokenRef}
        </div>
      </div>
    </motionLib.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────

export function MotionBreath() {
  const [activePattern, setActivePattern] = useState(0);
  const pattern = BREATH_PATTERNS[activePattern];
  const { amplitude, phase } = useBreathEngine(pattern.id);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow synced to breath */}
      <motionLib.div
        animate={{
          scale: 0.8 + amplitude * 0.4,
          opacity: 0.03 + amplitude * 0.06,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${pattern.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Pattern selector */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 56,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {BREATH_PATTERNS.map((p, i) => (
          <motionLib.button
            key={p.id}
            onClick={() => setActivePattern(i)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: i === activePattern ? surfaces.glass.light : 'rgba(0,0,0,0)',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 18px',
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.4s ease',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: p.primary,
                opacity: i === activePattern ? 1 : 0.3,
                transition: 'opacity 0.3s ease',
              }}
            />
            <span
              style={{
                fontFamily: fonts.primary,
                fontSize: 13,
                color: colors.neutral.white,
                opacity: i === activePattern ? 0.8 : 0.3,
                transition: 'opacity 0.3s ease',
              }}
            >
              {p.name}
            </span>
          </motionLib.button>
        ))}
      </div>

      {/* The breathing orb */}
      <div
        style={{
          position: 'relative',
          width: 240,
          height: 240,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 48,
        }}
      >
        {/* Outer ring */}
        <motionLib.div
          animate={{ scale: 0.7 + amplitude * 0.5, opacity: 0.05 + amplitude * 0.15 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${pattern.accent} 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
        {/* Mid ring */}
        <motionLib.div
          animate={{ scale: 0.6 + amplitude * 0.6, opacity: 0.1 + amplitude * 0.3 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${pattern.accent} 0%, transparent 60%)`,
          }}
        />
        {/* Core orb */}
        <motionLib.div
          animate={{ scale: 0.5 + amplitude * 0.5, opacity: 0.4 + amplitude * 0.5 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: pattern.primary,
            boxShadow: `0 0 ${20 + amplitude * 30}px ${pattern.accent}`,
          }}
        />
        {/* Glass border ring */}
        <motionLib.div
          animate={{ scale: 0.75 + amplitude * 0.25, opacity: 0.06 + amplitude * 0.08 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            border: `1px solid ${glass.borderActive}`,
          }}
        />
        {/* Phase label */}
        <AnimatePresence mode="wait">
          <motionLib.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              bottom: -8,
              fontFamily: fonts.mono,
              fontSize: 9,
              color: colors.neutral.white,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
            }}
          >
            {phase}
          </motionLib.div>
        </AnimatePresence>
      </div>

      {/* Pattern detail */}
      <AnimatePresence mode="wait">
        <motionLib.div
          key={pattern.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 320, marginBottom: 80 }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 14,
              color: colors.neutral.white,
              opacity: 0.5,
              letterSpacing: '0.1em',
              marginBottom: 12,
            }}
          >
            {pattern.rhythm}
          </div>
          <div
            style={{
              fontFamily: fonts.primary,
              fontSize: 13,
              color: colors.neutral.white,
              opacity: 0.3,
              lineHeight: 1.6,
            }}
          >
            {pattern.essence}
          </div>

          {/* Phase timeline */}
          <div
            style={{
              display: 'flex',
              gap: 2,
              marginTop: 24,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {pattern.phases.map((p, i) => {
              const totalSec = pattern.phases.reduce((s, ph) => s + ph.durationSec, 0);
              const widthPx = (p.durationSec / totalSec) * 200;
              const isActive = p.name === 'inhale' || p.name === 'exhale';
              return (
                <div
                  key={`${pattern.id}-${i}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                >
                  <div
                    style={{
                      width: widthPx,
                      height: 3,
                      borderRadius: 2,
                      background: pattern.primary,
                      opacity: isActive ? 0.5 : 0.15,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 8,
                      color: colors.neutral.white,
                      opacity: 0.2,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motionLib.div>
      </AnimatePresence>

      {/* Motion curves */}
      <div style={{ maxWidth: 600, width: '100%' }}>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            color: colors.neutral.white,
            opacity: 0.2,
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          motion curves
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 32,
          }}
        >
          {MOTION_CURVES.map((curve, i) => (
            <CurveVisualizer key={curve.name} curve={curve} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
