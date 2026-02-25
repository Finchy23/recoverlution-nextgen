/**
 * THRESHOLD #4 — The Breath Gap
 * "The pause at the top. Everything lives here."
 * ARCHETYPE: Pattern E (Hold) — Hold at the peak of inhale, in the gap before exhale
 * ENTRY: Instruction-as-poetry — the first words ARE the breathing cue
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Threshold_BreathGap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 8000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const tension = hold.tension;
  const orbSize = 60 + tension * 80;
  const orbAlpha = 0.03 + tension * 0.08;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.3 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Breathe in. Now {','} don{'\u2019'}t breathe out yet. Stay at the top. Hold that full moment. Everything lives in this gap between in and out.
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.02, 1], opacity: [orbAlpha, orbAlpha + 0.02, orbAlpha] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: `${orbSize}px`, height: `${orbSize}px`, borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, orbAlpha + 0.04, 6)}, transparent)`,
                transition: 'width 0.4s, height 0.4s',
              }} />
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              padding: '14px 28px', borderRadius: radius.full,
              background: themeColor(TH.primaryHSL, 0.05 + tension * 0.05, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06 + tension * 0.06, 5)}`,
            }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {hold.completed ? 'full' : hold.isHolding ? 'holding\u2026' : 'hold at the top'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The respiratory pause. Between inhale and exhale is a micro-death {':'} a moment when the diaphragm is suspended, the vagus nerve signals safety, and time genuinely slows. You just visited the gap where presence lives.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Suspended.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}