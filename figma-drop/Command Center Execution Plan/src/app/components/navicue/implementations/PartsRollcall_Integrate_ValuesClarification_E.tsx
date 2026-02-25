/**
 * Parts Rollcall · Integrate · Values Clarification · Embodying
 * 
 * ESSENCE: All parts orient to the same north — values become compass felt in the body
 * 
 * VISUAL: A unified compass needle surrounded by subtle part-colored
 * threads. All pointing the same direction. The body becomes the compass.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { magicSignatures, navicueTypography, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

type Stage = 'dormant' | 'spinning' | 'oriented' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function PartsRollcall_Integrate_ValuesClarification_E({
  primary_prompt, cta_primary, onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('dormant');
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => timersRef.current.forEach(clearTimeout); }, []);

  const handleTap = () => {
    if (stage !== 'dormant') return;
    setStage('spinning');
    safeTimeout(() => setStage('oriented'), 2400);
    safeTimeout(() => { setStage('complete'); onComplete?.(); }, 3800);
  };

  if (!mounted) return null;

  const threadColors = [
    'hsla(25, 80%, 60%, 0.4)',
    'hsla(210, 50%, 55%, 0.4)',
    'hsla(280, 50%, 65%, 0.4)',
    'hsla(45, 70%, 65%, 0.4)',
    'hsla(150, 50%, 55%, 0.4)',
  ];

  return (
    <div style={{
      width: '100%', maxWidth: '600px', margin: '0 auto', padding: spacing.xl,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xl,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ ...navicueTypography.contemplative.primary, textAlign: 'center' }}
      >{primary_prompt}</motion.div>

      <motion.div
        onClick={handleTap}
        style={{
          position: 'relative', width: '280px', height: '280px',
          cursor: stage === 'dormant' ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Compass ring */}
        <svg width="280" height="280" viewBox="0 0 280 280"
          style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx="140" cy="140" r="120" fill="none"
            stroke={sig.colors.primary} strokeWidth="1" opacity={0.2} />
          <circle cx="140" cy="140" r="80" fill="none"
            stroke={sig.colors.primary} strokeWidth="0.5" opacity={0.15} />

          {/* Thread needles from parts */}
          {threadColors.map((color, i) => {
            const scatteredAngle = (i / threadColors.length) * 360 - 90;
            const alignedAngle = -90; // All point north when aligned
            const currentAngle = stage === 'dormant' ? scatteredAngle
              : stage === 'spinning'
              ? scatteredAngle + (alignedAngle - scatteredAngle) * 0.7
              : alignedAngle;
            const rad = (currentAngle) * (Math.PI / 180);
            const r = 70;

            return (
              <motion.line
                key={i}
                animate={{
                  x2: 140 + Math.cos(rad) * r,
                  y2: 140 + Math.sin(rad) * r,
                }}
                transition={{ duration: 1.2, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                x1={140} y1={140}
                x2={140 + Math.cos((scatteredAngle * Math.PI) / 180) * r}
                y2={140 + Math.sin((scatteredAngle * Math.PI) / 180) * r}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Main needle (stronger) */}
          <motion.line
            initial={{ opacity: 0.3 }}
            animate={{
              x2: stage === 'oriented' || stage === 'complete' ? 140 : 140,
              y2: stage === 'oriented' || stage === 'complete' ? 40 : 80,
              opacity: stage === 'dormant' ? 0.3 : 0.9,
            }}
            transition={{ duration: 0.8 }}
            x1={140} y1={140} x2={140} y2={80}
            stroke={sig.colors.accent}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Center point */}
          <circle cx={140} cy={140} r={5} fill={sig.colors.primary} />
        </svg>

        {/* North label */}
        <motion.div
          animate={{
            opacity: stage === 'oriented' || stage === 'complete' ? 0.8 : 0.3,
            y: stage === 'oriented' || stage === 'complete' ? -125 : -120,
          }}
          style={{
            position: 'absolute',
            fontSize: navicueType.caption.fontSize, fontWeight: 600, letterSpacing: '0.1em',
            color: sig.colors.accent,
            fontFamily: navicueTypography.contemplative.whisper.fontFamily,
          }}
        >
          TRUE NORTH
        </motion.div>
      </motion.div>

      <motion.div animate={{ opacity: 0.5 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center', fontStyle: 'italic' }}>
        {stage === 'dormant' && 'Tap to align all parts'}
        {stage === 'spinning' && 'Finding north...'}
        {(stage === 'oriented' || stage === 'complete') && 'All parts face the same direction'}
      </motion.div>
    </div>
  );
}