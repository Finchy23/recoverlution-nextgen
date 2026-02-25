/**
 * Probe · Integrate · Behavioral Activation · Embodying
 * 
 * ESSENCE: The insight rises to the surface — depth becomes movement
 * 
 * VISUAL: From the core, energy radiates outward. What was excavated
 * now powers forward motion. Depth becomes fuel. Kinetic upwelling.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { magicSignatures, navicueTypography, spacing } from '@/design-tokens';

type Stage = 'dormant' | 'building' | 'erupting' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Probe_Integrate_BehavioralActivation_E({
  primary_prompt, cta_primary, onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('dormant');
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => timersRef.current.forEach(clearTimeout); }, []);

  const handleTap = () => {
    if (stage !== 'dormant') return;
    setStage('building');
    safeTimeout(() => setStage('erupting'), 2000);
    safeTimeout(() => { setStage('complete'); onComplete?.(); }, 3600);
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
          position: 'relative', width: '260px', height: '300px',
          cursor: stage === 'dormant' ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Depth layers */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: stage === 'dormant' ? 0.3 : stage === 'building' ? 0.15 : 0.05,
              y: stage === 'erupting' || stage === 'complete' ? -20 - i * 10 : 0,
            }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            style={{
              position: 'absolute', bottom: `${i * 15}%`,
              width: '100%', height: '3px',
              backgroundColor: sig.colors.primary,
            }}
          />
        ))}

        {/* Rising energy column */}
        <motion.div
          animate={{
            height: stage === 'dormant' ? '20px'
              : stage === 'building' ? '200px'
              : '300px',
            opacity: stage === 'dormant' ? 0.3 : 0.6,
          }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute', bottom: 0,
            width: '4px',
            background: `linear-gradient(to top, ${sig.colors.accent}, ${sig.colors.glow}, transparent)`,
          }}
        />

        {/* Core orb that rises */}
        <motion.div
          animate={{
            y: stage === 'dormant' ? 100
              : stage === 'building' ? 0
              : -60,
            scale: stage === 'erupting' || stage === 'complete' ? 1.5 : 1,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '30px', height: '30px', borderRadius: '50%',
            backgroundColor: sig.colors.accent,
            boxShadow: `0 0 20px ${sig.colors.glow}`,
          }}
        />

        {/* Eruption sparks */}
        {(stage === 'erupting' || stage === 'complete') && (
          <>
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              return (
                <motion.div
                  key={i}
                  animate={{
                    x: [0, Math.cos(angle) * 80],
                    y: [-60, -60 + Math.sin(angle) * 80],
                    opacity: [0.6, 0],
                  }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                  style={{
                    position: 'absolute',
                    width: '4px', height: '4px', borderRadius: '50%',
                    backgroundColor: sig.colors.accent,
                  }}
                />
              );
            })}
          </>
        )}
      </motion.div>

      <motion.div animate={{ opacity: 0.5 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
        {stage === 'dormant' && 'Tap to release what was found'}
        {stage === 'building' && 'Rising...'}
        {(stage === 'erupting' || stage === 'complete') && 'Depth becomes motion'}
      </motion.div>
    </div>
  );
}