/**
 * THRESHOLD #9 — The Hinge Point
 * "Every before has an after. Find the pivot."
 * ARCHETYPE: Pattern A (Tap) — Tap to find the exact pivot between before and after
 * ENTRY: Instruction-as-poetry — the words themselves become the hinge
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'active' | 'resonant' | 'afterglow';

const PIVOTS = ['the moment you knew', 'the word you couldn\u2019t unsay', 'the door that closed', 'the silence that changed everything'];

export default function Threshold_HingePoint({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const [pivotIdx, setPivotIdx] = useState(0);
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const handleTap = () => {
    if (stage !== 'active') return;
    const next = taps + 1;
    setTaps(next);
    if (next % 3 === 0 && pivotIdx < PIVOTS.length - 1) setPivotIdx(i => i + 1);
    if (next >= 10) {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    }
  };

  const progress = Math.min(1, taps / 10);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Every before has an after. Tap to locate the hinge. The exact instant everything pivoted.
            </motion.div>
            <motion.div key={pivotIdx} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ duration: 0.6 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}>
              {PIVOTS[pivotIdx]}
            </motion.div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div key={i}
                  animate={{ opacity: i < taps ? 0.6 : 0.08 }}
                  style={{
                    width: '3px', height: i === Math.floor(taps / 2) ? '24px' : '12px',
                    borderRadius: '1px',
                    background: themeColor(TH.accentHSL, i < taps ? 0.15 : 0.05, 5),
                    transition: 'height 0.3s',
                  }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.96 }} onClick={handleTap}
              style={{
                padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05 + progress * 0.04, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06 + progress * 0.05, 5)}`,
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to find the pivot</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Bifurcation points. In chaos theory, these are moments when a system could go either way. Looking back, they seem inevitable. But standing on them? Pure openness. You are always standing on one.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Pivoting.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}