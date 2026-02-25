/**
 * Mirror · Integrate · Exposure · Embodying
 * 
 * ESSENCE: Stay with the reflection — feel it move through you
 * 
 * VISUAL: The mirror becomes a window. What was avoided now flows
 * like water through the frame. User breathes with the rhythm.
 * E deepens B: not just seeing, but absorbing the avoided truth.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

type Stage = 'dormant' | 'flowing' | 'absorbing' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Mirror_Integrate_Exposure_E({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('dormant');
  const [breathCount, setBreathCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMounted(true); return () => { timersRef.current.forEach(clearTimeout); if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

  const handleBegin = () => {
    if (stage !== 'dormant') return;
    setStage('flowing');
    // Auto-progress through 3 breaths
    let count = 0;
    intervalRef.current = setInterval(() => {
      count++;
      setBreathCount(count);
      if (count >= 3) {
        clearInterval(intervalRef.current!);
        setStage('absorbing');
        safeTimeout(() => { setStage('complete'); onComplete?.(); }, 1600);
      }
    }, 2800);
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

      {/* Mirror-window with flowing water */}
      <motion.div
        onClick={handleBegin}
        style={{
          position: 'relative', width: '280px', height: '380px',
          borderRadius: radius.md, overflow: 'hidden',
          border: `3px solid ${sig.colors.primary}`,
          cursor: stage === 'dormant' ? 'pointer' : 'default',
        }}
      >
        {/* Water flow background */}
        <motion.div
          animate={{
            backgroundPositionY: stage !== 'dormant' ? ['0%', '100%'] : '0%',
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: `linear-gradient(180deg, 
              ${sig.colors.glow} 0%, 
              ${withAlpha(sig.colors.secondary, 0.27)} 25%, 
              ${withAlpha(sig.colors.primary, 0.20)} 50%, 
              ${withAlpha(sig.colors.secondary, 0.27)} 75%, 
              ${sig.colors.glow} 100%)`,
            backgroundSize: '100% 200%',
          }}
        />

        {/* Breath-synced pulse ring */}
        {(stage === 'flowing' || stage === 'absorbing') && (
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.15, 0.4],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px', height: '120px', borderRadius: '50%',
              border: `2px solid ${sig.colors.accent}`,
            }}
          />
        )}

        {/* Central truth text that emerges */}
        <motion.div
          animate={{
            opacity: stage === 'dormant' ? 0.2 : stage === 'complete' ? 0.9 : 0.5 + breathCount * 0.15,
          }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', color: sig.colors.primary,
            fontSize: navicueType.afterglow.fontSize, fontFamily: navicueTypography.contemplative.whisper.fontFamily,
            fontStyle: 'italic', lineHeight: 1.8, maxWidth: '180px',
          }}
        >
          Let it flow through{'\n'}not around{'\n'}you
        </motion.div>

        {/* Absorption glow from bottom */}
        <AnimatePresence>
          {stage === 'absorbing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                background: `linear-gradient(to top, ${sig.colors.glow}, transparent)`,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Breath counter */}
      {stage === 'flowing' && (
        <motion.div
          key={breathCount}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          style={{ ...navicueTypography.contemplative.whisper, color: sig.colors.accent }}
        >
          {breathCount < 3 ? `Breath ${breathCount + 1}...` : 'Absorbed'}
        </motion.div>
      )}

      {stage === 'dormant' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
          style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
          Tap to begin flowing
        </motion.div>
      )}
    </div>
  );
}