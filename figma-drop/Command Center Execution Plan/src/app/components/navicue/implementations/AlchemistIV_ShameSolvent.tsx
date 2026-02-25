/**
 * ALCHEMIST IV #5 - The Shame Solvent
 * "Shame cannot survive empathy."
 * Pattern B (Drag) - Drag to rub self-compassion onto the stain
 * STEALTH KBE: Rubbing away stain = Shame Resilience / Self-Soothing (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Emotional Regulation', 'embodying', 'Ember');
type Stage = 'arriving' | 'stained' | 'dissolved' | 'resonant' | 'afterglow';

export default function AlchemistIV_ShameSolvent({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] ShameSolvent shameResilience=confirmed selfSoothing=true`);
      setStage('dissolved');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('stained'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const stainOpacity = 0.08 * (1 - drag.progress);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'hsla(0, 0%, 10%, 0.04)' }} />
          </motion.div>
        )}
        {stage === 'stained' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A black stain on white cloth. Apply self-compassion. Drag to dissolve.
            </div>
            {/* Cloth with stain */}
            <div style={{ width: '80px', height: '80px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.015, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div animate={{ opacity: stainOpacity, scale: 1 - drag.progress * 0.4 }}
                style={{ width: '30px', height: '30px', borderRadius: '50%',
                  background: `hsla(0, 0%, 8%, ${stainOpacity})` }} />
            </div>
            {/* Drag slider */}
            <div ref={drag.containerRef} style={{ width: '120px', height: '12px', borderRadius: '6px',
              background: themeColor(TH.accentHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.08 + drag.progress * 0.04, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                  position: 'absolute', top: '-6px', left: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Dissolve with compassion →</div>
          </motion.div>
        )}
        {stage === 'dissolved' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Dissolved. Shame cannot survive empathy. It needs secrecy to grow - bring it into the light and it evaporates. Wash it with kindness. The stain was never permanent; it only felt that way because you were looking at it alone, in the dark.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Shame resilience. Bren{"é"} Brown{"'"}s research: shame thrives in secrecy, silence, and judgment. The antidote is empathy - specifically, self-compassion (Kristin Neff) and connection. People with "shame resilience" don{"'"}t avoid shame; they move through it faster via self-kindness, common humanity recognition, and mindful awareness. The solvent is not perfection. It{"'"}s presence.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Dissolved.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}