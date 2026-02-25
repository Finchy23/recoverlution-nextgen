/**
 * MAESTRO #8 — The Tension Arc
 * "Every great story is built on one principle: create tension, then release it."
 * ARCHETYPE: Pattern E (Hold) — A rubber band stretches as you hold.
 * Tension meter climbs. At max: release. The snap is felt, not heard.
 * Dramatic structure. Tension/release cycle.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

export default function Maestro_TensionArc({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [released, setReleased] = useState(false);
  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setReleased(true);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  const t = hold.tension;
  const stretch = t * 80; // band stretches outward

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Tension building...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every great story is built on one principle: create tension, then release it. The longer the stretch, the greater the snap. Build. Hold. Let go.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold to stretch the tension to the limit</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 220, 160).base }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Tension arc — parabolic curve that stretches */}
                <motion.path
                  d={released
                    ? 'M 30,80 Q 110,80 190,80'
                    : `M 30,80 Q 110,${80 - stretch} 190,80`
                  }
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.08 + t * 0.08, 12 + t * 15)}
                  strokeWidth={1 + t * 1.5}
                  strokeLinecap="round"
                  animate={{
                    d: released
                      ? 'M 30,80 Q 110,80 190,80'
                      : `M 30,80 Q 110,${80 - stretch} 190,80`,
                  }}
                  transition={released
                    ? { type: 'spring', stiffness: 300, damping: 8 }
                    : { type: 'spring', stiffness: 30 }
                  }
                />

                {/* Anchor points */}
                <circle cx="30" cy="80" r="4"
                  fill={themeColor(TH.primaryHSL, 0.08, 10)} />
                <circle cx="190" cy="80" r="4"
                  fill={themeColor(TH.primaryHSL, 0.08, 10)} />

                {/* Tension meter — vertical bar left side */}
                <rect x="10" y="15" width="6" height="130" rx="3"
                  fill={themeColor(TH.primaryHSL, 0.03)} />
                <motion.rect x="10" y={145 - t * 130} width="6" height={t * 130} rx="3"
                  fill={`hsla(${t * 40}, ${10 + t * 20}%, ${20 + t * 15}%, ${0.06 + t * 0.06})`}
                  initial={{ y: 145, height: 0 }}
                  animate={{ y: 145 - t * 130, height: t * 130 }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Vibration lines at high tension */}
                {t > 0.6 && !released && Array.from({ length: 5 }, (_, i) => (
                  <motion.g key={i}
                    initial={{ y: 0 }}
                    animate={{ y: [0, -2, 2, -1, 0] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  >
                    <line
                      x1={60 + i * 25} y1={80 - stretch * 0.4 + Math.sin(i * 2) * 5}
                      x2={60 + i * 25} y2={80 - stretch * 0.4 + Math.sin(i * 2) * 5 + 3}
                      stroke={themeColor(TH.accentHSL, 0.04, 15)}
                      strokeWidth="0.4"
                    />
                  </motion.g>
                ))}

                {/* Release shockwave */}
                {released && (
                  <motion.circle cx="110" cy="80" r="5"
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.08, 18)}
                    strokeWidth="0.5"
                    initial={{ r: 5, opacity: 0.08 }}
                    animate={{ r: [5, 60], opacity: [0.08, 0] }}
                    transition={{ duration: 1.5 }}
                  />
                )}

                {/* Status */}
                <text x="110" y="152" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {released ? 'RELEASED. the snap was felt' :
                   hold.isHolding ? `tension: ${Math.round(t * 100)}%` :
                   'press and hold to build tension'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {released ? 'The arc collapsed. The tension released. The snap, felt in the body.' :
                 hold.isHolding ? `${t < 0.3 ? 'Building. The arc rises.' : t < 0.7 ? 'Stretching. The vibrations begin.' : 'Maximum tension. Almost at the breaking point.'}` :
                 'A rubber band between two points. Press and hold.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You held. The arc stretched higher, vibrating, trembling at the peak. Then: release. The shockwave rippled outward. The snap was felt, not heard. Every great story is built on this: create tension, then release it. The longer the stretch, the greater the impact. In conversation, in performance, in life: build, hold, release.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Dramatic structure. The tension/release cycle is the fundamental unit of emotional engagement across all narrative forms.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Build. Hold. Snap.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}