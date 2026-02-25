/**
 * FREQUENCY #3 — The Harmony Map
 * "Draw the connections between things that resonate together."
 * ARCHETYPE: Pattern C (Draw) — Draw connections between resonant elements
 * ENTRY: Scene-first — scattered dots appear, user draws lines between them
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

const NODES = [
  { x: 0.2, y: 0.2 }, { x: 0.8, y: 0.15 }, { x: 0.5, y: 0.5 },
  { x: 0.15, y: 0.75 }, { x: 0.85, y: 0.7 }, { x: 0.45, y: 0.85 },
];

export default function Frequency_HarmonyMap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.2,
    minStrokes: 3,
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
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '200px', height: '180px', position: 'relative' }}>
              {NODES.map((n, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                  transition={{ delay: i * 0.3 }}
                  style={{
                    position: 'absolute', left: `${n.x * 100}%`, top: `${n.y * 100}%`,
                    width: '8px', height: '8px', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                    background: themeColor(TH.accentHSL, 0.15, 6),
                  }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Draw the connections between things that resonate together. Link what belongs. Your hand knows which nodes sing to each other.
            </div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '220px', height: '200px', borderRadius: radius.sm, position: 'relative', overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.02, 1),
            }}>
              {NODES.map((n, i) => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.15 + coverage * 0.2, 0.25 + coverage * 0.2, 0.15 + coverage * 0.2] }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  style={{
                    position: 'absolute', left: `${n.x * 100}%`, top: `${n.y * 100}%`,
                    width: '8px', height: '8px', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                    background: themeColor(TH.accentHSL, 0.15 + coverage * 0.1, 6),
                  }} />
              ))}
              <svg width="220" height="200" style={{ position: 'absolute', top: 0, left: 0 }}>
                {draw.strokes.map((stroke, si) => (
                  <polyline key={si}
                    points={stroke.points.map(pt => `${pt.x * 220},${pt.y * 200}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.12, 8)} strokeWidth="1.5" strokeLinecap="round" />
                ))}
                {draw.currentStroke.length > 1 && (
                  <polyline
                    points={draw.currentStroke.map(pt => `${pt.x * 220},${pt.y * 200}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.18, 10)} strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {draw.strokes.length < 2 ? 'connect them' : coverage < 0.2 ? 'more connections\u2026' : 'harmonized'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Sympathetic resonance. When one tuning fork vibrates, nearby forks at the same frequency begin to sing without being struck. The connections you drew are not inventions {'\u2014'} they are recognitions. Harmony is what happens when you stop forcing and start noticing.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Resonant.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}