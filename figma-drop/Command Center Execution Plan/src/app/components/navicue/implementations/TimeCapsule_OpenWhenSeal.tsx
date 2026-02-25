/**
 * TIME CAPSULE #1 — The "Open When" Seal
 * "Store this strength. You will need it later."
 * ARCHETYPE: Pattern E (Hold) — Press to seal the envelope with wax
 * ENTRY: Cold Open — "SEAL" appears, then the wax envelope materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPill } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function TimeCapsule_OpenWhenSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 4000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const waxProgress = hold.tension;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ fontSize: '28px', fontFamily: 'serif', letterSpacing: '0.25em', color: palette.text, textAlign: 'center' }}>
            SEAL
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              You are strong right now. Store this strength. Label this envelope for a future self who will need it, and press the seal.
            </div>
            <svg width="180" height="200" viewBox="0 0 180 200">
              {/* Envelope body */}
              <rect x="20" y="60" width="140" height="110" rx="4" fill={themeColor(TH.primaryHSL, 0.08, 8)}
                stroke={themeColor(TH.accentHSL, 0.15, 5)} strokeWidth="0.5" />
              {/* Envelope flap */}
              <polygon points="20,60 90,20 160,60" fill={themeColor(TH.primaryHSL, 0.1, 10)}
                stroke={themeColor(TH.accentHSL, 0.12, 5)} strokeWidth="0.5" />
              {/* Wax seal circle — grows with hold */}
              <motion.circle cx="90" cy="120" r={8 + waxProgress * 16}
                fill={themeColor(TH.accentHSL, 0.12 + waxProgress * 0.4, 5)}
                animate={{ scale: hold.isHolding ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 200 }} />
              {/* Seal monogram */}
              {waxProgress > 0.5 && (
                <motion.text x="90" y="124" fontSize="10" fontFamily="serif" textAnchor="middle"
                  fill={themeColor(TH.primaryHSL, waxProgress - 0.3, 15)}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  W
                </motion.text>
              )}
            </svg>
            <div
              {...hold.holdProps}
              style={{
                ...hold.holdProps.style,
                ...immersiveHoldPill(palette).base(waxProgress),
              }}>
              <div style={immersiveHoldPill(palette).label}>
                {hold.completed ? 'sealed' : hold.isHolding ? 'sealing\u2026' : 'hold to seal'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Sealed. The strength is stored. When the winter comes and you can{'\u2019'}t remember ever feeling this way, this envelope will be waiting. You wrote it when you still believed.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Stored for later.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}