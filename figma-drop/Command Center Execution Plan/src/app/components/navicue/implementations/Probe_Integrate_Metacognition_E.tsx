/**
 * Probe · Integrate · Metacognition · Embodying
 * ESSENCE: The inquiry becomes the answer — awareness IS the depth
 * VISUAL: A single point of awareness that expands into encompassing clarity.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { magicSignatures, navicueTypography, spacing } from '@/design-tokens';

interface NaviCueProps { primary_prompt: string; cta_primary: string; onComplete?: () => void; }

export default function Probe_Integrate_Metacognition_E({ primary_prompt, cta_primary, onComplete }: NaviCueProps) {
  const sig = magicSignatures.poetic_precision;
  const [stage, setStage] = useState<'dormant' | 'expanding' | 'complete'>('dormant');
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); }, []);

  const handleTap = () => {
    if (stage !== 'dormant') return;
    setStage('expanding');
    safeTimeout(() => { setStage('complete'); onComplete?.(); }, 3000);
  };

  if (!mounted) return null;

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: spacing.xl, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xl }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ ...navicueTypography.contemplative.primary, textAlign: 'center' }}>{primary_prompt}</motion.div>

      <motion.div onClick={handleTap}
        style={{ position: 'relative', width: '260px', height: '260px', cursor: stage === 'dormant' ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Expanding awareness field */}
        <motion.div animate={{
          width: stage === 'expanding' ? '240px' : stage === 'complete' ? '260px' : '30px',
          height: stage === 'expanding' ? '240px' : stage === 'complete' ? '260px' : '30px',
          opacity: stage === 'dormant' ? 0.5 : 0.15,
        }} transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ borderRadius: '50%', border: `1px solid ${sig.colors.accent}`, position: 'absolute' }} />
        
        {/* Middle ring */}
        <motion.div animate={{
          width: stage === 'expanding' ? '160px' : stage === 'complete' ? '180px' : '20px',
          height: stage === 'expanding' ? '160px' : stage === 'complete' ? '180px' : '20px',
          opacity: stage === 'dormant' ? 0.3 : 0.2,
        }} transition={{ duration: 2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ borderRadius: '50%', border: `1px solid ${sig.colors.primary}`, position: 'absolute' }} />

        {/* Center point (always present) */}
        <motion.div animate={{ scale: stage === 'complete' ? [1, 1.1, 1] : 1, opacity: stage === 'dormant' ? 0.6 : 0.9 }}
          transition={{ duration: 2, repeat: stage === 'complete' ? Infinity : 0 }}
          style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: sig.colors.accent, boxShadow: `0 0 15px ${sig.colors.glow}` }} />
      </motion.div>

      <motion.div animate={{ opacity: 0.5 }} style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center', fontStyle: 'italic' }}>
        {stage === 'dormant' ? 'Tap to look closer' : stage === 'expanding' ? 'Something opens…' : 'The question is the answer'}
      </motion.div>
    </div>
  );
}