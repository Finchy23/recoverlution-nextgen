/**
 * MULTIVERSE #3 — The Costume Change
 * "Do not wear the costume to bed. Who are you when the audience leaves?"
 * ARCHETYPE: Pattern B (Drag) — Swipe off heavy costume
 * ENTRY: Scene-first — backstage
 * STEALTH KBE: Performing swipe-off = Role Disengagement / Role Exit (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'backstage' | 'changed' | 'resonant' | 'afterglow';

export default function Multiverse_CostumeChange({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] CostumeChange roleDisengagement=confirmed roleExit=true`);
      setStage('changed');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('backstage'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '16px', height: '24px', borderRadius: '4px 4px 2px 2px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
        )}
        {stage === 'backstage' && (
          <motion.div key="bs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Backstage. The show is over. Swipe to take off the heavy {"'"}Worker{"'"} costume.
            </div>
            {/* Costume visual */}
            <div style={{ position: 'relative', width: '80px', height: '50px' }}>
              <motion.div animate={{ opacity: 1 - drag.progress * 0.8 }}
                style={{ width: '40px', height: '50px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.05 - drag.progress * 0.03, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                  position: 'absolute', left: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint, opacity: 1 - drag.progress }}>Worker</span>
              </motion.div>
              {drag.progress > 0.3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: drag.progress * 0.6 }}
                  style={{ width: '40px', height: '50px', borderRadius: radius.xs,
                    background: themeColor(TH.accentHSL, 0.03, 2),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}`,
                    position: 'absolute', left: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>Player</span>
                </motion.div>
              )}
            </div>
            <div ref={drag.containerRef} style={{ width: '120px', height: '12px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', top: '-6px', left: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'changed' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The costume is off. The music changed. You are not the Worker — you were wearing the Worker. Hang it up. Who are you when the audience leaves? That{"'"}s the real question.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Role exit. Erving Goffman{"'"}s dramaturgical theory: we perform different roles on different stages. The pathology isn{"'"}t having roles — it{"'"}s forgetting they{"'"}re costumes. "Role residue" (Amy Wrzesniewski) occurs when we carry one role{"'"}s emotional weight into another. The costume change is a cognitive boundary ritual — a deliberate transition between selves.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Changed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}