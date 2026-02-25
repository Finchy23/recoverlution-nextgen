/**
 * SHAMAN #9 — The Vision Quest
 * "Go alone into the wild. Sit with nothing. What comes to you is the vision."
 * ARCHETYPE: Pattern B (Drag) — A barren landscape. Drag upward.
 * The landscape transforms: desert → prairie → forest → mountain → sky.
 * Liminal journey. Transformative solitude.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { useDragInteraction } from '../interactions/useDragInteraction';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

const PHASES = ['desert', 'prairie', 'forest', 'mountain', 'sky'];

export default function Shaman_VisionQuest({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const drag = useDragInteraction({
    axis: 'y', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  const t = drag.progress;
  const phaseIdx = Math.min(4, Math.floor(t * 5));
  const phase = PHASES[phaseIdx];
  const hue = 28 + t * 30; // warm ochre → cooler sky
  const sat = 25 - t * 10;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Alone. Empty. Waiting.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Go alone into the wild. Sit with nothing. What comes to you is the vision. The landscape transforms as you journey. Do not stop.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag upward, journey through the landscape</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
                background: `hsla(${hue}, ${sat}%, ${5 + t * 4}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Horizon line */}
                <line x1="0" y1={90 - t * 20} x2="220" y2={90 - t * 20}
                  stroke={`hsla(${hue}, ${sat}%, ${15 + t * 8}%, 0.04)`} strokeWidth="0.3" />

                {/* Desert phase — dunes */}
                {t < 0.3 && (
                  <g opacity={1 - t * 3}>
                    <path d="M 0,100 Q 55,75 110,100 Q 165,80 220,100 L 220,140 L 0,140 Z"
                      fill={`hsla(28, 25%, 15%, 0.04)`} />
                    {[40, 100, 160].map((x, i) => (
                      <circle key={i} cx={x} cy={85 + i * 3} r="1"
                        fill={`hsla(28, 20%, 20%, 0.03)`} />
                    ))}
                  </g>
                )}

                {/* Prairie phase — grass */}
                {t >= 0.15 && t < 0.5 && (
                  <g opacity={Math.min(1, (t - 0.15) * 5) * Math.min(1, (0.5 - t) * 5)}>
                    {Array.from({ length: 20 }, (_, i) => (
                      <line key={i} x1={10 + i * 10} y1={85 - t * 15}
                        x2={10 + i * 10 + (i % 2 ? 2 : -2)} y2={75 - t * 15}
                        stroke={`hsla(90, 10%, 22%, 0.04)`} strokeWidth="0.4" />
                    ))}
                  </g>
                )}

                {/* Forest phase — trees */}
                {t >= 0.35 && t < 0.7 && (
                  <g opacity={Math.min(1, (t - 0.35) * 5) * Math.min(1, (0.7 - t) * 4)}>
                    {[30, 60, 90, 120, 150, 180].map((x, i) => (
                      <g key={i}>
                        <line x1={x} y1={80 - t * 15} x2={x} y2={60 - t * 15}
                          stroke={`hsla(28, 15%, 18%, 0.04)`} strokeWidth="0.8" />
                        <polygon points={`${x},${52 - t * 15} ${x - 8},${68 - t * 15} ${x + 8},${68 - t * 15}`}
                          fill={`hsla(120, 8%, 18%, 0.03)`} />
                      </g>
                    ))}
                  </g>
                )}

                {/* Mountain phase — peaks */}
                {t >= 0.55 && t < 0.9 && (
                  <g opacity={Math.min(1, (t - 0.55) * 4) * Math.min(1, (0.9 - t) * 4)}>
                    <polygon points="60,80 110,30 160,80"
                      fill={`hsla(28, 12%, 12%, 0.04)`} stroke={`hsla(28, 12%, 18%, 0.03)`} strokeWidth="0.3" />
                    <polygon points="30,85 70,45 110,85"
                      fill={`hsla(28, 10%, 10%, 0.03)`} />
                    <polygon points="120,85 165,40 200,85"
                      fill={`hsla(28, 10%, 10%, 0.03)`} />
                  </g>
                )}

                {/* Sky phase — stars */}
                {t >= 0.75 && (
                  <g opacity={(t - 0.75) * 4}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <motion.circle key={i}
                        cx={20 + (i * 37 + i * i * 5) % 185}
                        cy={10 + (i * 19 + i * 7) % 60}
                        r={0.8 + (i % 3) * 0.4}
                        fill={`hsla(${50 + i * 20}, 12%, ${30 + i * 3}%, ${0.05 + (t - 0.75) * 0.04})`}
                        animate={{ opacity: [0.05, 0.08, 0.05] }}
                        transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                      />
                    ))}
                  </g>
                )}

                {/* Seeker figure — always at center bottom */}
                <circle cx="110" cy={105 - t * 15} r="3"
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.04, 12 + t * 6)} />
                <rect x="108" y={108 - t * 15} width="4" height="8" rx="1"
                  fill={themeColor(TH.accentHSL, 0.05 + t * 0.03, 10 + t * 5)} />

                <text x="110" y="133" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${hue}, ${sat}%, ${20 + t * 15}%, ${0.05 + t * 0.04})`}>
                  {t >= 0.95 ? 'VISION RECEIVED. the sky opened' : phase}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'A barren landscape. You stand alone.' : t < 0.3 ? 'Desert. Dry wind. Nothing but sand.' : t < 0.5 ? 'Prairie. Grass whispers. Life stirs.' : t < 0.7 ? 'Forest. Trees surround. The air changes.' : t < 0.95 ? 'Mountain peaks. The sky is opening.' : 'Sky. Stars. The vision comes.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Desert. Prairie. Forest. Mountain. Sky. You journeyed alone through five landscapes, each one transforming as you moved. The vision quest is the oldest technology for clarity: remove all input, walk into the unknown, sit with nothing. What comes to you is the vision. It was always there. You just needed the emptiness to see it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Liminal journey. Deliberately entering a threshold state, removing familiar inputs and sitting with uncertainty, activates the brain's default mode network, enabling novel connections and insights.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Desert. Mountain. Vision.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}