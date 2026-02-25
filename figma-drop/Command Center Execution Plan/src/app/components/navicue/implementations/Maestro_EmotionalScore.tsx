/**
 * MAESTRO #3 — The Emotional Score
 * "Every great speech is an opera. The words are the libretto. The emotion is the music."
 * ARCHETYPE: Pattern B (Drag) — A score with emotion line. Drag to compose
 * the emotional arc: low→build→peak→valley→resolve. Story arc.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

export default function Maestro_EmotionalScore({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  const t = drag.progress;
  // The emotional arc: low→build→peak→valley→resolve
  const arcY = (x: number) => {
    if (x < 0.2) return 90 - x * 50;
    if (x < 0.5) return 80 - (x - 0.2) * 200;
    if (x < 0.7) return 20 + (x - 0.5) * 200;
    return 60 - (x - 0.7) * 100;
  };

  const labels = [
    { x: 0.1, label: 'setup', y: 85 },
    { x: 0.35, label: 'build', y: 50 },
    { x: 0.5, label: 'PEAK', y: 18 },
    { x: 0.65, label: 'valley', y: 55 },
    { x: 0.9, label: 'resolve', y: 35 },
  ];

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The score is blank...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every great speech is an opera. The words are the libretto. The emotion is the music. Compose the arc: setup, build, peak, valley, resolve.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag across to compose the emotional arc</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '240px', height: '120px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 120" style={{ position: 'absolute', inset: 0 }}>
                {/* Staff lines */}
                {[25, 40, 55, 70, 85].map(y => (
                  <line key={y} x1="15" y1={y} x2="225" y2={y}
                    stroke={themeColor(TH.primaryHSL, 0.02)} strokeWidth="0.3" />
                ))}

                {/* Emotional arc — drawn up to current progress */}
                <motion.path
                  d={Array.from({ length: Math.floor(t * 50) + 1 }, (_, i) => {
                    const x = 15 + (i / 50) * 210;
                    const y = arcY(i / 50);
                    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.1 + t * 0.06, 18)}
                  strokeWidth={1 + t * 0.5}
                  strokeLinecap="round"
                />

                {/* Arc labels — appear as you pass them */}
                {labels.map((l, i) => (
                  t >= l.x && (
                    <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}>
                      <text x={15 + l.x * 210} y={l.y - 6} textAnchor="middle" fontSize={l.label === 'PEAK' ? '4.5' : '3'}
                        fontFamily="monospace" fontWeight={l.label === 'PEAK' ? 'bold' : 'normal'}
                        fill={themeColor(TH.accentHSL, l.label === 'PEAK' ? 0.12 : 0.06, 15)}>
                        {l.label}
                      </text>
                    </motion.g>
                  )
                ))}

                {/* Playhead */}
                <motion.line x1={15 + t * 210} y1="15" x2={15 + t * 210} y2="95"
                  stroke={themeColor(TH.accentHSL, 0.05, 15)}
                  strokeWidth="0.5" strokeDasharray="1 2"
                  initial={{ x1: 15, x2: 15 }}
                  animate={{ x1: 15 + t * 210, x2: 15 + t * 210 }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Progress */}
                <text x="120" y="110" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 0.95 ? 'ARC COMPLETE. the opera is written' : `composing: ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'A blank score. The first note awaits.' : t < 0.3 ? 'Setup. Low, steady. Building trust.' : t < 0.55 ? 'Building toward the peak. Tension rising.' : t < 0.75 ? 'The valley after the peak. The contrast.' : t < 0.95 ? 'Resolving. Landing. Coming home.' : 'The arc is complete. Setup → Build → Peak → Valley → Resolve.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You composed the arc. Setup: low, grounding. Build: tension rising. PEAK: the emotional crest. Valley: the drop that makes the peak feel higher. Resolve: landing softly. Five movements. One emotional opera. The words are the libretto. The emotion is the music.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Story arc / emotional architecture. The human brain is wired for narrative arcs with rising action, climax, and resolution. This shape triggers cortisol (tension) and oxytocin (release).</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Setup. Peak. Resolve.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}