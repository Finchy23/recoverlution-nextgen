/**
 * ENGINEER #8 — The Feedback Loop
 * "You cannot improve without data. Shorten the loop."
 * Pattern A (Tap) — Throw dart blindfolded, then with sight
 * STEALTH KBE: Reviewing data before acting = Iterative Improvement / Learning Loop (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Behavioral Design', 'knowing', 'Circuit');
type Stage = 'arriving' | 'blind' | 'seeing' | 'hit' | 'resonant' | 'afterglow';

export default function Engineer_FeedbackLoop({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('blind'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const throwBlind = () => {
    if (stage !== 'blind') return;
    setStage('seeing');
  };

  const throwSighted = () => {
    if (stage !== 'seeing') return;
    console.log(`[KBE:K] FeedbackLoop iterativeImprovement=confirmed learningLoop=true`);
    setStage('hit');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'blind' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Throw the dart. You are blindfolded.
            </div>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              {/* Target */}
              {[35, 25, 15].map((r, i) => (
                <div key={i} style={{ position: 'absolute', left: `${40 - r}px`, top: `${40 - r}px`,
                  width: `${r * 2}px`, height: `${r * 2}px`, borderRadius: '50%',
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.03 + i * 0.01, 2)}` }} />
              ))}
              {/* Blindfold overlay */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                fontSize: '11px', color: palette.textFaint }}>blind</div>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={throwBlind}
              style={{ padding: '14px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>Throw (blind)</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'seeing' && (
          <motion.div key="se" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Miss. Now — blindfold removed. You can see the target and where you missed. Throw again.
            </div>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              {[35, 25, 15].map((r, i) => (
                <div key={i} style={{ position: 'absolute', left: `${40 - r}px`, top: `${40 - r}px`,
                  width: `${r * 2}px`, height: `${r * 2}px`, borderRadius: '50%',
                  border: `1px solid ${themeColor(TH.accentHSL, 0.04 + i * 0.02, 3)}` }} />
              ))}
              {/* Previous miss */}
              <div style={{ position: 'absolute', top: '16px', left: '60px',
                width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.08, 5) }} />
              <span style={{ position: 'absolute', top: '10px', left: '62px',
                fontSize: '11px', color: palette.textFaint }}>miss</span>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={throwSighted}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Throw (sighted)</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'hit' && (
          <motion.div key="hi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Hit. The difference between the two throws: feedback. You cannot improve what you cannot measure. The first throw was blind action — effort without information. The second was informed action — effort with data. Shorten the feedback loop. Measure the result immediately. Adjust. Throw again.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Feedback loops. Norbert Wiener{"'"}s cybernetics: all self-correcting systems require feedback. The thermostat, the immune system, the scientific method — all work by measure → compare → adjust. Anders Ericsson{"'"}s deliberate practice research: expertise is built through immediate feedback, not through repetition alone. 10,000 hours of blindfolded darts teaches you nothing. 100 hours with instant feedback can make you expert.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Calibrated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}