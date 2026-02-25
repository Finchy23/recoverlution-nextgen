/**
 * Practice · Integrate · Behavioral Activation · Believing
 * 
 * ESSENCE: Do the thing — momentum builds through micro-action
 * 
 * VISUAL: A kinetic launchpad. Tap to fire momentum arrows.
 * Each tap builds speed. Action form = diagonal thrust with impact.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { radius } from '@/design-tokens';

type Stage = 'ready' | 'building' | 'launched' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Practice_Integrate_BehavioralActivation_B({
  primary_prompt, cta_primary, onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('ready');
  const [taps, setTaps] = useState(0);
  const [arrows, setArrows] = useState<{ id: number; y: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const targetTaps = 5;

  useEffect(() => { setMounted(true); }, []);

  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  const handleTap = () => {
    if (stage === 'launched' || stage === 'complete') return;
    if (stage === 'ready') setStage('building');
    const next = taps + 1;
    setTaps(next);
    setArrows(prev => [...prev, { id: Date.now(), y: Math.random() * 60 - 30 }]);
    if (next >= targetTaps) {
      safeTimeout(() => setStage('launched'), 400);
      safeTimeout(() => { setStage('complete'); onComplete?.(); }, 2000);
    }
  };

  if (!mounted) return null;

  const progress = taps / targetTaps;

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
          position: 'relative', width: '300px', height: '200px',
          cursor: stage === 'launched' || stage === 'complete' ? 'default' : 'pointer',
          overflow: 'hidden', borderRadius: radius.md,
          border: `2px solid ${withAlpha(sig.colors.primary, 0.20)}`,
          background: `linear-gradient(135deg, ${withAlpha(sig.colors.glow, 0.13)}, transparent)`,
        }}
      >
        {/* Momentum bar */}
        <motion.div
          animate={{ scaleX: progress }}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
            backgroundColor: sig.colors.accent, transformOrigin: 'left',
          }}
        />

        {/* Flying arrows */}
        <AnimatePresence>
          {arrows.map(arrow => (
            <motion.div
              key={arrow.id}
              initial={{ x: 20, opacity: 0.8 }}
              animate={{ x: 320, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              onAnimationComplete={() => setArrows(prev => prev.filter(a => a.id !== arrow.id))}
              style={{
                position: 'absolute', top: `${50 + arrow.y}%`,
                transform: 'translateY(-50%)',
              }}
            >
              <svg width="30" height="12" viewBox="0 0 30 12">
                <line x1="0" y1="6" x2="22" y2="6" stroke={sig.colors.accent} strokeWidth="2" />
                <polygon points="22,2 30,6 22,10" fill={sig.colors.accent} />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Launch pad orb */}
        <motion.div
          animate={{
            scale: stage === 'launched' || stage === 'complete' ? 0 : 1 + progress * 0.3,
            x: stage === 'launched' ? 300 : 0,
          }}
          transition={{ duration: stage === 'launched' ? 0.4 : 0.2 }}
          style={{
            position: 'absolute', left: '30px', top: '50%',
            transform: 'translateY(-50%)',
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: sig.colors.primary,
            boxShadow: `0 0 ${10 + progress * 20}px ${sig.colors.glow}`,
          }}
        />

        {/* Success burst */}
        <AnimatePresence>
          {(stage === 'launched' || stage === 'complete') && (
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 1.2 }}
              style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: sig.colors.accent,
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div animate={{ opacity: 0.5 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
        {stage === 'ready' && 'Tap to begin'}
        {stage === 'building' && 'Keep going…'}
        {(stage === 'launched' || stage === 'complete') && 'Already moving'}
      </motion.div>
    </div>
  );
}