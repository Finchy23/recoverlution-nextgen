/**
 * SHAPESHIFTER #4 — The Metamorphosis
 * "You are mid-transformation. That is the most interesting part."
 * ARCHETYPE: Pattern E (Hold) — An organic form mid-morph.
 * Hold to sustain the transformation. The shape continuously evolves.
 * Liminal Identity — the beauty of being in between.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function ShapeShifter_Metamorphosis({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = hold.tension;
  // Shape morphing — interpolate between organic blob and geometric crystal
  const blobRadius = 40 - t * 15;
  const corners = Math.round(3 + t * 5); // triangle → octagon
  const rotation = t * 180;

  // Generate polygon points for the morphing shape
  const polyPoints = Array.from({ length: corners }, (_, i) => {
    const angle = (i / corners) * Math.PI * 2 - Math.PI / 2;
    const r = 35 + Math.sin(i * 1.5) * (10 * (1 - t));
    const x = 90 + Math.cos(angle) * r;
    const y = 90 + Math.sin(angle) * r;
    return `${x},${y}`;
  }).join(' ');

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something is becoming...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              A caterpillar dissolves completely into goo before becoming a butterfly. The goo is the most important stage. You are mid-transformation.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to sustain the metamorphosis</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, position: 'relative', width: '180px', height: '180px' }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180">
                {/* Outer aura — pulses during hold */}
                <motion.circle cx="90" cy="90" r={55 + t * 10}
                  fill="none" stroke={themeColor(TH.accentHSL, 0.03 + t * 0.02, 12)}
                  strokeWidth="0.3"
                  animate={hold.isHolding ? { r: [55 + t * 10, 60 + t * 10, 55 + t * 10] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }} />

                {/* The morphing shape */}
                <motion.g
                  animate={{ rotate: rotation }}
                  transition={{ type: 'spring', stiffness: 30, damping: 20 }}
                  style={{ transformOrigin: '90px 90px' }}>
                  {/* Low t = blobby circle; high t = crystalline polygon */}
                  {t < 0.4 ? (
                    <motion.circle cx="90" cy="90" r={blobRadius}
                      fill={themeColor(TH.accentHSL, 0.04 + t * 0.04, 10)}
                      stroke={themeColor(TH.accentHSL, 0.08 + t * 0.06, 15)}
                      strokeWidth={0.5 + t}
                      animate={hold.isHolding ? {
                        rx: [blobRadius, blobRadius + 5, blobRadius - 3, blobRadius],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }} />
                  ) : (
                    <motion.polygon
                      points={polyPoints}
                      fill={themeColor(TH.accentHSL, 0.04 + t * 0.04, 10)}
                      stroke={themeColor(TH.accentHSL, 0.08 + t * 0.06, 15)}
                      strokeWidth={0.5 + t}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }} />
                  )}
                </motion.g>

                {/* Inner structure — emerges with progress */}
                {t > 0.3 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: t - 0.3 }}>
                    {Array.from({ length: Math.round(t * 6) }, (_, i) => {
                      const a = (i / 6) * Math.PI * 2;
                      const r = 15 + t * 5;
                      return (
                        <line key={i}
                          x1="90" y1="90"
                          x2={90 + Math.cos(a) * r} y2={90 + Math.sin(a) * r}
                          stroke={themeColor(TH.accentHSL, 0.06, 12)} strokeWidth="0.3" />
                      );
                    })}
                  </motion.g>
                )}

                {/* Phase label */}
                <text x="90" y="155" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.12 + t * 0.08, 10)} letterSpacing="0.1em">
                  {t < 0.2 ? 'DISSOLVING' : t < 0.4 ? 'GOO' : t < 0.6 ? 'REFORMING' : t < 0.8 ? 'CRYSTALLIZING' : 'EMERGED'}
                </text>
              </svg>
            </div>

            {/* Tension bar */}
            <div style={{ width: '140px', height: '3px', borderRadius: '2px', background: themeColor(TH.voidHSL, 0.4, 3) }}>
              <motion.div animate={{ width: `${t * 100}%` }}
                style={{ height: '100%', borderRadius: '2px',
                  background: themeColor(TH.accentHSL, 0.15 + t * 0.1, 12) }} />
            </div>

            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.5 }}>
                {hold.isHolding ? 'sustaining...' : 'press and hold'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You emerged. Not the same shape. Not the old shape. A new geometry. The discomfort was the transformation itself.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>liminal is not lost. liminal is becoming</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The goo was the point.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}