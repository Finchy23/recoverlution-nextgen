/**
 * Mirror · Integrate · Values Clarification · Believing
 * 
 * ESSENCE: The mirror shows your compass — what matters becomes visible
 * 
 * VISUAL: A mirror with a compass rose that aligns as user taps
 * directional points. Each tap reveals a value facet reflected
 * back. Grounded, purposeful, anchoring.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

type Stage = 'dormant' | 'aligning' | 'anchored' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

const VALUE_POINTS = [
  { label: 'Truth', angle: 0 },
  { label: 'Care', angle: 90 },
  { label: 'Growth', angle: 180 },
  { label: 'Courage', angle: 270 },
];

export default function Mirror_Integrate_ValuesClarification_B({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('dormant');
  const [activatedPoints, setActivatedPoints] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => timersRef.current.forEach(clearTimeout); }, []);

  const handlePointTap = (index: number) => {
    if (stage === 'anchored' || stage === 'complete') return;
    if (stage === 'dormant') setStage('aligning');
    if (!activatedPoints.includes(index)) {
      const next = [...activatedPoints, index];
      setActivatedPoints(next);
      if (next.length >= 3) {
        safeTimeout(() => setStage('anchored'), 600);
        safeTimeout(() => { setStage('complete'); onComplete?.(); }, 2200);
      }
    }
  };

  if (!mounted) return null;

  const cx = 130, cy = 170, radius = 90;

  return (
    <div style={{
      width: '100%', maxWidth: '600px', margin: '0 auto', padding: spacing.xl,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xl,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ ...navicueTypography.contemplative.primary, textAlign: 'center' }}
      >
        {primary_prompt}
      </motion.div>

      {/* Mirror with compass rose */}
      <div style={{
        position: 'relative', width: '260px', height: '340px',
        borderRadius: '50% 50% 8px 8px',
        border: `3px solid ${sig.colors.primary}`,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${sig.colors.glow}, ${withAlpha(sig.colors.secondary, 0.13)})`,
      }}>
        <svg width="260" height="340" viewBox="0 0 260 340"
          style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Compass circle */}
          <circle cx={cx} cy={cy} r={radius} fill="none"
            stroke={sig.colors.primary} strokeWidth="1" opacity={0.3} />
          <circle cx={cx} cy={cy} r={radius * 0.6} fill="none"
            stroke={sig.colors.primary} strokeWidth="0.5" opacity={0.2} />

          {/* Compass cardinal lines */}
          {VALUE_POINTS.map((point, i) => {
            const rad = (point.angle - 90) * (Math.PI / 180);
            const x1 = cx + Math.cos(rad) * (radius * 0.3);
            const y1 = cy + Math.sin(rad) * (radius * 0.3);
            const x2 = cx + Math.cos(rad) * radius;
            const y2 = cy + Math.sin(rad) * radius;
            const isActive = activatedPoints.includes(i);

            return (
              <g key={i}>
                <motion.line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isActive ? sig.colors.accent : sig.colors.primary}
                  strokeWidth={isActive ? 2 : 1}
                  animate={{ opacity: isActive ? 0.9 : 0.3 }}
                  transition={{ duration: 0.4 }}
                />
              </g>
            );
          })}

          {/* Needle that rotates to activated direction */}
          <motion.line
            x1={cx} y1={cy}
            x2={cx} y2={cy - radius * 0.5}
            stroke={sig.colors.accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{
              rotate: activatedPoints.length > 0
                ? VALUE_POINTS[activatedPoints[activatedPoints.length - 1]].angle
                : 0,
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* Center dot */}
          <circle cx={cx} cy={cy} r={4} fill={sig.colors.primary} />
        </svg>

        {/* Tap targets for each value */}
        {VALUE_POINTS.map((point, i) => {
          const rad = (point.angle - 90) * (Math.PI / 180);
          const x = cx + Math.cos(rad) * (radius + 4);
          const y = cy + Math.sin(rad) * (radius + 4);
          const isActive = activatedPoints.includes(i);

          return (
            <motion.div
              key={i}
              onClick={() => handlePointTap(i)}
              animate={{
                scale: isActive ? 1.15 : 1,
                opacity: isActive ? 1 : 0.6,
              }}
              style={{
                position: 'absolute',
                left: `${x - 28}px`, top: `${y - 14}px`,
                width: '56px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: stage === 'anchored' || stage === 'complete' ? 'default' : 'pointer',
                fontSize: navicueType.caption.fontSize, fontFamily: navicueTypography.contemplative.whisper.fontFamily,
                color: isActive ? sig.colors.accent : sig.colors.primary,
                fontWeight: isActive ? 600 : 400,
                userSelect: 'none',
              }}
            >
              {point.label}
            </motion.div>
          );
        })}

        {/* Anchor glow when complete */}
        <AnimatePresence>
          {(stage === 'anchored' || stage === 'complete') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100px', height: '100px', borderRadius: '50%',
                background: `radial-gradient(circle, ${sig.colors.glow}, transparent)`,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {stage === 'dormant' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
          style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
          Tap the values that call to you
        </motion.div>
      )}

      <AnimatePresence>
        {stage === 'complete' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={sig.motion.entry}
            style={{
              ...navicueTypography.ui.button, padding: '12px 32px',
              backgroundColor: sig.colors.primary, color: 'rgba(0, 0, 0, 0.9)',
              border: 'none', borderRadius: radius.sm, cursor: 'pointer',
            }}
          >
            {cta_primary}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}