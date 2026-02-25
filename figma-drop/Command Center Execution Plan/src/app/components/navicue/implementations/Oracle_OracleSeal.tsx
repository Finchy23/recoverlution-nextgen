/**
 * ORACLE #10 — The Oracle Seal (The Proof)
 * "I already knew."
 * ARCHETYPE: Pattern E (Hold) — A closed eye at center. Hold to open it slowly.
 * As the eye opens: the iris becomes a golden circle. Third eye.
 * Implicit Pattern Recognition.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ORACLE_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'IdentityKoan');
const TH = ORACLE_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Oracle_OracleSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = hold.tension;
  const eyeOpen = t * 25; // eyelid aperture

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The eye is closed...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>I already knew. Trust the knowing that arrives before the proof. The oracle sees what the analyst misses.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold to open the third eye slowly</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                {/* Eye outline — almond shape */}
                <motion.path
                  d={`M 40,95 Q 95,${95 - eyeOpen} 150,95 Q 95,${95 + eyeOpen} 40,95`}
                  fill={themeColor(TH.primaryHSL, 0.03 + t * 0.02, 8)}
                  stroke={themeColor(TH.primaryHSL, 0.06 + t * 0.04, 12)}
                  strokeWidth={0.5 + t * 0.3}
                />

                {/* Iris — visible when open */}
                {t > 0.1 && (
                  <motion.circle cx="95" cy="95" r={3 + t * 12}
                    fill={themeColor(TH.accentHSL, t * 0.08, 15)}
                    stroke={themeColor(TH.accentHSL, t * 0.06, 18)}
                    strokeWidth={0.3 + t * 0.3}
                    animate={{ r: 3 + t * 12 }}
                    transition={{ type: 'spring', stiffness: 30 }}
                  />
                )}

                {/* Pupil */}
                {t > 0.2 && (
                  <motion.circle cx="95" cy="95" r={1 + t * 4}
                    fill={themeColor(TH.voidHSL, t * 0.3, -2)}
                    animate={{ r: 1 + t * 4 }}
                  />
                )}

                {/* Iris detail — radiating lines */}
                {t > 0.4 && Array.from({ length: 16 }, (_, i) => {
                  const angle = (i / 16) * Math.PI * 2;
                  const innerR = 1 + t * 4 + 1;
                  const outerR = 3 + t * 12 - 1;
                  return (
                    <motion.line key={i}
                      x1={95 + Math.cos(angle) * innerR}
                      y1={95 + Math.sin(angle) * innerR}
                      x2={95 + Math.cos(angle) * outerR}
                      y2={95 + Math.sin(angle) * outerR}
                      stroke={themeColor(TH.accentHSL, (t - 0.4) * 0.05, 12)}
                      strokeWidth="0.3"
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.4) * 0.05 }}
                    />
                  );
                })}

                {/* Third-eye glow at completion */}
                {hold.completed && (
                  <>
                    <motion.circle cx="95" cy="95" r="40"
                      fill={themeColor(TH.accentHSL, 0.03, 12)}
                      initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                      transition={{ duration: 2 }}
                    />
                    <motion.text x="95" y="155" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold"
                      fill={themeColor(TH.accentHSL, 0.12, 20)} letterSpacing="2"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                      transition={{ delay: 0.8, duration: 2 }}>
                      I ALREADY KNEW
                    </motion.text>
                  </>
                )}

                {/* Eyelash lines */}
                {[55, 70, 85, 95, 105, 120, 135].map((x, i) => (
                  <line key={i}
                    x1={x} y1={95 - eyeOpen - 2}
                    x2={x + (i % 2 ? 2 : -2)} y2={95 - eyeOpen - 6}
                    stroke={themeColor(TH.primaryHSL, 0.03 + t * 0.02, 10)}
                    strokeWidth="0.3" strokeLinecap="round" />
                ))}

                <text x="95" y="180" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {hold.completed ? 'OPEN. the oracle sees' :
                   hold.isHolding ? `opening... ${Math.round(t * 100)}%` :
                   'press and hold. open the eye'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'The third eye is open. Golden iris. I already knew.' :
                 hold.isHolding ? `${t < 0.3 ? 'The lid trembles. Opening.' : t < 0.7 ? 'The iris forms. Amber light.' : 'Almost fully open. The pupil dilates.'}` :
                 'A closed eye. The third eye. Press and hold.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>You held. The eye opened, slowly, carefully. The almond shape widened. The iris formed: amber, radiant, detailed. The pupil dilated. And then: I already knew. Trust the knowing that arrives before the proof. The oracle does not calculate; it sees.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Implicit pattern recognition. The brain continuously runs unconscious statistical models, delivering "intuitions" that often outperform deliberate analysis on complex, high-variable problems.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Closed. Hold. See.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}