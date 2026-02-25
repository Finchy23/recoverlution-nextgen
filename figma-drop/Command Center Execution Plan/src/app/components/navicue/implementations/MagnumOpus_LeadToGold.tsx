/**
 * MAGNUMOPUS #3 — Lead to Gold
 * "The weight lifts as the value rises."
 * ARCHETYPE: Pattern B (Drag) — Drag upward to transmute.
 * A dense dark mass gradually lightens and brightens.
 * Post-Traumatic Growth — suffering as raw material.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNUMOPUS_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Ember');
const TH = MAGNUMOPUS_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function MagnumOpus_LeadToGold({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const drag = useDragInteraction({
    axis: 'y', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = drag.progress;
  // Lead → Gold color interpolation
  const hue = 0 + t * 48;
  const sat = 0 + t * 30;
  const light = 8 + t * 32;
  const mc = (a: number, lo = 0) => `hsla(${hue}, ${sat}%, ${Math.min(100, light + lo)}%, ${a})`;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something heavy stirs...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Lead and gold contain the same number of protons, give or take three. The distance between worthless and priceless is smaller than you think. Lift the weight.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag upward to transmute</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '180px', height: '180px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180">
                {/* Background glow */}
                <circle cx="90" cy="90" r={40 + t * 20}
                  fill={mc(0.04, 10)} />

                {/* The mass — shrinks and brightens */}
                <motion.circle cx="90" cy="90"
                  r={40 - t * 12}
                  fill={mc(0.85)}
                  stroke={mc(0.15, 15)}
                  strokeWidth="0.5"
                  animate={{ r: [40 - t * 12, 42 - t * 12, 40 - t * 12] }}
                  transition={{ duration: 2, repeat: Infinity }} />

                {/* Weight lines — disappear with transmutation */}
                {t < 0.7 && Array.from({ length: 3 }, (_, i) => (
                  <motion.line key={i}
                    x1="90" y1={95 + i * 6}
                    x2="90" y2={125 + i * 4}
                    stroke={mc(0.06 * (1 - t), 5)}
                    strokeWidth="0.4"
                    animate={{ opacity: [0.04, 0.08, 0.04] }}
                    transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }} />
                ))}

                {/* Luster sparkles — appear with gold */}
                {t > 0.4 && Array.from({ length: Math.floor((t - 0.4) * 10) }, (_, i) => {
                  const ang = (i / 6) * Math.PI * 2 + t * 2;
                  const r = 25 + (i % 3) * 8;
                  return (
                    <motion.circle key={i}
                      cx={90 + Math.cos(ang) * r} cy={90 + Math.sin(ang) * r}
                      r="1"
                      fill={`hsla(48, 35%, ${45 + i * 3}%, ${0.06 + (t - 0.4) * 0.1})`}
                      animate={{ opacity: [0.04, 0.12, 0.04] }}
                      transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }} />
                  );
                })}

                {/* Labels */}
                <text x="30" y="170" fontSize="5" fontFamily="monospace"
                  fill={`hsla(0, 0%, 15%, ${0.1 * (1 - t)})`} letterSpacing="0.08em">
                  LEAD
                </text>
                <text x="130" y="170" fontSize="5" fontFamily="monospace"
                  fill={`hsla(48, 30%, 40%, ${0.1 * t})`} letterSpacing="0.08em">
                  GOLD
                </text>
              </svg>
            </div>

            <div style={{ fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.1em',
              color: mc(0.15 + t * 0.1, 8) }}>
              {t > 0.9 ? 'TRANSMUTED' : `${Math.round(t * 100)}%`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Gold. The weight is gone but the mass remains. Nothing was added. Nothing was removed. Only the arrangement changed. That{'\u2019'}s what growth is: not more, not less, just reorganized.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>reorganization, not addition</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The weight lifts.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}