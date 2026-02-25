/**
 * THRESHOLD #8 — The Dusk Walk
 * "Trace the path between what was and what will be."
 * ARCHETYPE: Pattern C (Draw) — Draw the path between day and night
 * ENTRY: Scene-first — a twilight landscape appears, user draws through it
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Threshold_DuskWalk({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.3,
    minStrokes: 2,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const coverage = draw.coverage;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '200px', height: '140px', borderRadius: radius.sm,
              background: 'linear-gradient(to bottom, hsla(270, 12%, 12%, 0.1), hsla(25, 15%, 10%, 0.06))',
            }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>twilight</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Trace the path between what was and what will be. Draw through the dusk. There is no wrong direction.
            </div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '220px', height: '160px', borderRadius: radius.sm, position: 'relative', overflow: 'hidden',
              background: `linear-gradient(to bottom, hsla(270, 12%, ${10 + coverage * 6}%, ${0.08 + coverage * 0.04}), hsla(25, 15%, ${8 + coverage * 5}%, 0.06))`,
            }}>
              <svg width="220" height="160" style={{ position: 'absolute', top: 0, left: 0 }}>
                {draw.strokes.map((stroke, si) => (
                  <polyline key={si}
                    points={stroke.points.map(pt => `${pt.x * 220},${pt.y * 160}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.12, 8)} strokeWidth="1.5" strokeLinecap="round" />
                ))}
                {draw.currentStroke.length > 1 && (
                  <polyline
                    points={draw.currentStroke.map(pt => `${pt.x * 220},${pt.y * 160}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.15, 10)} strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {coverage < 0.1 ? 'draw the path' : coverage < 0.3 ? 'keep walking\u2026' : 'arriving'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The crepuscular hour. Animals who thrive at dusk are called crepuscular {';'} they evolved to exploit the threshold between predators of day and night. Your path through the in-between is not wandering. It is strategy.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Crepuscular.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}