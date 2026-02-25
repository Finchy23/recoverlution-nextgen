/**
 * Practice · Integrate · Metacognition · Embodying
 * 
 * ESSENCE: Thoughts pass through like weather — the body stays steady
 * 
 * VISUAL: Thought fragments drift past while a central stillness point
 * remains. User holds center. Thoughts auto-dissolve. Pure witnessing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha, radius } from '@/design-tokens';

type Stage = 'dormant' | 'witnessing' | 'still' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Practice_Integrate_Metacognition_E({
  primary_prompt, cta_primary, onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.poetic_precision;
  const [stage, setStage] = useState<Stage>('dormant');
  const [clouds, setClouds] = useState<{ id: number; y: number; speed: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const cloudRef = useRef<NodeJS.Timeout | null>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => { if (cloudRef.current) clearInterval(cloudRef.current); timersRef.current.forEach(clearTimeout); }; }, []);

  const handleTap = () => {
    if (stage !== 'dormant') return;
    setStage('witnessing');
    cloudRef.current = setInterval(() => {
      setClouds(prev => [...prev.slice(-6), {
        id: Date.now(), y: 15 + Math.random() * 70, speed: 3 + Math.random() * 3,
      }]);
    }, 1000);
    safeTimeout(() => {
      if (cloudRef.current) clearInterval(cloudRef.current);
      setStage('still');
      safeTimeout(() => { setStage('complete'); onComplete?.(); }, 1800);
    }, 8000);
  };

  if (!mounted) return null;

  return (
    <div style={{
      width: '100%', maxWidth: '600px', margin: '0 auto', padding: spacing.xl,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xl,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ ...navicueTypography.contemplative.primary, textAlign: 'center' }}
      >{primary_prompt}</motion.div>

      <motion.div
        onClick={handleTap}
        style={{
          position: 'relative', width: '280px', height: '280px',
          cursor: stage === 'dormant' ? 'pointer' : 'default',
          overflow: 'hidden', borderRadius: '50%',
          border: `1.5px solid ${withAlpha(sig.colors.primary, 0.20)}`,
        }}
      >
        {/* Passing thought clouds */}
        <AnimatePresence>
          {clouds.map(cloud => (
            <motion.div
              key={cloud.id}
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 360, opacity: [0, 0.25, 0.25, 0] }}
              transition={{ duration: cloud.speed, ease: 'linear' }}
              onAnimationComplete={() => setClouds(prev => prev.filter(c => c.id !== cloud.id))}
              style={{
                position: 'absolute', top: `${cloud.y}%`,
                width: '60px', height: '20px', borderRadius: radius.md,
                background: withAlpha(sig.colors.primary, 0.08),
                pointerEvents: 'none',
              }}
            />
          ))}
        </AnimatePresence>

        {/* Center stillness point */}
        <motion.div
          animate={{
            scale: stage === 'still' || stage === 'complete' ? [1, 1.05, 1] : 1,
            opacity: stage === 'dormant' ? 0.4 : 0.9,
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '16px', height: '16px', borderRadius: '50%',
            backgroundColor: sig.colors.accent,
            boxShadow: `0 0 20px ${sig.colors.glow}`,
          }}
        />

        {/* Stillness rings */}
        {(stage === 'still' || stage === 'complete') && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.15, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: `1px solid ${sig.colors.accent}`,
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      <motion.div animate={{ opacity: 0.5 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center', fontStyle: 'italic' }}>
        {stage === 'dormant' && 'Tap to begin witnessing'}
        {stage === 'witnessing' && 'Thoughts pass... you remain'}
        {(stage === 'still' || stage === 'complete') && 'Stillness'}
      </motion.div>
    </div>
  );
}