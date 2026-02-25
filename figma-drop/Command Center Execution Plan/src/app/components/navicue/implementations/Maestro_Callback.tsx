/**
 * MAESTRO #7 — The Callback
 * "The masters do not invent new themes. They return to old ones — transformed."
 * ARCHETYPE: Pattern A (Tap × 5) — Musical motifs appear. Each tap "calls back"
 * a previous motif, but transformed — inverted, harmonized, fragmented.
 * Thematic recurrence. Narrative echo.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

const CALLBACK_STEPS = 5;
const MOTIFS = [
  { notes: [60, 80, 50, 70, 55], label: 'original theme', transform: 'none' },
  { notes: [55, 70, 50, 80, 60], label: 'inverted', transform: 'mirror' },
  { notes: [70, 60, 80, 55, 50], label: 'retrograde', transform: 'reverse' },
  { notes: [60, 80, 60, 80, 60], label: 'augmented', transform: 'stretch' },
  { notes: [60, 80, 50, 70, 55], label: 'return, transformed', transform: 'glow' },
];

export default function Maestro_Callback({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [callbacks, setCallbacks] = useState(0);

  const callback = () => {
    if (stage !== 'active' || callbacks >= CALLBACK_STEPS) return;
    const next = callbacks + 1;
    setCallbacks(next);
    if (next >= CALLBACK_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = callbacks / CALLBACK_STEPS;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A theme, waiting to return...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The masters do not invent new themes. They return to old ones, transformed. Each callback deepens the meaning. The echo is louder than the original.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to call back each motif</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={callback}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: callbacks >= CALLBACK_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '230px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 230 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Staff lines */}
                {Array.from({ length: 5 }, (_, i) => (
                  <line key={i} x1="15" y1={35 + i * 18} x2="215" y2={35 + i * 18}
                    stroke={themeColor(TH.primaryHSL, 0.03, 8)} strokeWidth="0.3" />
                ))}

                {/* Ghost traces of previous motifs */}
                {MOTIFS.slice(0, callbacks).map((motif, mi) => (
                  <g key={mi} opacity={mi < callbacks - 1 ? 0.15 : 1}>
                    {motif.notes.map((note, ni) => {
                      const x = 30 + ni * 40;
                      const y = 130 - note;
                      const isCurrent = mi === callbacks - 1;
                      return (
                        <motion.g key={`${mi}-${ni}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: isCurrent ? 0.8 : 0.15, y: 0 }}
                          transition={{ delay: ni * 0.08, duration: 0.5 }}>
                          <ellipse cx={x} cy={y} rx="5" ry="3.5"
                            fill={isCurrent
                              ? themeColor(TH.accentHSL, 0.12 + mi * 0.02, 15 + mi * 3)
                              : themeColor(TH.primaryHSL, 0.04, 8)
                            }
                            transform={`rotate(-15, ${x}, ${y})`}
                          />
                          {/* Stem */}
                          <line x1={x + 4.5} y1={y} x2={x + 4.5} y2={y - 18}
                            stroke={isCurrent
                              ? themeColor(TH.accentHSL, 0.08 + mi * 0.015, 12)
                              : themeColor(TH.primaryHSL, 0.03, 8)
                            }
                            strokeWidth="0.5" />
                        </motion.g>
                      );
                    })}
                    {/* Transform label */}
                    {mi === callbacks - 1 && (
                      <motion.text x="115" y="148" textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={themeColor(TH.accentHSL, 0.08, 15)}
                        initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}>
                        {motif.label}
                      </motion.text>
                    )}
                  </g>
                ))}

                {/* Glow on final callback */}
                {callbacks >= CALLBACK_STEPS && (
                  <motion.rect x="0" y="0" width="230" height="160"
                    fill={themeColor(TH.accentHSL, 0.02, 10)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                    transition={{ duration: 2 }}
                  />
                )}
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {callbacks === 0 ? 'Five empty staves. The first theme awaits.' : callbacks < CALLBACK_STEPS ? `Callback ${callbacks}: "${MOTIFS[callbacks - 1].label}."` : 'The theme returned. Transformed. The echo is complete.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: CALLBACK_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < callbacks ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five callbacks. The original theme, then inverted, retrograde, augmented, and finally, the return. The same notes, but deeper. The masters do not invent new themes. They return to old ones, transformed. In conversation: call back. Reference their earlier words. The echo is louder than the original.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Thematic recurrence. Calling back previously introduced themes creates coherence, deepens meaning, and signals to the listener that they were truly heard.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Theme. Transform. Return.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}