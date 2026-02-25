/**
 * ENGINEER #4 — The Batch Process
 * "Switching costs kill productivity. Group the tasks."
 * Pattern A (Tap) — Batch scattered items
 * STEALTH KBE: Grouping tasks = Cognitive Efficiency (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'scattered' | 'batched' | 'resonant' | 'afterglow';

export default function Engineer_BatchProcess({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('scattered'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const batch = () => {
    if (stage !== 'scattered') return;
    console.log(`[KBE:K] BatchProcess cognitiveEfficiency=confirmed switchingCostReduction=true`);
    setStage('batched');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ x: [-3, 3], y: [-2, 2] }}
                transition={{ duration: 0.5 + i * 0.2, repeat: Infinity, repeatType: 'reverse' }}
                style={{ width: '8px', height: '5px', borderRadius: '1px',
                  background: themeColor(TH.primaryHSL, 0.04, 2), display: 'inline-block', margin: '0 2px' }} />
            ))}
          </motion.div>
        )}
        {stage === 'scattered' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Scattered emails flying everywhere. Chaos. Swipe to batch them. Process once.
            </div>
            <div style={{ position: 'relative', width: '100px', height: '60px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                  animate={{ x: [(-20 + i * 10), (-15 + i * 8)], y: [(i * 8 - 16), (i * 6 - 10)], rotate: [-5 + i * 3, 5 - i * 2] }}
                  transition={{ duration: 1 + i * 0.3, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ position: 'absolute', width: '30px', height: '16px', borderRadius: '2px',
                    background: themeColor(TH.primaryHSL, 0.03 + i * 0.005, 1),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={batch}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Batch ▤</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'batched' && (
          <motion.div key="ba" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Batched. One neat stack. Process once. Switching costs kill productivity — every time you shift context (email → code → email → meeting), your brain needs 15-25 minutes to refocus. Group the tasks. Do all the laundry at once. Do all the emails at once. Batch processing is how factories work. Your brain is a factory.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive switching costs. Gloria Mark (UC Irvine): after an interruption, it takes an average of 23 minutes and 15 seconds to return to the original task. "Multitasking" is a myth — what actually occurs is rapid context-switching, each switch incurring a cognitive penalty. Batch processing eliminates these penalties by grouping similar tasks into single processing windows. Cal Newport{"'"}s "time blocking" is batch processing for knowledge work.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Batched.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}