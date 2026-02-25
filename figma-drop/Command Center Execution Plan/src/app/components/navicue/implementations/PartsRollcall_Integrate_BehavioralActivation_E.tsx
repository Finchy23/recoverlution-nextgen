/**
 * Parts Rollcall · Integrate · Behavioral Activation · Embodying
 * 
 * ESSENCE: All parts move as one — the Doer carries the team forward
 * 
 * VISUAL: Parts orbs now orbit and merge into a unified formation.
 * Where B was acknowledging each part separately, E is the felt
 * sense of all parts moving together in coordinated action.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing } from '@/design-tokens';

type Stage = 'scattered' | 'converging' | 'unified' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

const PARTS = [
  { name: 'The one who acts', color: 'hsla(25, 80%, 60%, 0.8)' },
  { name: 'The one who watches', color: 'hsla(210, 50%, 55%, 0.7)' },
  { name: 'The one who imagines', color: 'hsla(280, 50%, 65%, 0.7)' },
  { name: 'The one who questions', color: 'hsla(0, 40%, 55%, 0.6)' },
  { name: 'The one who feels', color: 'hsla(45, 70%, 65%, 0.7)' },
];

export default function PartsRollcall_Integrate_BehavioralActivation_E({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('scattered');
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => timersRef.current.forEach(clearTimeout); }, []);

  const handleTap = () => {
    if (stage !== 'scattered') return;
    setStage('converging');
    safeTimeout(() => setStage('unified'), 2000);
    safeTimeout(() => { setStage('complete'); onComplete?.(); }, 3600);
  };

  if (!mounted) return null;

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

      <motion.div
        onClick={handleTap}
        style={{
          position: 'relative', width: '300px', height: '300px',
          cursor: stage === 'scattered' ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Part orbs that converge */}
        {PARTS.map((part, i) => {
          const angle = (i / PARTS.length) * Math.PI * 2 - Math.PI / 2;
          const scatteredR = 110;
          const convergedR = 25;
          const targetR = stage === 'scattered' ? scatteredR : stage === 'converging' ? convergedR : 0;
          const x = Math.cos(angle) * targetR;
          const y = Math.sin(angle) * targetR;

          return (
            <motion.div
              key={part.name}
              animate={{
                x, y,
                scale: stage === 'unified' || stage === 'complete' ? 0.5 : 1,
                opacity: stage === 'unified' || stage === 'complete' ? 0.3 : 0.8,
              }}
              transition={{ duration: 1.2, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                width: '30px', height: '30px', borderRadius: '50%',
                backgroundColor: part.color,
                border: `1px solid ${part.color}`,
              }}
            />
          );
        })}

        {/* Unified formation (appears after convergence) */}
        <AnimatePresence>
          {(stage === 'unified' || stage === 'complete') && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: `conic-gradient(${PARTS.map((p, i) => `${p.color} ${i * 72}deg ${(i + 1) * 72}deg`).join(', ')})`,
                border: `2px solid ${sig.colors.accent}`,
                boxShadow: `0 0 30px ${sig.colors.glow}`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Forward arrow (unified team in motion) */}
        <AnimatePresence>
          {(stage === 'unified' || stage === 'complete') && (
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 0.6, x: [0, 15, 0] }}
              transition={{ x: { duration: 1.5, repeat: Infinity }, opacity: { duration: 0.4 } }}
              style={{
                position: 'absolute', top: '50%', right: '20%',
                transform: 'translateY(-50%)',
                width: 0, height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderLeft: `20px solid ${sig.colors.accent}`,
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div animate={{ opacity: 0.6 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
        {stage === 'scattered' && 'Tap to bring them together'}
        {stage === 'converging' && 'Gathering…'}
        {(stage === 'unified' || stage === 'complete') && 'Moving as one'}
      </motion.div>
    </div>
  );
}