/**
 * ASCENDANT #1 -- Chop Wood, Carry Water
 * "The magic is in the scrubbing."
 * Pattern B (Drag) -- Drag to scrub a dirty plate clean; rhythm and care measured
 * STEALTH KBE: Scrubbing rhythm = Embodied Mindfulness / Mindful Action (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Integrated Living', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'scrubbing' | 'clean' | 'resonant' | 'afterglow';

export default function Ascendant_ChopWood({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] ChopWood embodiedMindfulness=confirmed mindfulAction=true`);
      setStage('clean');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('scrubbing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const dirtOpacity = 0.08 * (1 - drag.progress);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.03, 2) }} />
          </motion.div>
        )}
        {stage === 'scrubbing' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Enlightened state. Then: "Do the dishes." Drag to scrub. The magic is in the scrubbing.
            </div>
            {/* Plate */}
            <div style={{ width: '60px', height: '60px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.03 + dirtOpacity, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              position: 'relative', overflow: 'hidden' }}>
              {/* Dirt layer */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                background: `radial-gradient(circle at 40% 45%, hsla(30, 20%, 20%, ${dirtOpacity}), transparent 70%)` }} />
              {drag.progress > 0.5 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}
                  style={{ position: 'absolute', inset: '15%', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.04, 3) }} />
              )}
            </div>
            <div ref={drag.containerRef} style={{ width: '100px', height: '12px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.08 + drag.progress * 0.04, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                  position: 'absolute', top: '-6px', left: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Scrub →</div>
          </motion.div>
        )}
        {stage === 'clean' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Clean. Before enlightenment: chop wood, carry water. After enlightenment: chop wood, carry water. The plate is clean, and you are changed -- not because the task is different, but because your attention is. The same dish, the same soap, the same water. But presence transforms everything. The magic is in the scrubbing.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Mindful action. Thich Nhat Hanh: "Wash each dish as though each one were a newborn baby." The Zen tradition emphasizes samu (work practice) -- chopping wood, cooking rice, sweeping -- as meditation. Neuroscience of "mundane creativity" (Baird, 2012): mind-wandering during simple tasks activates the default mode network in a productive way; attentive presence during the same tasks activates the task-positive network. Both are valid. The difference is intention. Integration means the practice IS the daily life.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Scrubbed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}