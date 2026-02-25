/**
 * ARCHITECT II #9 — The Future Observatory
 * "The future is not random. It is built."
 * Pattern A (Tap) — Adjust telescope focus, see 10-year future self
 * STEALTH KBE: Connecting action to distant goal = Teleological Thinking / Visioning (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Cognitive Structuring', 'believing', 'Circuit');
type Stage = 'arriving' | 'blurry' | 'focused' | 'resonant' | 'afterglow';

const GOALS = ['Build something lasting', 'Deep relationships', 'Creative mastery', 'Inner peace'];

export default function Cognitive_FutureObservatory({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [goal, setGoal] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('blurry'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const focus = (g: string) => {
    if (stage !== 'blurry') return;
    setGoal(g);
    console.log(`[KBE:B] FutureObservatory goal="${g}" teleologicalThinking=confirmed visioning=true`);
    setStage('focused');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '8px', height: '20px', borderRadius: '2px',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'blurry' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A telescope pointing at the stars. Adjust the focus. What do you see 10 years from now?
            </div>
            {/* Telescope view (blurry circle) */}
            <div style={{ width: '70px', height: '70px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `2px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div animate={{ opacity: [0.04, 0.08, 0.04] }}
                transition={{ duration: 2, repeat: Infinity }}>
                <span style={{ fontSize: '11px', color: palette.textFaint, filter: 'blur(1px)' }}>You, 2036</span>
              </motion.div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center', maxWidth: '220px' }}>
              {GOALS.map(g => (
                <motion.div key={g} whileTap={{ scale: 0.9 }} onClick={() => focus(g)}
                  style={{ padding: '5px 10px', borderRadius: radius.sm, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.05, 2),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>{g}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'focused' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Focused: "{goal}." The future is not random — it is built. You can see it now through the telescope: you, 10 years from now, living the consequence of today{"'"}s choices. Lay the foundation today for the tower you want to live in tomorrow. The observatory doesn{"'"}t predict the future. It designs it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Prospection. Martin Seligman{"'"}s "Homo Prospectus" theory: humans are fundamentally future-oriented creatures. The brain{"'"}s default mode network spends most of its time simulating future scenarios. Hal Hershfield{"'"}s research: people who feel psychologically "close" to their future selves make better long-term decisions (more saving, less impulsivity). The telescope literally bridges temporal distance — making the far future feel near.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Focused.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}