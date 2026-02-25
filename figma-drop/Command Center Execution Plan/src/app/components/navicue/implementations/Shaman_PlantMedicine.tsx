/**
 * SHAMAN #2 — The Plant Medicine
 * "The roots go deeper than you think. What grows below feeds what blooms above."
 * ARCHETYPE: Pattern B (Drag) — A seedling at center. Drag downward.
 * Roots spread and deepen, then the plant blooms upward.
 * Mycorrhizal networks. Below-surface growth.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { useDragInteraction } from '../interactions/useDragInteraction';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

export default function Shaman_PlantMedicine({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const drag = useDragInteraction({
    axis: 'y', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  const t = drag.progress;
  const rootDepth = t * 55;
  const bloomHeight = Math.max(0, (t - 0.5) * 2) * 30;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A seed in the earth...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The roots go deeper than you think. What grows below feeds what blooms above. Go deep before you go high.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag downward, send the roots deeper</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Soil line */}
                <line x1="0" y1="80" x2="200" y2="80"
                  stroke={themeColor(TH.primaryHSL, 0.05, 8)} strokeWidth="0.5" />
                {/* Soil texture below */}
                <rect x="0" y="80" width="200" height="100"
                  fill={themeColor(TH.primaryHSL, 0.02, 3)} />

                {/* Roots — spread with drag */}
                {[
                  { dx: 0, curve: -15 },
                  { dx: -20, curve: -25 },
                  { dx: 20, curve: -20 },
                  { dx: -35, curve: -10 },
                  { dx: 35, curve: -15 },
                  { dx: -12, curve: -30 },
                  { dx: 12, curve: -28 },
                ].map((root, i) => {
                  const visible = t > i * 0.1;
                  if (!visible) return null;
                  const depth = Math.min(1, (t - i * 0.1) / 0.4) * rootDepth;
                  return (
                    <motion.path key={i}
                      d={`M 100,82 Q ${100 + root.dx + root.curve},${82 + depth * 0.6} ${100 + root.dx * 1.5},${82 + depth}`}
                      fill="none"
                      stroke={themeColor(TH.primaryHSL, 0.04 + t * 0.02, 8 + i * 2)}
                      strokeWidth={0.6 + (1 - i * 0.08)}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                    />
                  );
                })}

                {/* Mycorrhizal network nodes */}
                {t > 0.3 && Array.from({ length: 5 }, (_, i) => {
                  const nx = 60 + i * 22 + (i % 2) * 8;
                  const ny = 100 + i * 8 + (i % 3) * 5;
                  return (
                    <motion.circle key={`myc-${i}`} cx={nx} cy={ny} r={1 + t}
                      fill={themeColor(TH.accentHSL, 0.04 + t * 0.02, 10)}
                      initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.04 + t * 0.02) }}
                      transition={{ delay: i * 0.15 }}
                    />
                  );
                })}

                {/* Stem — grows above soil when roots are deep enough */}
                {t > 0.3 && (
                  <motion.line x1="100" y1="80" x2="100" y2={80 - bloomHeight * 0.8}
                    stroke={themeColor(TH.accentHSL, 0.05 + t * 0.03, 12)}
                    strokeWidth={0.8 + t * 0.4}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                  />
                )}

                {/* Bloom — only when roots are very deep */}
                {bloomHeight > 5 && (
                  <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 40 }}>
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                      <motion.ellipse key={i}
                        cx={100 + Math.cos(angle * Math.PI / 180) * 6}
                        cy={80 - bloomHeight * 0.8 + Math.sin(angle * Math.PI / 180) * 6}
                        rx="4" ry="2.5"
                        fill={themeColor(TH.accentHSL, 0.05 + (t - 0.5) * 0.06, 15)}
                        transform={`rotate(${angle}, ${100 + Math.cos(angle * Math.PI / 180) * 6}, ${80 - bloomHeight * 0.8 + Math.sin(angle * Math.PI / 180) * 6})`}
                      />
                    ))}
                    <circle cx="100" cy={80 - bloomHeight * 0.8} r="3"
                      fill={themeColor(TH.accentHSL, 0.08 + (t - 0.5) * 0.06, 18)} />
                  </motion.g>
                )}

                <text x="100" y="174" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 0.95 ? 'BLOOMED. roots fed the flower' : `roots: ${Math.round(rootDepth)}px deep`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.15 ? 'A seedling. The roots have barely begun.' : t < 0.5 ? 'Roots spreading. The mycorrhizal network connects.' : t < 0.95 ? 'Deep roots. The bloom is emerging above.' : 'Full bloom. What grew below fed what blooms above.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You dragged down. Roots spread, seven tendrils reaching into the dark soil, finding the mycorrhizal network. Only then: the stem rose. The bloom opened. The roots go deeper than you think. What grows below feeds what blooms above. Go deep before you go high.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Mycorrhizal wisdom. Below-surface preparation and invisible network-building are prerequisites for visible growth. The bloom is the last step, not the first.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Seed. Root. Bloom.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}