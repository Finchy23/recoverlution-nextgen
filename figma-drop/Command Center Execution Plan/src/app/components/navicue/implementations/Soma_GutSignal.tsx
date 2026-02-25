/**
 * SOMA #2 — The Gut Signal
 * "Your stomach knew before your brain did."
 * ARCHETYPE: Pattern E (Hold) — Hold hand on stomach, feel the knowing
 * ENTRY: Cold Open — "Your stomach already answered."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Soma_GutSignal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const tension = hold.tension;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your stomach already answered. Place your hand on your belly. Hold. Let the second brain speak first.
            </div>
            <motion.div
              animate={{ scale: [1, 1.03, 1], opacity: [0.04 + tension * 0.06, 0.06 + tension * 0.08, 0.04 + tension * 0.06] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                width: `${100 + tension * 30}px`, height: `${80 + tension * 20}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.08 + tension * 0.1, 6)}, transparent)`,
                transition: 'width 0.5s, height 0.5s',
              }} />
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              padding: '14px 28px', borderRadius: radius.full,
              background: themeColor(TH.primaryHSL, 0.05 + tension * 0.05, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06 + tension * 0.08, 5)}`,
            }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {hold.completed ? 'received' : hold.isHolding ? 'listening\u2026' : 'hold to listen'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The enteric nervous system. 500 million neurons line your gut: more than your spinal cord. It processes information independently, sending signals upward long before your prefrontal cortex deliberates. Your body knew. It always knows.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Gut.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}