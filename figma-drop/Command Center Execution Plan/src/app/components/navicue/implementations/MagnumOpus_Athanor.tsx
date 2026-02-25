/**
 * MAGNUMOPUS #7 — The Athanor
 * "The furnace that never goes out. Some fires must burn forever."
 * ARCHETYPE: Pattern E (Hold) — The alchemist's eternal furnace.
 * Hold to keep the fire burning. Inner temperature gauge rises.
 * A flame sustained by will alone.
 * Sustained Attention / Grit — long transformation requires long fire.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNUMOPUS_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Ember');
const TH = MAGNUMOPUS_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function MagnumOpus_Athanor({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const hold = useHoldInteraction({
    maxDuration: 8000,
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
  const flameHue = 30 + t * 12;
  const flameBright = 18 + t * 18;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Embers glow...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The athanor is the furnace the alchemist never lets go out. Some transformations take years. The trick is not intensity, it is constancy. Keep the fire burning.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to sustain the flame</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 160, 200, 'sm').base }}>
              <svg width="100%" height="100%" viewBox="0 0 160 200">
                {/* Furnace body — tower shape */}
                <path d="M 50 60 L 45 170 Q 45 180 55 180 L 105 180 Q 115 180 115 170 L 110 60 Q 110 45 80 45 Q 50 45 50 60 Z"
                  fill={`hsla(${flameHue}, 12%, ${6 + t * 2}%, 0.85)`}
                  stroke={`hsla(${flameHue}, 18%, ${15 + t * 6}%, ${0.06 + t * 0.06})`}
                  strokeWidth="0.5" />

                {/* Furnace opening / viewport */}
                <ellipse cx="80" cy="130" rx="18" ry="12"
                  fill={`hsla(${flameHue}, ${15 + t * 15}%, ${8 + t * 12}%, 0.9)`}
                  stroke={`hsla(${flameHue}, 20%, ${20 + t * 10}%, ${0.1 + t * 0.05})`}
                  strokeWidth="0.5" />

                {/* Flame inside viewport */}
                {(hold.isHolding || t > 0) && Array.from({ length: 3 + Math.floor(t * 4) }, (_, i) => (
                  <motion.path key={i}
                    d={`M ${72 + i * 5} 138 Q ${73 + i * 5} ${120 - t * 15 - (i % 2) * 5} ${75 + i * 5} ${115 - t * 12}`}
                    fill="none"
                    stroke={`hsla(${flameHue + i * 3}, ${25 + t * 12}%, ${flameBright + i * 2}%, ${0.08 + t * 0.08})`}
                    strokeWidth={0.6 + t * 0.4}
                    animate={{
                      d: [
                        `M ${72 + i * 5} 138 Q ${73 + i * 5} ${120 - t * 15} ${75 + i * 5} ${115 - t * 12}`,
                        `M ${72 + i * 5} 138 Q ${71 + i * 5} ${118 - t * 15} ${74 + i * 5} ${113 - t * 12}`,
                      ],
                    }}
                    transition={{ duration: 0.3 + i * 0.1, repeat: Infinity, repeatType: 'reverse' }} />
                ))}

                {/* Heat waves rising from top */}
                {t > 0.3 && Array.from({ length: Math.floor((t - 0.3) * 6) }, (_, i) => (
                  <motion.path key={`hw-${i}`}
                    d={`M ${65 + i * 8} 50 Q ${68 + i * 8} 40 ${70 + i * 8} 30`}
                    fill="none"
                    stroke={`hsla(${flameHue}, 15%, ${15 + t * 8}%, ${0.03 + t * 0.02})`}
                    strokeWidth="0.4"
                    animate={{ opacity: [0.02, 0.06, 0.02] }}
                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }} />
                ))}

                {/* Temperature gauge on left */}
                <rect x="25" y="60" width="6" height="120" rx="3"
                  fill={`hsla(${flameHue}, 8%, 6%, 0.6)`}
                  stroke={`hsla(${flameHue}, 12%, 12%, 0.1)`} strokeWidth="0.3" />
                <motion.rect x="25" width="6" rx="3"
                  initial={{ y: 180, height: 0 }}
                  animate={{ y: 60 + 120 * (1 - t), height: 120 * t }}
                  style={{ fill: `hsla(${flameHue}, ${20 + t * 15}%, ${flameBright}%, ${0.2 + t * 0.3})` }} />

                {/* Phase */}
                <text x="80" y="25" textAnchor="middle" fontSize="5" fontFamily="monospace"
                  fill={`hsla(${flameHue}, 22%, ${20 + t * 15}%, ${0.08 + t * 0.1})`} letterSpacing="0.1em">
                  {t < 0.25 ? 'EMBER' : t < 0.5 ? 'FLAME' : t < 0.75 ? 'BLAZE' : 'ETERNAL'}
                </text>
              </svg>
            </div>

            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.5 }}>
                {hold.isHolding ? 'the fire burns...' : 'press and hold'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The eternal furnace. Not the hottest flame, the most constant one. Angela Duckworth calls it grit. The alchemists called it patience. The athanor never asks when. It just burns.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>constancy, not intensity</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The furnace never goes out.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}