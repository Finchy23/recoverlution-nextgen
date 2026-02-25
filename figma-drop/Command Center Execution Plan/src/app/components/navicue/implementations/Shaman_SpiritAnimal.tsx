/**
 * SHAMAN #8 — The Spirit Animal
 * "Your spirit animal is not what you want to be. It is what you already are."
 * ARCHETYPE: Pattern A (Tap × 5) — Scattered traits float.
 * Each tap: traits coalesce. On the fifth: an animal silhouette emerges from the constellation.
 * Archetypal identity. Projective identification.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

const GATHER_STEPS = 5;
const TRAITS = [
  { sx: 30, sy: 25, label: 'patience', tx: 70, ty: 55 },
  { sx: 170, sy: 30, label: 'ferocity', tx: 130, ty: 55 },
  { sx: 25, sy: 100, label: 'silence', tx: 80, ty: 80 },
  { sx: 175, sy: 95, label: 'loyalty', tx: 120, ty: 80 },
  { sx: 100, sy: 130, label: 'endurance', tx: 100, ty: 100 },
];

export default function Shaman_SpiritAnimal({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [gathered, setGathered] = useState(0);

  const gather = () => {
    if (stage !== 'active' || gathered >= GATHER_STEPS) return;
    const next = gathered + 1;
    setGathered(next);
    if (next >= GATHER_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = gathered / GATHER_STEPS;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Traits scattered in the dark...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your spirit animal is not what you want to be. It is what you already are. Gather the scattered traits. See what emerges.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to gather each trait, watch the shape emerge</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={gather}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: gathered >= GATHER_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Traits — scatter → gather */}
                {TRAITS.map((trait, i) => {
                  const isGathered = i < gathered;
                  const cx = isGathered ? trait.tx : trait.sx;
                  const cy = isGathered ? trait.ty : trait.sy;
                  return (
                    <motion.g key={i}
                      animate={{ x: 0, y: 0 }}
                      transition={{ type: 'spring', stiffness: 30 }}>
                      <motion.circle cx={cx} cy={cy} r={isGathered ? 5 : 3}
                        fill={themeColor(isGathered ? TH.accentHSL : TH.primaryHSL, isGathered ? 0.06 + i * 0.01 : 0.03, isGathered ? 12 + i * 2 : 8)}
                        animate={{ cx, cy }}
                        transition={{ type: 'spring', stiffness: 25, damping: 8 }}
                      />
                      <motion.text x={cx} y={cy + (isGathered ? 12 : 8)} textAnchor="middle"
                        fontSize="11" fontFamily="Georgia, serif" fontStyle="italic"
                        fill={themeColor(isGathered ? TH.accentHSL : TH.primaryHSL, isGathered ? 0.06 : 0.03, 10)}
                        animate={{ x: cx, y: cy + (isGathered ? 12 : 8) }}
                        transition={{ type: 'spring', stiffness: 25 }}>
                        {trait.label}
                      </motion.text>
                    </motion.g>
                  );
                })}

                {/* Connection lines between gathered traits */}
                {gathered >= 2 && TRAITS.slice(0, gathered).map((t1, i) => {
                  if (i >= gathered - 1) return null;
                  const t2 = TRAITS[i + 1];
                  return (
                    <motion.line key={`conn-${i}`}
                      x1={t1.tx} y1={t1.ty} x2={t2.tx} y2={t2.ty}
                      stroke={themeColor(TH.accentHSL, 0.03, 10)}
                      strokeWidth="0.4" strokeDasharray="2 2"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    />
                  );
                })}

                {/* Animal silhouette — emerges at completion (wolf-like) */}
                {gathered >= GATHER_STEPS && (
                  <motion.path
                    d="M 75,60 Q 80,45 90,48 L 95,42 Q 98,48 100,48 Q 102,48 105,42 L 110,48 Q 120,45 125,60 Q 130,75 120,85 Q 115,100 100,105 Q 85,100 80,85 Q 70,75 75,60 Z"
                    fill={themeColor(TH.accentHSL, 0.04, 12)}
                    stroke={themeColor(TH.accentHSL, 0.06, 15)}
                    strokeWidth="0.4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 30, duration: 2 }}
                    style={{ transformOrigin: '100px 75px' }}
                  />
                )}

                <text x="100" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'EMERGED. the animal was always you' : `traits gathered: ${gathered}/${GATHER_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {gathered === 0 ? 'Five traits floating in darkness. Disconnected.' : gathered < GATHER_STEPS ? `"${TRAITS[gathered - 1].label}" gathered. The shape sharpens.` : 'All gathered. The animal emerged. It was always you.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: GATHER_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < gathered ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five traits: patience, ferocity, silence, loyalty, endurance. Scattered, then gathered. Lines connected. And from the constellation: an animal emerged. Not chosen. Revealed. Your spirit animal is not what you want to be. It is what you already are. The traits you carry already form the shape.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Projective identification. Archetypal animal imagery provides a symbolic container for integrating disparate personality traits into a coherent identity narrative.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Scatter. Gather. Emerge.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}