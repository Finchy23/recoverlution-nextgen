/**
 * THRESHOLD #10 — The Threshold Seal (The Proof)
 * "I am the doorway."
 * ARCHETYPE: Pattern A (Tap) — Identity koan, tap to seal
 * ENTRY: Cold Open — the statement appears immediately
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Threshold_ThresholdSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const handleTap = () => {
    if (stage !== 'active') return;
    const next = taps + 1;
    setTaps(next);
    if (next >= 3) {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    }
  };

  const progress = Math.min(1, taps / 3);
  const ringSize = 100 + progress * 40;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              I am the doorway.
            </div>
            <motion.div
              animate={{ scale: [1, 1.02, 1], opacity: [0.06, 0.1, 0.06] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: `${ringSize}px`, height: `${ringSize}px`, borderRadius: '50%',
                border: `1px solid ${themeColor(TH.accentHSL, 0.08 + progress * 0.1, 6)}`,
                transition: 'width 0.5s, height 0.5s',
              }} />
            <motion.div whileTap={{ scale: 0.96 }} onClick={handleTap}
              style={{
                padding: '14px 32px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05 + progress * 0.04, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {taps === 0 ? 'seal' : taps < 3 ? 'again' : 'sealed'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You are not stuck between things. You are the space that holds them both. The threshold is not where you pass through {';'} it is what you are.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Threshold.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}