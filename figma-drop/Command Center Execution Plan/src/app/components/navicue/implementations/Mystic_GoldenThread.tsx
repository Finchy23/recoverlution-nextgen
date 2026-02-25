/**
 * MYSTIC #7 — The Golden Thread
 * "Intuition is the thread. Logic is the maze."
 * Pattern A (Tap) — Follow golden thread through maze despite dead ends appearing
 * STEALTH KBE: Following thread despite dead ends = Intuitive Guidance / Intuitive Trust (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'maze' | 'center' | 'resonant' | 'afterglow';

const { palette } = navicueQuickstart('koan_paradox', 'Non-Dual Awareness', 'knowing', 'Practice');
const STEPS = ['Entrance', 'Fork (dead end left)', 'Narrow passage', 'Fork (dead end right)', 'Center'];

export default function Mystic_GoldenThread({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [step, setStep] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('maze'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const follow = () => {
    if (stage !== 'maze') return;
    const next = step + 1;
    if (next >= STEPS.length) {
      console.log(`[KBE:K] GoldenThread intuitiveGuidance=confirmed intuitiveTrust=true`);
      setStage('center');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    } else {
      setStep(next);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 2, repeat: Infinity }}>
              <div style={{ width: '30px', height: '1px', background: themeColor(TH.accentHSL, 0.06, 4) }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'maze' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A maze. You are lost. A golden thread glimmers on the floor. Follow it.
            </div>
            {/* Maze progress */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                    background: i <= step ? themeColor(TH.accentHSL, 0.08 + i * 0.015, 4) : themeColor(TH.primaryHSL, 0.03, 1),
                    border: i === step ? `1px solid ${themeColor(TH.accentHSL, 0.12, 6)}` : 'none' }} />
                  {i < STEPS.length - 1 && (
                    <div style={{ width: '8px', height: '1px',
                      background: i < step ? themeColor(TH.accentHSL, 0.06, 4) : themeColor(TH.primaryHSL, 0.02, 1) }} />
                  )}
                </div>
              ))}
            </div>
            <motion.div key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>{STEPS[step]}</span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={follow}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Follow the Thread</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'center' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The center. The golden thread led you past every dead end. You didn{"'"}t need to solve the maze — you needed to trust the thread. Intuition is not magical thinking. It is pattern recognition below the threshold of consciousness. Logic is the maze — analysis, options, paralysis. Intuition is the thread — quiet, persistent, pointing inward. The way out is always in.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Intuitive intelligence. Gerd Gigerenzer{"'"}s "gut feelings" research: simple heuristics often outperform complex analysis in uncertain environments. The "Ariadne{"'"}s thread" from Greek mythology: Theseus navigated the labyrinth by following a thread, not by mapping the maze. Dual-process theory (Kahneman): System 1 (intuition) processes millions of data points simultaneously; System 2 (analysis) processes serially. In complex environments, trusting the thread is not irrational — it{"'"}s rational at a deeper level.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Found.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}