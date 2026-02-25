/**
 * STARGAZER #2 — The Orbit Check (Retrograde)
 * "Progress is not a straight line. It is an orbit."
 * ARCHETYPE: Pattern B (Drag) — A planet orbiting. Drag to trace the full orbit.
 * At the retrograde portion, the planet appears to move backward. Stay the course.
 * Non-linear dynamics. Cyclical growth.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Stargazer_OrbitCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = drag.progress;
  // Planet position along an elliptical orbit — includes retrograde loop
  const orbitAngle = t * Math.PI * 2.5; // more than a full orbit
  const px = 100 + Math.cos(orbitAngle) * 60;
  const py = 85 + Math.sin(orbitAngle) * 30;
  const isRetrograde = t > 0.3 && t < 0.55; // backward portion

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The orbit begins...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Progress is not a straight line. It is an orbit. Sometimes you swing out to gather speed. Do not panic in the retrograde.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to trace the orbit. stay the course through retrograde</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.97, t * 2) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Background stars */}
                {Array.from({ length: 20 }, (_, i) => (
                  <circle key={i}
                    cx={10 + (i * 47) % 200} cy={10 + (i * 31) % 150}
                    r={0.4 + (i % 3) * 0.2}
                    fill={themeColor(TH.primaryHSL, 0.03, 15 + (i % 8))} />
                ))}

                {/* Orbit ellipse — faint guide */}
                <ellipse cx="100" cy="85" rx="60" ry="30"
                  fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.03, 10)}
                  strokeWidth="0.4" strokeDasharray="3 3" />

                {/* Retrograde zone indicator */}
                <path d="M 70,65 A 60,30 0 0,0 40,85"
                  fill="none"
                  stroke={isRetrograde ? themeColor(TH.accentHSL, 0.06, 15) : themeColor(TH.primaryHSL, 0.02, 8)}
                  strokeWidth={isRetrograde ? '1.5' : '0.5'}
                  strokeDasharray={isRetrograde ? 'none' : '2 2'} />
                {isRetrograde && (
                  <text x="45" y="68" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.08, 18)}>retrograde</text>
                )}

                {/* Central sun */}
                <circle cx="100" cy="85" r="8"
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.03, 15)} />
                <circle cx="100" cy="85" r="12"
                  fill={themeColor(TH.accentHSL, 0.02, 10)} />

                {/* Orbit trail — traced path */}
                {t > 0 && (
                  <motion.ellipse cx="100" cy="85" rx="60" ry="30"
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.05, 15)}
                    strokeWidth="0.6"
                    strokeDasharray={`${t * 283} ${283 - t * 283}`}
                    strokeLinecap="round"
                  />
                )}

                {/* Planet */}
                <motion.g initial={{ x: 0, y: 0 }} animate={{ x: px - 100, y: py - 85 }} transition={{ type: 'spring', stiffness: 20 }}>
                  <circle cx="100" cy="85" r={4 + t * 1.5}
                    fill={themeColor(TH.accentHSL, 0.1 + t * 0.06, 20 + t * 8)} />
                  {/* Retrograde glow */}
                  {isRetrograde && (
                    <motion.circle cx="100" cy="85" r={8 + t * 3}
                      fill={themeColor(TH.accentHSL, 0.03, 12)}
                      animate={{ r: [8 + t * 3, 10 + t * 3, 8 + t * 3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.g>

                {/* Arrow indicating "apparent" backward motion during retrograde */}
                {isRetrograde && (
                  <motion.path d="M 55,75 L 45,75 L 48,72 M 45,75 L 48,78"
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.06, 15)}
                    strokeWidth="0.5" strokeLinecap="round"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}
                  />
                )}

                <text x="110" y="160" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {t >= 0.95 ? 'ORBIT COMPLETE. the course held' : isRetrograde ? 'RETROGRADE. it looks backward. Stay.' : `orbit: ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'A planet at the start of its orbit. The sun waits at center.' : isRetrograde ? 'Retrograde. The planet appears to move backward. It is an illusion. Stay the course.' : t < 0.7 ? 'Forward again. The swing gathered speed.' : t < 0.95 ? 'Almost home. The orbit closes.' : 'Complete. The orbit was never a line.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 18) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You traced the full orbit. Forward. Then retrograde. The planet appeared to move backward. You stayed. The orbit closed. Progress is not a straight line. It is an orbit. Sometimes you swing out to gather speed. Do not panic in the retrograde.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Non-linear dynamics. Growth follows cyclical or spiral patterns rather than linear ones. Understanding this reduces the shame of apparent "setbacks". They are just the far side of the orbit.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Forward. Backward. Orbit.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}