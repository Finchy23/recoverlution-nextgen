/**
 * MAGNUMOPUS #2 — The Crucible
 * "Hold it in the fire. That is the only instruction."
 * ARCHETYPE: Pattern E (Hold) — The crucible must be held steady.
 * Heat rises, elements fuse, impurities burn off.
 * Distress Tolerance — transformation requires endurance.
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

export default function MagnumOpus_Crucible({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const hold = useHoldInteraction({
    maxDuration: 7000,
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
  const heatHue = 30 + t * 18; // amber → orange
  const heatBright = 25 + t * 15;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The furnace awaits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              A crucible is a container that can withstand any temperature. Without it, there is no transformation, only destruction. You are the crucible. Hold steady.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to keep the fire burning</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 180, 200, 'sm').base }}>
              <svg width="100%" height="100%" viewBox="0 0 180 200">
                {/* Fire beneath crucible */}
                {hold.isHolding && Array.from({ length: 5 + Math.floor(t * 6) }, (_, i) => (
                  <motion.path key={i}
                    d={`M ${50 + i * 12} 195 Q ${52 + i * 12} ${170 - t * 20 - (i % 3) * 5} ${55 + i * 12} ${160 - t * 15}`}
                    fill="none"
                    stroke={`hsla(${heatHue - i * 3}, ${30 + t * 10}%, ${heatBright}%, ${0.06 + t * 0.06})`}
                    strokeWidth={0.5 + t * 0.3}
                    initial={{ d: `M ${50 + i * 12} 195 Q ${52 + i * 12} ${170 - t * 20} ${55 + i * 12} ${160 - t * 15}` }}
                    animate={{ d: [
                      `M ${50 + i * 12} 195 Q ${52 + i * 12} ${170 - t * 20} ${55 + i * 12} ${160 - t * 15}`,
                      `M ${50 + i * 12} 195 Q ${48 + i * 12} ${168 - t * 20} ${53 + i * 12} ${158 - t * 15}`,
                    ] }}
                    transition={{ duration: 0.4 + i * 0.1, repeat: Infinity, repeatType: 'reverse' }} />
                ))}

                {/* Crucible body */}
                <path d="M 55 90 L 50 155 Q 50 165 60 165 L 120 165 Q 130 165 130 155 L 125 90 Z"
                  fill={`hsla(${heatHue}, 15%, ${8 + t * 3}%, 0.9)`}
                  stroke={`hsla(${heatHue}, 20%, ${20 + t * 8}%, ${0.1 + t * 0.08})`}
                  strokeWidth="0.5" />

                {/* Rim */}
                <ellipse cx="90" cy="90" rx="38" ry="8"
                  fill="none"
                  stroke={`hsla(${heatHue}, 25%, ${25 + t * 10}%, ${0.1 + t * 0.08})`}
                  strokeWidth="0.5" />

                {/* Contents — bubbling with heat */}
                <ellipse cx="90" cy="95" rx="33" ry="5"
                  fill={`hsla(${heatHue}, ${20 + t * 12}%, ${12 + t * 15}%, ${0.3 + t * 0.3})`} />

                {/* Bubble particles */}
                {t > 0.2 && Array.from({ length: Math.floor(t * 8) }, (_, i) => (
                  <motion.circle key={i}
                    cx={70 + (i * 11) % 40} cy="95"
                    r={1 + (i % 2)}
                    fill={`hsla(${heatHue}, 30%, ${30 + t * 10}%, ${0.08 + t * 0.06})`}
                    initial={{ cy: 95, opacity: 0.1 }}
                    animate={{ cy: [95, 80 - i * 3], opacity: [0.1, 0] }}
                    transition={{ duration: 1 + i * 0.2, repeat: Infinity, delay: i * 0.15 }} />
                ))}

                {/* Impurity wisps — burn off as t grows */}
                {t > 0.3 && t < 0.8 && Array.from({ length: 3 }, (_, i) => (
                  <motion.circle key={`imp-${i}`}
                    cx={75 + i * 15} cy="85"
                    r="2"
                    fill={`hsla(0, 0%, ${10 + t * 5}%, ${0.06 * (1 - t)})`}
                    initial={{ cy: 85, opacity: 0.06 }}
                    animate={{ cy: [85, 30], opacity: [0.06, 0] }}
                    transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }} />
                ))}

                {/* Gold glow at high heat */}
                {t > 0.7 && (
                  <motion.ellipse cx="90" cy="95" rx="25" ry="4"
                    fill={`hsla(48, 35%, 45%, ${(t - 0.7) * 0.3})`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}

                {/* Temperature */}
                <text x="90" y="30" textAnchor="middle" fontSize="5" fontFamily="monospace"
                  fill={`hsla(${heatHue}, 25%, ${25 + t * 15}%, ${0.1 + t * 0.12})`}
                  letterSpacing="0.1em">
                  {t < 0.25 ? 'WARMING' : t < 0.5 ? 'BURNING' : t < 0.75 ? 'FUSING' : 'TRANSMUTING'}
                </text>
              </svg>
            </div>

            <div style={{ width: '140px', height: '3px', borderRadius: '2px', background: themeColor(TH.voidHSL, 0.4, 3) }}>
              <motion.div animate={{ width: `${t * 100}%` }}
                style={{ height: '100%', borderRadius: '2px',
                  background: `hsla(${heatHue}, 30%, ${30 + t * 12}%, ${0.15 + t * 0.2})` }} />
            </div>

            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.5 }}>
                {hold.isHolding ? 'hold it in the fire...' : 'press and hold'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The fire burned everything that was not gold. What remains is the real you, not the impurities you mistook for identity. The crucible held. You held.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>you are the crucible</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Hold steady.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}