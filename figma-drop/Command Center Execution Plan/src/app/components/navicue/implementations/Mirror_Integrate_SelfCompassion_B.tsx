/**
 * Mirror · Integrate · Self-Compassion · Believing
 * 
 * ESSENCE: See yourself with kindness — the mirror softens its gaze
 * 
 * VISUAL: A mirror that initially shows sharp edges, then as user
 * engages, the edges soften, warm glow emerges, embracing arms
 * appear around the reflection. Believing = starting to trust kindness.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha, radius } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

type Stage = 'sharp' | 'softening' | 'embraced' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Mirror_Integrate_SelfCompassion_B({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('sharp');
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => timersRef.current.forEach(clearTimeout); }, []);

  const handleTap = () => {
    if (stage !== 'sharp') return;
    setStage('softening');
    safeTimeout(() => setStage('embraced'), 1400);
    safeTimeout(() => { setStage('complete'); onComplete?.(); }, 3000);
  };

  if (!mounted) return null;

  const borderRadius = stage === 'sharp' ? '4px' : stage === 'softening' ? '40% 40% 8px 8px' : '50% 50% 12px 12px';

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
        layout
        style={{
          position: 'relative', width: '260px', height: '340px',
          borderRadius, transition: 'border-radius 0.8s ease',
          border: `3px solid ${sig.colors.primary}`,
          overflow: 'hidden',
          cursor: stage === 'sharp' ? 'pointer' : 'default',
          background: `linear-gradient(180deg, ${sig.colors.glow}, ${withAlpha(sig.colors.secondary, 0.13)})`,
        }}
      >
        {/* Warm glow that grows */}
        <motion.div
          animate={{
            opacity: stage === 'sharp' ? 0 : stage === 'softening' ? 0.3 : 0.5,
            scale: stage === 'sharp' ? 0.5 : 1,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px', height: '200px', borderRadius: '50%',
            background: `radial-gradient(circle, ${sig.colors.accent}, transparent)`,
            pointerEvents: 'none',
          }}
        />

        {/* Heart symbol (emerges when softening) */}
        <AnimatePresence>
          {(stage === 'softening' || stage === 'embraced' || stage === 'complete') && (
            <motion.svg
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 0.7, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              width="60" height="55" viewBox="0 0 60 55"
              style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)' }}
            >
              <path
                d="M30 50 C30 50 5 35 5 18 C5 8 13 2 22 2 C26 2 30 5 30 5 C30 5 34 2 38 2 C47 2 55 8 55 18 C55 35 30 50 30 50Z"
                fill={sig.colors.primary}
                opacity={0.6}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Embracing arms (appear when fully embraced) */}
        <AnimatePresence>
          {(stage === 'embraced' || stage === 'complete') && (
            <>
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 0.5 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute', left: '10px', top: '45%',
                  width: '50px', height: '120px',
                  borderRadius: `${radius['2xl']} 0 0 ${radius['2xl']}`,
                  border: `2px solid ${sig.colors.accent}`,
                  borderRight: 'none',
                }}
              />
              <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 0.5 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute', right: '10px', top: '45%',
                  width: '50px', height: '120px',
                  borderRadius: `0 ${radius['2xl']} ${radius['2xl']} 0`,
                  border: `2px solid ${sig.colors.accent}`,
                  borderLeft: 'none',
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Reflection text */}
        <motion.div
          animate={{ opacity: stage === 'sharp' ? 0.3 : 0.8 }}
          style={{
            position: 'absolute', bottom: '15%', left: '50%',
            transform: 'translateX(-50%)', textAlign: 'center',
            fontSize: navicueType.hint.fontSize, fontFamily: navicueTypography.contemplative.whisper.fontFamily,
            fontStyle: 'italic', color: sig.colors.primary, maxWidth: '180px', lineHeight: 1.7,
          }}
        >
          {stage === 'sharp' ? 'Tap to soften' : 'You deserve this tenderness'}
        </motion.div>
      </motion.div>

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