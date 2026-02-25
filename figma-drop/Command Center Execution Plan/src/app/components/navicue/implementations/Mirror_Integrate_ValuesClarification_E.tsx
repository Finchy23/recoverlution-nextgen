/**
 * Mirror · Integrate · Values Clarification · Embodying
 * 
 * ESSENCE: Your compass IS your reflection — values move through you
 * 
 * VISUAL: The compass from B now orbits around the user's center.
 * Values aren't external reference points — they are the mirror itself.
 * The frame becomes the compass. Embodied orientation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

type Stage = 'still' | 'orbiting' | 'integrated' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Mirror_Integrate_ValuesClarification_E({
  primary_prompt,
  cta_primary,
  onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('still');
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); return () => timersRef.current.forEach(clearTimeout); }, []);

  const handleTap = () => {
    if (stage !== 'still') return;
    setStage('orbiting');
    safeTimeout(() => setStage('integrated'), 2800);
    safeTimeout(() => { setStage('complete'); onComplete?.(); }, 4200);
  };

  if (!mounted) return null;

  const values = ['Truth', 'Care', 'Growth', 'Courage', 'Purpose'];

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
          position: 'relative', width: '300px', height: '300px',
          cursor: stage === 'still' ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Orbiting value labels */}
        {values.map((value, i) => {
          const baseAngle = (i / values.length) * 360;
          const orbitRadius = stage === 'integrated' || stage === 'complete' ? 0 : 110;

          return (
            <motion.div
              key={value}
              animate={{
                rotate: stage === 'orbiting' ? [baseAngle, baseAngle + 360] : baseAngle,
                opacity: stage === 'integrated' || stage === 'complete' ? 0 : stage === 'orbiting' ? 0.8 : 0.4,
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 0.8 },
              }}
              style={{
                position: 'absolute',
                width: '300px', height: '300px',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <motion.span
                animate={{
                  rotate: stage === 'orbiting' ? [-baseAngle, -(baseAngle + 360)] : -baseAngle,
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{
                  fontSize: navicueType.hint.fontSize, fontFamily: navicueTypography.contemplative.whisper.fontFamily,
                  color: sig.colors.accent, fontWeight: 500,
                  marginTop: `${150 - orbitRadius}px`,
                }}
              >
                {value}
              </motion.span>
            </motion.div>
          );
        })}

        {/* Central mirror that absorbs values */}
        <motion.div
          animate={{
            width: stage === 'integrated' || stage === 'complete' ? '180px' : '80px',
            height: stage === 'integrated' || stage === 'complete' ? '180px' : '80px',
            borderRadius: '50%',
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            border: `2px solid ${sig.colors.primary}`,
            background: `radial-gradient(circle, ${sig.colors.glow}, ${withAlpha(sig.colors.secondary, 0.20)})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Integrated values appear inside */}
          <AnimatePresence>
            {(stage === 'integrated' || stage === 'complete') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                  textAlign: 'center', fontSize: navicueType.hint.fontSize,
                  fontFamily: navicueTypography.contemplative.whisper.fontFamily,
                  color: sig.colors.primary, fontStyle: 'italic',
                  lineHeight: 1.8,
                }}
              >
                {values.map(v => (
                  <div key={v} style={{ opacity: 0.7 }}>{v}</div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compass needle (visible before integration) */}
          {stage !== 'integrated' && stage !== 'complete' && (
            <motion.div
              animate={{ rotate: stage === 'orbiting' ? [0, 360] : 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '2px', height: '50px',
                background: `linear-gradient(${sig.colors.accent}, transparent)`,
                transformOrigin: 'bottom center',
              }}
            />
          )}
        </motion.div>

        {/* Orbit ring */}
        <motion.div
          animate={{
            opacity: stage === 'integrated' || stage === 'complete' ? 0 : 0.2,
            scale: stage === 'integrated' || stage === 'complete' ? 0.5 : 1,
          }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute',
            width: '220px', height: '220px', borderRadius: '50%',
            border: `1px solid ${sig.colors.primary}`,
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      <AnimatePresence>
        {stage === 'integrated' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center', fontStyle: 'italic' }}
          >
            Your values live here now
          </motion.div>
        )}
      </AnimatePresence>

      {stage === 'still' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
          style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
          Tap to begin the orbit
        </motion.div>
      )}
    </div>
  );
}