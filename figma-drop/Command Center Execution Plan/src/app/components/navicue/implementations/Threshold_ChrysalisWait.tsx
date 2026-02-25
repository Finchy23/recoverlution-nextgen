/**
 * THRESHOLD #5 — The Chrysalis Wait
 * "Not yet. Not yet. Not yet."
 * ARCHETYPE: Pattern A (Tap) — Tap to resist emerging, learning patience in transformation
 * ENTRY: Reverse Reveal — starts with "you emerged" then rewinds to the waiting
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function Threshold_ChrysalisWait({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const [waits, setWaits] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const handleWait = () => {
    if (stage !== 'active') return;
    const next = waits + 1;
    setWaits(next);
    if (next >= 8) {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    }
  };

  const progress = Math.min(1, waits / 8);
  const shellOpacity = 0.04 + progress * 0.1;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 2.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', opacity: 0.5 }}>
              You emerged.
            </div>
            <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 0 }} transition={{ delay: 1, duration: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>wait {','} not yet</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are not ready. That is the practice. Each {'\u201c'}not yet{'\u201d'} is building something you cannot see. Tap to wait longer.
            </div>
            <motion.div
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                width: `${80 + progress * 40}px`, height: `${100 + progress * 30}px`,
                borderRadius: '45% 45% 40% 40%',
                background: themeColor(TH.accentHSL, shellOpacity, 5),
                border: `1px solid ${themeColor(TH.accentHSL, shellOpacity * 0.8, 3)}`,
                transition: 'width 0.5s, height 0.5s',
              }} />
            <motion.div whileTap={{ scale: 0.96 }} onClick={handleWait}
              style={{
                padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {progress >= 1 ? 'ready' : 'not yet'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Metamorphosis requires stillness. The caterpillar doesn{'\u2019'}t push through the chrysalis {';'} it dissolves completely first. Your willingness to wait is not passivity. It is the most active form of transformation.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Dissolving.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}