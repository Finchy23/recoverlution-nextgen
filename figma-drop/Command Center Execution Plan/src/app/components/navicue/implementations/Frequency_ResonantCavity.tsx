/**
 * FREQUENCY #9 — The Resonant Cavity
 * "Draw the shape of your inner chamber."
 * ARCHETYPE: Pattern C (Draw) — Draw the shape of your inner resonant space
 * ENTRY: Instruction-as-poetry — "Every instrument has a body. Draw yours."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Frequency_ResonantCavity({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.25,
    minStrokes: 1,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const coverage = draw.coverage;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Every instrument has a body. A cavity that shapes its voice. Draw the shape of your inner resonant chamber. The space where your frequency lives.
            </motion.div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '200px', height: '200px', borderRadius: '50%', position: 'relative', overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.02 + coverage * 0.02, 1),
              border: `1px solid ${themeColor(TH.accentHSL, 0.04 + coverage * 0.06, 3)}`,
            }}>
              <svg width="200" height="200" style={{ position: 'absolute', top: 0, left: 0 }}>
                {draw.strokes.map((stroke, si) => (
                  <polyline key={si}
                    points={stroke.points.map(pt => `${pt.x * 200},${pt.y * 200}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.12, 8)} strokeWidth="1.5" strokeLinecap="round" />
                ))}
                {draw.currentStroke.length > 1 && (
                  <polyline
                    points={draw.currentStroke.map(pt => `${pt.x * 200},${pt.y * 200}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.18, 10)} strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {coverage < 0.1 ? 'draw the cavity' : coverage < 0.25 ? 'shape it\u2026' : 'resonating'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Acoustic resonance. A violin{'\u2019'}s body doesn{'\u2019'}t create the sound {'\u2014'} it amplifies specific frequencies and dampens others. Your inner cavity does the same: it determines which experiences resonate and which pass through unheard. The shape you drew is the shape of your attention.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Shaped.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
