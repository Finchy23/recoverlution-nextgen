/**
 * Parts Rollcall · Integrate · Exposure · Believing
 * 
 * ESSENCE: Each part names what it's been avoiding — gentle exposure inventory
 * 
 * VISUAL: Parts appear as veiled orbs. Tap each to reveal the hidden
 * thing it carries. Threshold/doorway aesthetic. Safe boundary maintained.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

type Stage = 'veiled' | 'revealing' | 'exposed' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

const PARTS = [
  { name: 'The Avoider', hidden: 'Fear of being seen', color: 'hsla(195, 60%, 60%, 0.7)' },
  { name: 'The Hider', hidden: 'Shame about needing help', color: 'hsla(195, 50%, 50%, 0.6)' },
  { name: 'The Denier', hidden: 'Grief not yet felt', color: 'hsla(195, 40%, 55%, 0.6)' },
  { name: 'The Minimizer', hidden: 'Pain that matters', color: 'hsla(195, 55%, 52%, 0.6)' },
];

export default function PartsRollcall_Integrate_Exposure_B({
  primary_prompt, cta_primary, onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('veiled');
  const [revealed, setRevealed] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => timersRef.current.forEach(clearTimeout); }, []);

  const handlePartTap = (index: number) => {
    if (stage === 'complete') return;
    if (stage === 'veiled') setStage('revealing');
    if (!revealed.includes(index)) {
      const next = [...revealed, index];
      setRevealed(next);
      if (next.length >= PARTS.length) {
        safeTimeout(() => setStage('exposed'), 600);
        safeTimeout(() => { setStage('complete'); onComplete?.(); }, 2200);
      }
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
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ ...navicueTypography.contemplative.primary, textAlign: 'center' }}
      >{primary_prompt}</motion.div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '280px',
      }}>
        {PARTS.map((part, i) => {
          const isRevealed = revealed.includes(i);
          return (
            <motion.div
              key={part.name}
              onClick={() => handlePartTap(i)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              style={{
                position: 'relative', height: '120px', borderRadius: radius.md,
                overflow: 'hidden', cursor: 'pointer',
                border: `2px solid ${isRevealed ? part.color : sig.colors.primary}`,
                background: isRevealed
                  ? `linear-gradient(135deg, ${withAlpha(part.color, 0.13)}, ${withAlpha(part.color, 0.27)})`
                  : withAlpha(sig.colors.primary, 0.07),
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', transition: 'all 0.4s ease',
              }}
            >
              {/* Veil */}
              <motion.div
                animate={{ opacity: isRevealed ? 0 : 0.6 }}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: withAlpha(sig.colors.secondary, 0.53),
                  pointerEvents: 'none',
                }}
              />
              <div style={{
                fontSize: navicueType.caption.fontSize, fontWeight: 600, color: sig.colors.primary,
                fontFamily: navicueTypography.contemplative.whisper.fontFamily,
                opacity: isRevealed ? 0.9 : 0.5, zIndex: 1,
              }}>
                {part.name}
              </div>
              <AnimatePresence>
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    style={{
                      fontSize: navicueType.status.fontSize, fontStyle: 'italic', textAlign: 'center',
                      color: part.color, lineHeight: 1.4, zIndex: 1,
                      fontFamily: navicueTypography.contemplative.whisper.fontFamily,
                    }}
                  >
                    {part.hidden}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <motion.div animate={{ opacity: 0.5 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
        {stage === 'veiled' && 'Tap each part to reveal what it holds'}
        {stage === 'revealing' && 'Looking\u2026'}
        {(stage === 'exposed' || stage === 'complete') && 'All seen. All safe.'}
      </motion.div>
    </div>
  );
}