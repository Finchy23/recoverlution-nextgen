/**
 * THRESHOLD #2 — The In-Between
 * "Neither this nor that. Both."
 * ARCHETYPE: Pattern A (Tap) — Tap to toggle states, realize you're always between
 * ENTRY: Cold Open — two words appear immediately, user caught mid-paradox
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'active' | 'resonant' | 'afterglow';

const PAIRS = [['here', 'there'], ['before', 'after'], ['yes', 'no'], ['awake', 'asleep']];

export default function Threshold_InBetween({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const [pairIdx, setPairIdx] = useState(0);
  const [side, setSide] = useState(0);
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const handleTap = () => {
    if (stage !== 'active') return;
    setSide(s => 1 - s);
    const next = taps + 1;
    setTaps(next);
    if (next % 4 === 0 && pairIdx < PAIRS.length - 1) setPairIdx(i => i + 1);
    if (next >= 12) {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    }
  };

  const pair = PAIRS[pairIdx];
  const progress = Math.min(1, taps / 12);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <motion.div animate={{ opacity: side === 0 ? 0.8 : 0.15 }} transition={{ duration: 0.4 }}
                style={{ ...navicueType.prompt, color: palette.text }}>{pair[0]}</motion.div>
              <div style={{ width: '1px', height: '40px', background: themeColor(TH.accentHSL, 0.08 + progress * 0.1, 5) }} />
              <motion.div animate={{ opacity: side === 1 ? 0.8 : 0.15 }} transition={{ duration: 0.4 }}
                style={{ ...navicueType.prompt, color: palette.text }}>{pair[1]}</motion.div>
            </div>
            <motion.div animate={{ opacity: 0.15 + progress * 0.3 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              Neither this nor that. Both.
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }} onClick={handleTap}
              style={{
                padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to toggle</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You kept switching but never arrived. That{'\u2019'}s because {'\u201c'}between{'\u201d'} isn{'\u2019'}t a failure to choose. It{'\u2019'}s its own location. The liminal is not a bug in consciousness {';'} it{'\u2019'}s a feature.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Both.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}