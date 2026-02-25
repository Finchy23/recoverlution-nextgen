/**
 * MAESTRO #9 — The Standing Ovation
 * "You cannot get a standing ovation from a seated performance."
 * ARCHETYPE: Pattern A (Tap × 5) — An audience in a theater.
 * Each tap = one section stands. Row by row. The wave rises.
 * Collective resonance. Emotional contagion cascade.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

const RISE_STEPS = 5;
// 5 rows of audience, each with seated figures
const ROWS = [
  { y: 38, count: 7, label: 'front row' },
  { y: 56, count: 8, label: 'second row' },
  { y: 74, count: 9, label: 'third row' },
  { y: 92, count: 8, label: 'fourth row' },
  { y: 110, count: 7, label: 'back row' },
];

export default function Maestro_StandingOvation({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [risen, setRisen] = useState(0);

  const rise = () => {
    if (stage !== 'active' || risen >= RISE_STEPS) return;
    const next = risen + 1;
    setRisen(next);
    if (next >= RISE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = risen / RISE_STEPS;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The house is full...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You cannot get a standing ovation from a seated performance. Give everything. Leave nothing. Row by row, they rise.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap as each row stands</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={rise}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: risen >= RISE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Stage at bottom */}
                <rect x="30" y="120" width="160" height="8" rx="1"
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.03, 10)} />
                {/* Stage performer */}
                <circle cx="110" cy="114" r="3"
                  fill={themeColor(TH.accentHSL, 0.1 + t * 0.05, 18)} />
                <rect x="107.5" y="117" width="5" height="4" rx="1"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.04, 15)} />

                {/* Spotlight on performer */}
                <polygon points="90,0 130,0 115,120 105,120"
                  fill={themeColor(TH.accentHSL, 0.01 + t * 0.01, 10)} />

                {/* Audience rows */}
                {ROWS.map((row, ri) => {
                  const isStanding = ri < risen;
                  return (
                    <g key={ri}>
                      {/* Row platform */}
                      <line x1={30 + ri * 3} y1={row.y + 10} x2={190 - ri * 3} y2={row.y + 10}
                        stroke={themeColor(TH.primaryHSL, 0.02, 6)} strokeWidth="0.3" />

                      {/* People */}
                      {Array.from({ length: row.count }, (_, pi) => {
                        const px = 35 + ri * 3 + pi * ((155 - ri * 6) / (row.count - 1));
                        const standOffset = isStanding ? 5 : 0;
                        return (
                          <motion.g key={pi}
                            animate={{ y: isStanding ? -standOffset : 0 }}
                            transition={{ type: 'spring', stiffness: 80, delay: isStanding ? pi * 0.04 : 0 }}>
                            {/* Head */}
                            <circle cx={px} cy={row.y + (isStanding ? 0 : 3)} r={2}
                              fill={isStanding
                                ? themeColor(TH.accentHSL, 0.08 + ri * 0.01, 15 + ri * 2)
                                : themeColor(TH.primaryHSL, 0.04, 8)
                              } />
                            {/* Body */}
                            <rect x={px - 1.5} y={row.y + (isStanding ? 2 : 5)} width={3} height={isStanding ? 7 : 5} rx="0.5"
                              fill={isStanding
                                ? themeColor(TH.accentHSL, 0.06 + ri * 0.008, 12 + ri * 2)
                                : themeColor(TH.primaryHSL, 0.03, 6)
                              } />
                            {/* Raised arms when standing */}
                            {isStanding && (
                              <>
                                <motion.line x1={px - 1.5} y1={row.y + 3} x2={px - 4} y2={row.y - 2}
                                  stroke={themeColor(TH.accentHSL, 0.06, 12)}
                                  strokeWidth="0.5" strokeLinecap="round"
                                  initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}
                                  transition={{ delay: pi * 0.05 + 0.3 }}
                                />
                                <motion.line x1={px + 1.5} y1={row.y + 3} x2={px + 4} y2={row.y - 2}
                                  stroke={themeColor(TH.accentHSL, 0.06, 12)}
                                  strokeWidth="0.5" strokeLinecap="round"
                                  initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}
                                  transition={{ delay: pi * 0.05 + 0.3 }}
                                />
                              </>
                            )}
                          </motion.g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* Full ovation glow */}
                {risen >= RISE_STEPS && (
                  <motion.rect x="0" y="0" width="220" height="140"
                    fill={themeColor(TH.accentHSL, 0.02, 10)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="110" y="135" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'STANDING OVATION' : `${risen}/${RISE_STEPS} rows standing`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {risen === 0 ? 'The audience is seated. Waiting.' : risen < RISE_STEPS ? `${ROWS[risen - 1].label} stands. Arms raised.` : 'Every row standing. Arms up. The wave is complete.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: RISE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < risen ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five taps. The front row stood first, arms rising. Then the second, third, fourth. Finally the back row, furthest from the stage, rose. Every person standing. Arms up. The wave cascaded from front to back. You cannot get a standing ovation from a seated performance. Give everything. Leave nothing.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Collective resonance. Emotional contagion cascades through a group when one person's genuine intensity triggers mirror neuron activation in others. Full investment creates the wave.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Seated. Rise. Ovation.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}