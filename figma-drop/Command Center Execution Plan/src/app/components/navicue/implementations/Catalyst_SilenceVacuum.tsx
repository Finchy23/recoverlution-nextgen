/**
 * CATALYST #4 — The Silence Vacuum
 * "You asked the question. Now wait. Do not plug the hole."
 * ARCHETYPE: Pattern C (Hold/Wait) — Resist pressing "Fill Silence" for 7 seconds
 * ENTRY: Cold open — question asked, silence begins
 * STEALTH KBE: Not pressing for 7s = Distress Tolerance (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CATALYST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Theater');
type Stage = 'arriving' | 'waiting' | 'result' | 'resonant' | 'afterglow';

export default function Catalyst_SilenceVacuum({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [elapsed, setElapsed] = useState(0);
  const [failed, setFailed] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('waiting'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'waiting') return;
    const id = window.setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next >= 7) {
          clearInterval(id);
          console.log(`[KBE:E] SilenceVacuum silenceHeld=true distressTolerance=confirmed`);
          setStage('result');
          t(() => setStage('resonant'), 4500);
          t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  const fillSilence = () => {
    if (stage !== 'waiting') return;
    setFailed(true);
    console.log(`[KBE:E] SilenceVacuum silenceHeld=false failedAtSec=${elapsed}`);
    setStage('result');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic', textAlign: 'center' }}>
            "What do you really want?"
          </motion.div>
        )}
        {stage === 'waiting' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The silence is a vacuum. Do not plug the hole.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>...</span>
              </div>
              <span style={{ ...navicueType.hint, color: palette.textFaint }}>{elapsed}s / 7s</span>
            </div>
            <div style={{ width: '140px', height: '6px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
              <motion.div animate={{ width: `${(elapsed / 7) * 100}%` }}
                style={{ height: '100%', borderRadius: '3px',
                  background: themeColor(TH.accentHSL, 0.15, 8) }} />
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={fillSilence}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ padding: '14px 20px', borderRadius: '9999px', cursor: 'pointer',
                background: 'hsla(0, 18%, 28%, 0.05)', border: '1px dashed hsla(0, 18%, 35%, 0.12)' }}>
              <div style={{ ...navicueType.choice, color: 'hsla(0, 25%, 40%, 0.4)', fontSize: '11px' }}>Fill the Silence</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'result' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {failed
                ? 'You broke the silence. The truth retreated. They were about to speak.'
                : 'Seven seconds. The vacuum pulled the truth out. They spoke first.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Distress tolerance. Silence is uncomfortable because it creates a vacuum. The negotiator{"'"}s secret: ask the question, then wait. The person who speaks first loses leverage. Sitting in the discomfort is the skill.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Held.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}