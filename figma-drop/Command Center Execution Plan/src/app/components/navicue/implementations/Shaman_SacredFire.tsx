/**
 * SHAMAN #4 — The Sacred Fire
 * "Feed the fire with intention. What you burn becomes light."
 * ARCHETYPE: Pattern E (Hold) — A single ember. Press and hold.
 * The fire grows from ember → flame → blaze → bonfire. Feed it with presence.
 * Fire ceremony. Transformative intention.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

export default function Shaman_SacredFire({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  const t = hold.tension;
  const fireHeight = 10 + t * 55;
  const fireWidth = 8 + t * 25;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            An ember...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Feed the fire with intention. What you burn becomes light. Hold. Let the flame grow. Do not look away.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold, feed the fire with your presence</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 200, 170).base }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Ground */}
                <line x1="40" y1="140" x2="160" y2="140"
                  stroke={themeColor(TH.primaryHSL, 0.04, 8)} strokeWidth="0.5" />

                {/* Fire pit stones */}
                {[55, 75, 95, 115, 135].map((x, i) => (
                  <ellipse key={i} cx={x + 5} cy="142" rx="8" ry="3"
                    fill={themeColor(TH.primaryHSL, 0.04 + t * 0.01, 8)} />
                ))}

                {/* Fire — grows with hold */}
                {/* Outer flame */}
                <motion.path
                  d={`M ${100 - fireWidth},140 Q ${100 - fireWidth * 0.6},${140 - fireHeight * 0.7} 100,${140 - fireHeight} Q ${100 + fireWidth * 0.6},${140 - fireHeight * 0.7} ${100 + fireWidth},140 Z`}
                  fill={`hsla(${15 + t * 10}, ${25 + t * 10}%, ${22 + t * 8}%, ${0.04 + t * 0.04})`}
                  animate={{
                    d: `M ${100 - fireWidth},140 Q ${100 - fireWidth * 0.6},${140 - fireHeight * 0.7} 100,${140 - fireHeight} Q ${100 + fireWidth * 0.6},${140 - fireHeight * 0.7} ${100 + fireWidth},140 Z`,
                  }}
                  transition={{ type: 'spring', stiffness: 20 }}
                />
                {/* Inner flame */}
                <motion.path
                  d={`M ${100 - fireWidth * 0.5},140 Q ${100 - fireWidth * 0.3},${140 - fireHeight * 0.5} 100,${140 - fireHeight * 0.7} Q ${100 + fireWidth * 0.3},${140 - fireHeight * 0.5} ${100 + fireWidth * 0.5},140 Z`}
                  fill={`hsla(${30 + t * 15}, ${28 + t * 12}%, ${28 + t * 10}%, ${0.05 + t * 0.05})`}
                />
                {/* Core */}
                {t > 0.2 && (
                  <motion.ellipse cx="100" cy={140 - fireHeight * 0.15} rx={fireWidth * 0.25} ry={fireHeight * 0.1}
                    fill={`hsla(${45}, ${30}%, ${35}%, ${0.06 + t * 0.04})`}
                    animate={{ rx: [fireWidth * 0.25, fireWidth * 0.3, fireWidth * 0.25] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}

                {/* Sparks */}
                {t > 0.4 && Array.from({ length: Math.floor(t * 8) }, (_, i) => (
                  <motion.circle key={`spark-${i}`}
                    cx={90 + i * 3} cy={140 - fireHeight * 0.8}
                    r="0.8"
                    fill={`hsla(35, 30%, 40%, ${0.06})`}
                    animate={{
                      cy: [140 - fireHeight * 0.8, 140 - fireHeight * 0.8 - 15 - i * 3],
                      opacity: [0.06, 0],
                      cx: [90 + i * 3, 85 + i * 5],
                    }}
                    transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}

                {/* Fire glow on ground */}
                <motion.ellipse cx="100" cy="142" rx={30 + t * 30} ry={5 + t * 3}
                  fill={`hsla(25, 25%, 25%, ${0.02 + t * 0.02})`}
                />

                {/* Status label */}
                <text x="100" y="162" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {hold.completed ? 'BONFIRE. what you burned became light' :
                   hold.isHolding ? `fire: ${t < 0.25 ? 'ember' : t < 0.5 ? 'flame' : t < 0.75 ? 'blaze' : 'bonfire'}` :
                   'press and hold. feed the fire'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'The fire is a bonfire. What you burned became light.' :
                 hold.isHolding ? `${t < 0.25 ? 'Ember glowing. Hold.' : t < 0.5 ? 'Flame rising. The stones warm.' : t < 0.75 ? 'Blaze. Sparks lifting.' : 'Bonfire. Almost sacred.'}` :
                 'A pit of stones. A single ember. Press and hold.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You held. The ember became flame, became blaze, became bonfire. Sparks rose into the darkness. The stones glowed. What you burned became light. Feed the fire with intention. Not everything is worth carrying. Some things are meant to be released into the fire and transformed.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Fire ceremony. The ritual act of symbolic release through fire activates neural circuits associated with emotional processing and letting go.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Ember. Flame. Light.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}