/**
 * ENGINEER #2 — The Friction Slider
 * "Grease the gears. Remove steps between Thought and Action."
 * Pattern B (Drag) — Slide friction from high to low
 * STEALTH KBE: Selecting friction-reduction = Environmental Design / System > Self-Discipline (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Behavioral Design', 'believing', 'Circuit');
type Stage = 'arriving' | 'sliding' | 'greased' | 'resonant' | 'afterglow';

export default function Engineer_FrictionSlider({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] FrictionSlider environmentalDesign=confirmed systemOverDiscipline=true`);
      setStage('greased');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('sliding'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const frictionColor = `hsla(${0 + drag.progress * 120}, ${20 + drag.progress * 10}%, ${30 + drag.progress * 5}%, ${0.08 + drag.progress * 0.04})`;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '6px', borderRadius: '3px',
              background: `linear-gradient(90deg, hsla(0, 20%, 30%, 0.06), hsla(120, 20%, 30%, 0.06))` }} />
          </motion.div>
        )}
        {stage === 'sliding' && (
          <motion.div key="sl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Habit: "Gym." Friction is HIGH. Slide it down: "Pack bag night before." Grease the gears.
            </div>
            <div style={{ padding: '8px 14px', borderRadius: radius.sm,
              background: frictionColor, border: `1px solid ${frictionColor}`,
              transition: 'background 0.2s' }}>
              <span style={{ fontSize: '11px', color: drag.progress < 0.5 ? 'hsla(0, 15%, 35%, 0.2)' : 'hsla(120, 15%, 35%, 0.2)' }}>
                Friction: {drag.progress < 0.3 ? 'HIGH' : drag.progress < 0.7 ? 'MEDIUM' : 'LOW'}
              </span>
            </div>
            <div ref={drag.containerRef} style={{ width: '120px', height: '12px', borderRadius: '6px',
              background: `linear-gradient(90deg, hsla(0, 15%, 25%, 0.04), hsla(120, 15%, 30%, 0.04))`,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', top: '-12px', left: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Reduce friction →</div>
          </motion.div>
        )}
        {stage === 'greased' && (
          <motion.div key="gr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            GREEN. Low friction. The bag is packed. The shoes are by the door. The alarm is set. If the habit is hard to start, you won{"'"}t do it — so you greased the gears. Remove the steps between "Thought" and "Action." Don{"'"}t rely on motivation. Rely on architecture.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Friction and habit formation. BJ Fogg{"'"}s Behavior Model: Behavior = Motivation × Ability × Prompt. "Ability" is the inverse of friction. Every step you remove between trigger and behavior increases the probability of completion exponentially. Amazon{"'"}s "1-Click Buy" is friction engineering. Your life habits work the same way. Make the good easy. Make the bad hard.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Greased.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}