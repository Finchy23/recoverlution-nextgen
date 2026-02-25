/**
 * Mirror · Integrate · Exposure · Believing
 * 
 * ESSENCE: See what you've been avoiding — the mirror holds it safely
 * 
 * VISUAL: A veiled mirror that gradually clears as user holds gaze.
 * Exposure = threshold/doorway. Mirror shows the avoided thing
 * with compassionate framing. The fog lifts, the truth becomes visible.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha, radius } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

type Stage = 'veiled' | 'clearing' | 'revealed' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Mirror_Integrate_Exposure_B({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('veiled');
  const [fogOpacity, setFogOpacity] = useState(1);
  const holdRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => { timersRef.current.forEach(clearTimeout); if (holdRef.current) clearInterval(holdRef.current); }; }, []);

  const startHold = () => {
    if (stage !== 'veiled') return;
    setStage('clearing');
    let progress = 1;
    holdRef.current = setInterval(() => {
      progress -= 0.02;
      setFogOpacity(Math.max(0, progress));
      if (progress <= 0) {
        clearInterval(holdRef.current!);
        setStage('revealed');
        safeTimeout(() => { setStage('complete'); onComplete?.(); }, 1400);
      }
    }, 40);
  };

  const stopHold = () => {
    if (holdRef.current) clearInterval(holdRef.current);
    if (stage === 'clearing') {
      setStage('veiled');
      setFogOpacity(1);
    }
  };

  useEffect(() => () => { if (holdRef.current) clearInterval(holdRef.current); }, []);

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

      {/* Mirror with fog overlay */}
      <div
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        style={{
          position: 'relative', width: '280px', height: '360px',
          borderRadius: `${radius.full} ${radius.full} ${radius.md} ${radius.md}`,
          border: `4px solid ${sig.colors.primary}`,
          overflow: 'hidden', cursor: stage === 'veiled' || stage === 'clearing' ? 'pointer' : 'default',
          background: `linear-gradient(180deg, ${sig.colors.glow}, ${withAlpha(sig.colors.secondary, 0.20)})`,
        }}
      >
        {/* Reflected truth beneath */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', color: sig.colors.primary, fontSize: navicueType.texture.fontSize,
          fontFamily: navicueTypography.contemplative.whisper.fontFamily,
          fontStyle: 'italic', opacity: stage === 'revealed' || stage === 'complete' ? 0.9 : 0.4,
          transition: 'opacity 0.6s ease', lineHeight: 1.6, maxWidth: '200px',
        }}>
          What you avoid{'\n'}also waits for you{'\n'}with open hands
        </div>

        {/* Fog layer */}
        <motion.div
          animate={{ opacity: fogOpacity }}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(ellipse at center, ${withAlpha(sig.colors.secondary, 0.93)} ${fogOpacity * 60}%, ${withAlpha(sig.colors.primary, 0.80)})`,
            pointerEvents: 'none',
          }}
        />

        {/* Subtle breathing fog texture */}
        <motion.div
          animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%',
            background: `radial-gradient(circle at 30% 40%, ${sig.colors.glow}, transparent 50%)`,
            opacity: fogOpacity * 0.5, pointerEvents: 'none',
          }}
        />

        {/* Clearing progress indicator */}
        {stage === 'clearing' && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: fogOpacity }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
              backgroundColor: sig.colors.accent, transformOrigin: 'left',
            }}
          />
        )}
      </div>

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

      {stage === 'veiled' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
          style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
          Hold to clear the fog
        </motion.div>
      )}
    </div>
  );
}