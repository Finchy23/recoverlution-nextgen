/**
 * ADAPTIVE #2 -- The Kintsugi Repair
 * "Do not hide the damage. Highlight it. The crack is where history lives."
 * ARCHETYPE: Pattern B (Drag) -- Trace cracks to fill them with gold
 * ENTRY: Scene-first -- shattered bowl
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Storm');
type Stage = 'arriving' | 'active' | 'repaired' | 'resonant' | 'afterglow';

export default function Adaptive_KintsugiRepair({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:K] KintsugiRepair selfAcceptance=confirmed`);
      setStage('repaired');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="2"
                strokeDasharray="8,4" />
            </svg>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Trace the crack. Fill it with gold.
            </div>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="30" fill="none" stroke={themeColor(TH.primaryHSL, 0.1, 6)} strokeWidth="2" />
              <line x1="20" y1="30" x2="60" y2="50" stroke={themeColor(TH.accentHSL, 0.1 + drag.progress * 0.2, 6 + drag.progress * 6)}
                strokeWidth={1 + drag.progress * 2} />
              <line x1="35" y1="15" x2="45" y2="65" stroke={themeColor(TH.accentHSL, 0.08 + drag.progress * 0.18, 4 + drag.progress * 6)}
                strokeWidth={1 + drag.progress * 1.5} />
            </svg>
            <div ref={drag.containerRef} style={{ width: '200px', height: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.15, 8),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.2, 12)}`,
                  position: 'absolute', top: '-12px', left: '3px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              gold: {Math.round(drag.progress * 100)}%
            </div>
          </motion.div>
        )}
        {stage === 'repaired' && (
          <motion.div key="rep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="30" fill="none" stroke={themeColor(TH.accentHSL, 0.12, 8)} strokeWidth="2" />
              <line x1="20" y1="30" x2="60" y2="50" stroke={themeColor(TH.accentHSL, 0.35, 14)} strokeWidth="3" />
              <line x1="35" y1="15" x2="45" y2="65" stroke={themeColor(TH.accentHSL, 0.3, 12)} strokeWidth="2.5" />
            </svg>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              More beautiful than before. The gold is the history. The cracks are the story.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-acceptance. Kintsugi: the art of repairing with gold. Don{"'"}t hide the damage; highlight it. The crack is where the history lives. You are more valuable because you broke and healed.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Golden.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}