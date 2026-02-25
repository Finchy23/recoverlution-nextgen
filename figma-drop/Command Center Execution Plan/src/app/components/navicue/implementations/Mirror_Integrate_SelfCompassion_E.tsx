/**
 * Mirror · Integrate · Self-Compassion · Embodying
 * 
 * ESSENCE: The kindness IS you now — the mirror reflects warmth as identity
 * 
 * VISUAL: The mirror frame itself becomes warm, pulsing with user's
 * breath rhythm. The reflection radiates outward. Embodying = the
 * compassion isn't directed AT you, it emanates FROM you.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

type Stage = 'dormant' | 'warming' | 'radiating' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Mirror_Integrate_SelfCompassion_E({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('dormant');
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => timersRef.current.forEach(clearTimeout); }, []);

  const handleTap = () => {
    if (stage !== 'dormant') return;
    setStage('warming');
    safeTimeout(() => setStage('radiating'), 1600);
    safeTimeout(() => { setStage('complete'); onComplete?.(); }, 3400);
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
          position: 'relative', width: '280px', height: '360px',
          cursor: stage === 'dormant' ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Radiating warmth rings */}
        {(stage === 'radiating' || stage === 'complete') && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: '120px', height: '120px', borderRadius: '50%',
                  border: `1px solid ${sig.colors.accent}`,
                }}
              />
            ))}
          </>
        )}

        {/* Mirror frame with warming border */}
        <motion.div
          animate={{
            borderColor: stage === 'dormant' ? sig.colors.primary : sig.colors.accent,
            boxShadow: stage === 'radiating' || stage === 'complete'
              ? `0 0 40px ${sig.colors.glow}, inset 0 0 30px ${sig.colors.glow}`
              : stage === 'warming'
              ? `0 0 20px ${sig.colors.glow}`
              : 'none',
          }}
          transition={{ duration: 1 }}
          style={{
            width: '240px', height: '320px',
            borderRadius: '50% 50% 12px 12px',
            border: `4px solid ${sig.colors.primary}`,
            position: 'relative', overflow: 'hidden',
            background: `linear-gradient(180deg, ${sig.colors.glow}, ${withAlpha(sig.colors.secondary, 0.13)})`,
          }}
        >
          {/* Central radiance */}
          <motion.div
            animate={{
              scale: stage === 'radiating' || stage === 'complete' ? [1, 1.1, 1] : 1,
              opacity: stage === 'dormant' ? 0.2 : stage === 'warming' ? 0.5 : 0.8,
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '40%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100px', height: '100px', borderRadius: '50%',
              background: `radial-gradient(circle, ${withAlpha(sig.colors.accent, 0.53)}, ${sig.colors.glow}, transparent)`,
            }}
          />

          {/* Warmth emanation lines */}
          {(stage === 'radiating' || stage === 'complete') && (
            <svg width="240" height="320" viewBox="0 0 240 320"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const cx = 120, cy = 140;
                const r1 = 50, r2 = 90;
                return (
                  <motion.line
                    key={i}
                    x1={cx + Math.cos(angle) * r1}
                    y1={cy + Math.sin(angle) * r1}
                    x2={cx + Math.cos(angle) * r2}
                    y2={cy + Math.sin(angle) * r2}
                    stroke={sig.colors.accent}
                    strokeWidth="1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                  />
                );
              })}
            </svg>
          )}

          {/* Inner text */}
          <motion.div
            animate={{ opacity: stage === 'dormant' ? 0.3 : 0.8 }}
            style={{
              position: 'absolute', bottom: '18%', left: '50%',
              transform: 'translateX(-50%)', textAlign: 'center',
              fontSize: navicueType.afterglow.fontSize, fontFamily: navicueTypography.contemplative.whisper.fontFamily,
              fontStyle: 'italic', color: sig.colors.primary, maxWidth: '180px', lineHeight: 1.7,
            }}
          >
            {stage === 'dormant' ? 'Touch to awaken' : 'Warmth begins here'}
          </motion.div>
        </motion.div>
      </motion.div>

      {stage === 'dormant' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
          style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
          Tap to feel the warmth
        </motion.div>
      )}
    </div>
  );
}