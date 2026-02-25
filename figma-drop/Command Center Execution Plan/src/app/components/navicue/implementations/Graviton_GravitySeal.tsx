/**
 * GRAVITON #10 — The Gravity Seal
 * "I am here."
 * ARCHETYPE: Pattern E (Hold) — Feel the weight in your palm
 * ENTRY: Ambient Fade — sphere + declaration arrive together
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'ambient' | 'resonant' | 'afterglow';

export default function Graviton_GravitySeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => () => T.current.forEach(clearTimeout), []);
  const h = hold.tension;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are not a leaf in the wind. You are the planet. The wind moves around you.
            </div>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, width: '120px', height: '120px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: themeColor(TH.accentHSL, 0.08 + h * 0.15, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06 + h * 0.1, 15)}`,
                boxShadow: h > 0.3 ? `0 ${4 + h * 8}px ${10 + h * 15}px ${themeColor(TH.voidHSL, 0.3, 0)}` : 'none' }}>
              <motion.div animate={{ scale: 1 + h * 0.1 }}
                style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em',
                  color: themeColor(TH.accentHSL, 0.15 + h * 0.2, 20) }}>
                {h > 0.9 ? 'ANCHORED' : h > 0.5 ? 'HEAVY' : h > 0.1 ? 'HOLDING' : 'IRON'}
              </motion.div>
            </div>
            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
                {hold.isHolding ? 'feel the weight...' : 'hold the iron'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Embodied cognition. Physical sensations of weight unconsciously prime the brain for seriousness, importance, and stability. You held the iron. You are here.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>I am here.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}