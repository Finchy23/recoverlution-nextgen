/**
 * EDITOR #10 — The Final Cut (Narrative Closure)
 * "The rough draft is done. This is the final cut. Play it."
 * ARCHETYPE: Pattern A (Tap) — Film leader countdown, clear screen
 * ENTRY: Cold open — film leader counting down
 * STEALTH KBE: Completion = Narrative Closure mastery
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'countdown' | 'sealed' | 'resonant' | 'afterglow';

export default function Editor_FinalCut({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [count, setCount] = useState(3);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('countdown'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'countdown') return;
    if (count <= 0) {
      console.log(`[KBE:E] FinalCut narrativeClosure=confirmed`);
      setStage('sealed');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
      return;
    }
    const id = window.setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [stage, count]);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ ...navicueType.texture, color: themeColor(TH.primaryHSL, 0.15, 8), fontSize: '18px' }}>3</div>
            </div>
          </motion.div>
        )}
        {stage === 'countdown' && (
          <motion.div key="cd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              {/* Film leader circle */}
              <svg width="80" height="80" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="35" fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="2" />
                <circle cx="40" cy="40" r="35" fill="none"
                  stroke={themeColor(TH.accentHSL, 0.2, 8)}
                  strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (count / 3)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <motion.div key={count} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.35, 12), fontSize: '28px' }}>
                  {count > 0 ? count : ''}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1.5 }}
              style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.35, 12), fontSize: '14px', letterSpacing: '0.15em' }}>
              ACTION.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              The rough draft is done. This is the final cut. Play it.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Narrative closure. The psychological act of "finalizing" a perspective reduces rumination and allows the brain to archive the event. The story is made in the edit. You are the editor of your own film.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Final cut.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}