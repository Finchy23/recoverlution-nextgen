/**
 * FREQUENCY #4 — The Octave Jump
 * "Same note. Higher register."
 * ARCHETYPE: Pattern B (Drag) — Drag yourself up or down an octave
 * ENTRY: Instruction-as-poetry — "You've been playing the same note. Go higher."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Frequency_OctaveJump({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const p = drag.progress;
  const octave = Math.floor(p * 4);
  const noteSpacing = 12 + p * 8;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You{'\u2019'}ve been playing the same note. Go higher. Same truth, higher register. Drag upward through the octaves.
            </motion.div>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '80px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i}
                  animate={{ height: `${noteSpacing + (i === octave * 3 ? 20 : 0)}px` }}
                  style={{
                    width: '4px', borderRadius: '2px',
                    background: themeColor(TH.accentHSL,
                      i <= octave * 3 ? 0.1 + p * 0.1 : 0.04, 5),
                    transition: 'background 0.3s',
                  }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              octave {octave + 1}
            </div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '36px', height: '140px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3),
            }}>
              <motion.div style={{
                position: 'absolute', left: '4px', bottom: `${8 + p * 100}px`,
                width: '28px', height: '28px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1 + p * 0.08, 6),
                pointerEvents: 'none',
              }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Octave equivalence. When you double a frequency, the note is the same but higher {'\u2014'} our brains perceive them as the same pitch class. Growth works identically: the lesson repeats, but at a higher level. You{'\u2019'}re not going in circles. You{'\u2019'}re going in spirals.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Higher.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}