/**
 * INFINITE PLAYER II #7 — The Unfinished Symphony
 * "You are the resolution. Finish the phrase."
 * Pattern A (Tap) — Song ends on cliffhanger chord; tap to resolve
 * STEALTH KBE: Taking responsibility for ending = Creative Agency (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'suspended' | 'resolved' | 'resonant' | 'afterglow';

export default function Horizon_UnfinishedSymphony({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('suspended'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const resolve = () => {
    if (stage !== 'suspended') return;
    console.log(`[KBE:K] UnfinishedSymphony resolved=true creativeAgency=true completionOwnership=true`);
    setStage('resolved');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: '12px', color: themeColor(TH.primaryHSL, 0.06, 3) }}>&#x266B;</div>
          </motion.div>
        )}
        {stage === 'suspended' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              {['C', 'E', 'G', 'B', 'D'].map((note, i) => (
                <motion.div key={note} initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: i < 4 ? 0.7 : 0.3, y: 0 }}
                  transition={{ delay: i * 0.4 }}
                  style={{ fontSize: i === 4 ? '16px' : '12px',
                    color: i === 4 ? themeColor(TH.accentHSL, 0.3, 10) : palette.textFaint,
                    fontStyle: i === 4 ? 'italic' : 'normal' }}>
                  {note}{i === 4 ? '7...' : ''}
                </motion.div>
              ))}
            </div>
            <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8), fontStyle: 'italic' }}>
              suspended... unresolved...
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The melody ends on a dominant 7th. Suspended. Tap to resolve the final note.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={resolve}
              style={{ padding: '14px 22px', borderRadius: '18px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Resolve the chord</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resolved' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            Resolved. Completion is a myth. The song goes on in your head. You are the resolution. You finished the phrase. The composer leaves gaps for the listener to complete — because the act of resolution is itself the meaning.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The Zeigarnik Effect: incomplete tasks occupy more mental real estate than completed ones. The unresolved chord demands resolution — and the brain provides it. Your agency is the closing note. You don{"'"}t just listen to life. You compose it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Composed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}