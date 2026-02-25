/**
 * EDITOR #9 — The Color Grade (Mood)
 * "You cannot change the weather. You can change the grade."
 * ARCHETYPE: Pattern B (Drag) — Swipe from grey/cold to warm/golden
 * ENTRY: Scene-first — grey rainy scene
 * STEALTH KBE: Actively grading warm = Positive Reappraisal / Emotional Resilience (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'active' | 'graded' | 'resonant' | 'afterglow';

export default function Editor_ColorGrade({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] ColorGrade warmthApplied=true positiveReappraisal=confirmed`);
      setStage('graded');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const hue = 220 - drag.progress * 185; // 220(blue-grey) → 35(golden)
  const sat = 5 + drag.progress * 18;
  const light = 15 + drag.progress * 10;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '120px', height: '60px', borderRadius: radius.sm,
              background: 'hsla(220, 5%, 18%, 0.3)',
              border: '1px solid hsla(220, 5%, 25%, 0.15)' }}>
              {/* Rain lines */}
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} animate={{ y: [0, 20, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  style={{ position: 'absolute', left: `${20 + i * 25}px`, top: '10px',
                    width: '1px', height: '8px', background: 'hsla(220, 10%, 40%, 0.2)' }} />
              ))}
            </div>
            <span style={{ ...navicueType.hint, color: palette.textFaint }}>grey</span>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Find the beauty in the storm. Change the grade.
            </div>
            <motion.div animate={{ backgroundColor: `hsla(${hue}, ${sat}%, ${light}%, 0.15)` }}
              style={{ width: '140px', height: '70px', borderRadius: radius.md,
                border: `1px solid hsla(${hue}, ${sat}%, ${light + 15}%, 0.12)`,
                backgroundColor: 'rgba(0,0,0,0)' }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} animate={{ y: [0, 16, 0], opacity: 1 - drag.progress * 0.5 }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  style={{ position: 'absolute', left: `${15 + i * 30}px`, top: '12px',
                    width: '1px', height: '8px',
                    background: `hsla(${hue}, ${sat + 5}%, ${light + 20}%, ${0.15 + drag.progress * 0.1})` }} />
              ))}
            </motion.div>
            <div style={{ ...navicueType.hint, color: `hsla(${hue}, ${sat}%, ${light + 30}%, 0.5)` }}>
              {drag.progress < 0.3 ? 'cold' : drag.progress < 0.7 ? 'neutral' : 'golden hour'}
            </div>
            <div ref={drag.containerRef} style={{ width: '200px', height: '12px', borderRadius: radius.sm,
              background: `linear-gradient(to right, hsla(220, 5%, 20%, 0.15), hsla(35, 20%, 30%, 0.15))`,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: `hsla(${hue}, ${sat + 10}%, ${light + 20}%, 0.3)`,
                  border: `1px solid hsla(${hue}, ${sat + 10}%, ${light + 30}%, 0.25)`,
                  position: 'absolute', top: '-6px', left: '3px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'graded' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '140px', height: '70px', borderRadius: radius.md,
              background: 'hsla(35, 22%, 25%, 0.12)',
              border: '1px solid hsla(35, 22%, 35%, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...navicueType.texture, color: 'hsla(35, 22%, 45%, 0.4)', fontSize: '11px' }}>
                golden hour
              </span>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The rain is still there. But it{"'"}s beautiful now. Same weather, different grade.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Positive reappraisal. You cannot change the circumstance (weather), but you can change the attitude (color grade). This "aesthetic agency" correlates with emotional resilience: finding beauty in the storm.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Graded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}