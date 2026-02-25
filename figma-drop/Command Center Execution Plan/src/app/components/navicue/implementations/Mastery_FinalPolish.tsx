/**
 * MAGNUM OPUS II #6 — The Final Polish
 * "A daily polish keeps the edge true."
 * Pattern A (Drag) — Rhythmic drag gesture to sharpen a sword
 * STEALTH KBE: Consistency of rhythm = Maintenance Mindset / Discipline (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'dull' | 'sharp' | 'resonant' | 'afterglow';

export default function Mastery_FinalPolish({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('dull'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      if (stage !== 'dull') return;
      console.log(`[KBE:E] FinalPolish sharpeningComplete=true discipline=true maintenanceMindset=true`);
      setStage('sharp');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '3px', background: themeColor(TH.primaryHSL, 0.06, 3), borderRadius: '2px' }} />
          </motion.div>
        )}
        {stage === 'dull' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '140px', height: '40px' }}>
              {/* Blade */}
              <div style={{ width: '120px', height: '4px', borderRadius: '2px',
                background: `linear-gradient(90deg, ${themeColor(TH.primaryHSL, 0.08, 4)}, ${themeColor(TH.accentHSL, drag.progress * 0.2, 3 + drag.progress * 10)})`,
                position: 'absolute', top: '18px', left: '10px',
                boxShadow: drag.progress > 0.5 ? `0 0 ${drag.progress * 12}px ${themeColor(TH.accentHSL, drag.progress * 0.15, 8)}` : 'none',
                transition: 'box-shadow 0.3s' }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A dull sword. Drag side to side to sharpen it.
            </div>
            <motion.div {...drag.bindDrag()} whileTap={{ scale: 0.95 }}
              style={{ padding: '10px 24px', borderRadius: '9999px', cursor: 'grab',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`, touchAction: 'none' }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>
                {drag.progress > 0 ? `Sharpening... ${Math.round(drag.progress * 100)}%` : 'Drag to polish'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sharp' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            Sharp. The weapon is ready. The mind is ready. Do not let it rust. A daily polish keeps the edge true. The samurai tradition of maintaining the katana is a metaphor for sustained excellence — mastery isn{"'"}t an event, it{"'"}s a maintenance schedule.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Anders Ericsson{"'"}s deliberate practice research: peak performers don{"'"}t just practice — they maintain. Skill atrophy is real. The 10,000-hour rule misses the point: it{"'"}s not about accumulation but daily refinement. Polish the edge. Every day.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sharp.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}