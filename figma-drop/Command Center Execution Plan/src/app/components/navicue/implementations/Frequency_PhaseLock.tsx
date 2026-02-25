/**
 * FREQUENCY #8 — The Phase Lock
 * "Drag two waves into perfect alignment."
 * ARCHETYPE: Pattern B (Drag) — Drag two waves into phase alignment
 * ENTRY: Scene-first — two out-of-phase waves visible, user adjusts
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Frequency_PhaseLock({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [phase, setPhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    const ph = setInterval(() => setPhase(p => p + 1), 80);
    return () => { T.current.forEach(clearTimeout); clearInterval(ph); };
  }, []);

  const p = drag.progress;
  const phaseOffset = Math.PI * (1 - p);
  const coherence = Math.cos(phaseOffset / 2);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="200" height="60">
              {Array.from({ length: 60 }).map((_, i) => (
                <g key={i}>
                  <circle cx={i * 3.3} cy={15 + Math.sin(i * 0.2) * 6} r="0.8"
                    fill={themeColor(TH.accentHSL, 0.06, 5)} />
                  <circle cx={i * 3.3} cy={45 + Math.sin(i * 0.2 + Math.PI) * 6} r="0.8"
                    fill={themeColor(TH.accentHSL, 0.06, 5)} />
                </g>
              ))}
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>out of phase</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Drag two waves into perfect alignment. When they lock, you{'\u2019'}ll feel it. Phase coherence {'\u2014'} the moment two rhythms become one.
            </div>
            <svg width="240" height="60" style={{ overflow: 'visible' }}>
              {Array.from({ length: 80 }).map((_, i) => {
                const x = i * 3;
                const y1 = 15 + Math.sin((phase + i) * 0.12) * 8;
                const y2 = 45 + Math.sin((phase + i) * 0.12 + phaseOffset) * 8;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y1} r="1" fill={themeColor(TH.accentHSL, 0.08, 5)} />
                    <circle cx={x} cy={y2} r="1" fill={themeColor(TH.accentHSL, 0.08, 5)} />
                    {coherence > 0.8 && (
                      <line x1={x} y1={y1} x2={x} y2={y2}
                        stroke={themeColor(TH.accentHSL, 0.03, 4)} strokeWidth="0.5" />
                    )}
                  </g>
                );
              })}
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {coherence > 0.9 ? 'locked' : coherence > 0.6 ? 'close\u2026' : 'align them'}
            </div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '200px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3),
            }}>
              <motion.div style={{
                position: 'absolute', left: `${10 + p * 150}px`, top: '4px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1 + coherence * 0.08, 6),
                pointerEvents: 'none',
              }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Phase-locked loops. Your brain uses phase synchronization to bind perceptions into coherent experience. Neurons that fire together wire together {'\u2014'} but they must fire in phase. The moment of lock you felt is the same mechanism consciousness uses to create unity from millions of separate signals.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Locked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}