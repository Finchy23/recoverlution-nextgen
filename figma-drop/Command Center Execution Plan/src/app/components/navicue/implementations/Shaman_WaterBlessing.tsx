/**
 * SHAMAN #7 — The Water Blessing
 * "Water does not fight. It finds the way. Bless what flows through you."
 * ARCHETYPE: Pattern E (Hold) — A dry basin. Press and hold.
 * Water rises slowly, filling the basin. At full: a ripple blesses outward.
 * Water ceremony. Acceptance and flow.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

export default function Shaman_WaterBlessing({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const svgId = useId();
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  const t = hold.tension;
  const waterLevel = 130 - t * 70; // 130→60 (rises)

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A dry basin...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Water does not fight. It finds the way. Bless what flows through you. Let the basin fill.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold, let the water rise</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 200, 160).base }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Basin shape */}
                <path d="M 40,55 Q 40,135 100,135 Q 160,135 160,55"
                  fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.06, 10)}
                  strokeWidth="1" />

                {/* Water surface */}
                <motion.clipPath id={`${svgId}-basinClip`}>
                  <path d="M 40,55 Q 40,135 100,135 Q 160,135 160,55 Z" />
                </motion.clipPath>
                <motion.rect
                  x="40" y={waterLevel} width="120" height={135 - waterLevel}
                  fill={`hsla(200, 12%, 22%, ${0.03 + t * 0.04})`}
                  clipPath={`url(#${svgId}-basinClip)`}
                  animate={{ y: waterLevel }}
                  transition={{ type: 'spring', stiffness: 15 }}
                />

                {/* Water surface line with slight wave */}
                {t > 0.05 && (
                  <motion.path
                    d={`M 45,${waterLevel} Q 72,${waterLevel - 2} 100,${waterLevel} Q 128,${waterLevel + 2} 155,${waterLevel}`}
                    fill="none"
                    stroke={`hsla(200, 15%, 28%, ${0.04 + t * 0.03})`}
                    strokeWidth="0.5"
                    animate={{
                      d: [
                        `M 45,${waterLevel} Q 72,${waterLevel - 2} 100,${waterLevel} Q 128,${waterLevel + 2} 155,${waterLevel}`,
                        `M 45,${waterLevel} Q 72,${waterLevel + 2} 100,${waterLevel} Q 128,${waterLevel - 2} 155,${waterLevel}`,
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}

                {/* Blessing ripples at completion */}
                {hold.completed && [1, 2, 3].map(ring => (
                  <motion.circle key={ring} cx="100" cy={waterLevel}
                    fill="none"
                    stroke={`hsla(200, 12%, 25%, 0.04)`}
                    strokeWidth="0.4"
                    initial={{ r: 5 }}
                    animate={{ r: [5, 40 + ring * 15], opacity: [0.04, 0] }}
                    transition={{ duration: 2 + ring * 0.5, delay: ring * 0.3, repeat: Infinity }}
                  />
                ))}

                {/* Stone edge details */}
                {[45, 65, 85, 105, 125, 145].map((sx, i) => (
                  <circle key={i} cx={sx + 5} cy={55 + (i % 2) * 2} r="2"
                    fill={themeColor(TH.primaryHSL, 0.03 + t * 0.01, 6)} />
                ))}

                <text x="100" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {hold.completed ? 'BLESSED. the water overflows' :
                   hold.isHolding ? `filling: ${Math.round(t * 100)}%` :
                   'press and hold. let it fill'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'Full. The blessing ripples outward from the surface.' :
                 hold.isHolding ? `${t < 0.3 ? 'A trickle. The basin is barely wet.' : t < 0.6 ? 'Rising. The water finds its level.' : t < 0.9 ? 'Nearly full. The surface shimmers.' : 'Overflowing.'}` :
                 'A dry stone basin. Ancient. Empty. Press and hold.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.25, 0.5, 0.75, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You held. The basin filled, a trickle, then a steady rise, then a shimmer at the surface. At full: ripples of blessing, radiating outward. Water does not fight. It finds the way. Bless what flows through you. Do not force. Let it fill. Let it overflow.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Water ceremony. The ritual of patience and acceptance, allowing rather than forcing, mirrors the psychological principle that non-resistant awareness enables natural healing.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dry. Fill. Bless.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}