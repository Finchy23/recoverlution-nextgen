/**
 * Parts Rollcall · Integrate · Metacognition · Embodying
 * 
 * ESSENCE: Become the awareness that holds all voices — not any single one
 * 
 * VISUAL: All thought bubbles float into a single observatory sphere.
 * The observer IS the container. Metacognition embodied = awareness
 * holding all parts without identifying with any.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { radius } from '@/design-tokens';

type Stage = 'dormant' | 'absorbing' | 'holding' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function PartsRollcall_Integrate_Metacognition_E({
  primary_prompt, cta_primary, onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.poetic_precision;
  const [stage, setStage] = useState<Stage>('dormant');
  const [absorbed, setAbsorbed] = useState(0);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); }, []);

  const handleTap = () => {
    if (stage !== 'dormant') return;
    setStage('absorbing');
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setAbsorbed(count);
      if (count >= 4) {
        clearInterval(interval);
        setStage('holding');
        safeTimeout(() => { setStage('complete'); onComplete?.(); }, 2000);
      }
    }, 800);
  };

  if (!mounted) return null;

  const voices = ['"Be careful"', '"Not enough"', '"I want..."', '"What if..."'];

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
          position: 'relative', width: '300px', height: '300px',
          cursor: stage === 'dormant' ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Floating voice fragments */}
        {voices.map((voice, i) => {
          const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
          const isAbsorbed = i < absorbed;
          return (
            <motion.div
              key={i}
              animate={{
                x: isAbsorbed ? 0 : Math.cos(angle) * 100,
                y: isAbsorbed ? 0 : Math.sin(angle) * 100,
                opacity: isAbsorbed ? 0 : 0.6,
                scale: isAbsorbed ? 0.2 : 1,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                padding: '6px 12px', borderRadius: radius.md,
                border: `1px solid ${sig.colors.primary}`,
                backgroundColor: withAlpha(sig.colors.primary, 0.03),
                fontSize: navicueType.caption.fontSize, fontStyle: 'italic',
                color: sig.colors.primary, whiteSpace: 'nowrap',
                fontFamily: navicueTypography.contemplative.whisper.fontFamily,
              }}
            >
              {voice}
            </motion.div>
          );
        })}

        {/* Observatory sphere */}
        <motion.div
          animate={{
            width: stage === 'holding' || stage === 'complete' ? '120px' : '60px',
            height: stage === 'holding' || stage === 'complete' ? '120px' : '60px',
            borderWidth: stage === 'holding' || stage === 'complete' ? '3px' : '1.5px',
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            borderRadius: '50%',
            borderStyle: 'solid',
            borderColor: sig.colors.accent,
            background: `radial-gradient(circle, ${sig.colors.glow}, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Inner eye */}
          <motion.div
            animate={{
              scale: stage === 'holding' || stage === 'complete' ? 1 : 0.8,
              opacity: absorbed > 0 ? 0.8 : 0.3,
            }}
            style={{
              width: '20px', height: '20px', borderRadius: '50%',
              backgroundColor: sig.colors.accent,
            }}
          />
        </motion.div>

        {/* Breathing pulse when holding all */}
        {(stage === 'holding' || stage === 'complete') && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              position: 'absolute',
              width: '120px', height: '120px', borderRadius: '50%',
              border: `1px solid ${sig.colors.accent}`,
            }}
          />
        )}
      </motion.div>

      <motion.div animate={{ opacity: 0.5 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center', fontStyle: 'italic' }}>
        {stage === 'dormant' && 'Tap to gather them'}
        {stage === 'absorbing' && 'Gathering…'}
        {(stage === 'holding' || stage === 'complete') && 'You hold them all'}
      </motion.div>
    </div>
  );
}