/**
 * SOMA #9 — The Cell Memory
 * "Your body remembers what your mind forgot."
 * ARCHETYPE: Pattern C (Draw) — Draw what your body remembers
 * ENTRY: Instruction-as-poetry — "Close your eyes. Open your hand. Draw what lives there."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Soma_CellMemory({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.28,
    minStrokes: 2,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Close your eyes. Open your hand. Draw what lives there. What your body remembers that your mind forgot.
            </motion.div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '220px', height: '180px', borderRadius: radius.sm, position: 'relative', overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.03, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.04 + draw.coverage * 0.06, 3)}`,
            }}>
              <svg width="220" height="180" style={{ position: 'absolute', top: 0, left: 0 }}>
                {draw.strokes.map((stroke, si) => (
                  <polyline key={si}
                    points={stroke.points.map(pt => `${pt.x * 220},${pt.y * 180}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.12, 8)} strokeWidth="1.5" strokeLinecap="round" />
                ))}
                {draw.currentStroke.length > 1 && (
                  <polyline
                    points={draw.currentStroke.map(pt => `${pt.x * 220},${pt.y * 180}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.18, 10)} strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {draw.coverage < 0.1 ? 'draw from the body' : draw.coverage < 0.28 ? 'more\u2026' : 'remembered'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Somatic memory. Muscle tissue retains movement patterns independently of hippocampal encoding. Your fingers remember textures your mind cannot name. The drawing you made came from a place beneath language: cellular memory that predates your autobiographical self.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Remembered.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}