/**
 * Practice · Integrate · Values Clarification · Embodying
 * 
 * ESSENCE: Values move through action — the body practices alignment
 * 
 * VISUAL: A compass needle that user physically drags to align with
 * their chosen value. The alignment feels right. Then it locks. Embodied.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { magicSignatures, navicueTypography, spacing } from '@/design-tokens';

type Stage = 'dormant' | 'aligning' | 'locked' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Practice_Integrate_ValuesClarification_E({
  primary_prompt, cta_primary, onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('dormant');
  const [needleAngle, setNeedleAngle] = useState(-45);
  const [mounted, setMounted] = useState(false);
  const targetAngle = 0; // True north

  useEffect(() => { setMounted(true); }, []);

  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  const handleTap = () => {
    if (stage === 'locked' || stage === 'complete') return;
    if (stage === 'dormant') setStage('aligning');
    // Each tap brings needle closer to north
    const diff = targetAngle - needleAngle;
    const step = diff * 0.4;
    const newAngle = needleAngle + step;
    setNeedleAngle(newAngle);
    if (Math.abs(targetAngle - newAngle) < 5) {
      setNeedleAngle(targetAngle);
      setStage('locked');
      safeTimeout(() => { setStage('complete'); onComplete?.(); }, 1800);
    }
  };

  if (!mounted) return null;

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
          position: 'relative', width: '240px', height: '240px',
          cursor: stage === 'locked' || stage === 'complete' ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="240" height="240" viewBox="0 0 240 240">
          {/* Compass outer ring */}
          <circle cx="120" cy="120" r="100" fill="none"
            stroke={sig.colors.primary} strokeWidth="1.5" opacity={0.3} />
          {/* Tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const r1 = 90, r2 = 100;
            return (
              <line key={i}
                x1={120 + Math.cos(angle) * r1}
                y1={120 + Math.sin(angle) * r1}
                x2={120 + Math.cos(angle) * r2}
                y2={120 + Math.sin(angle) * r2}
                stroke={sig.colors.primary} strokeWidth="1" opacity={0.3}
              />
            );
          })}
          {/* North marker */}
          <text x="120" y="30" textAnchor="middle" fill={sig.colors.accent}
            fontSize="12" fontWeight="600" opacity={0.8}>N</text>

          {/* Needle */}
          <motion.g initial={{ rotate: 0 }} animate={{ rotate: needleAngle }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: '120px 120px' }}>
            {/* North half */}
            <polygon points="120,40 115,120 125,120" fill={sig.colors.accent} opacity={0.8} />
            {/* South half */}
            <polygon points="120,200 115,120 125,120" fill={sig.colors.primary} opacity={0.4} />
          </motion.g>

          {/* Center pivot */}
          <circle cx="120" cy="120" r="5" fill={sig.colors.primary} />
        </svg>

        {/* Lock glow */}
        {(stage === 'locked' || stage === 'complete') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px', height: '80px', borderRadius: '50%',
              background: `radial-gradient(circle, ${sig.colors.glow}, transparent)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>

      <motion.div animate={{ opacity: 0.5 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
        {stage === 'dormant' && 'Tap to find true north'}
        {stage === 'aligning' && 'Keep tapping to align...'}
        {(stage === 'locked' || stage === 'complete') && 'Aligned'}
      </motion.div>
    </div>
  );
}