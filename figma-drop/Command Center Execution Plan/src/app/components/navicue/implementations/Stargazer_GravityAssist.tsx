/**
 * STARGAZER #3 — The Gravity Assist
 * "You are small. The problem is big. Good. Use its gravity."
 * ARCHETYPE: Pattern B (Drag) — A spaceship approaches a massive planet.
 * Drag to slingshot around it. The ship exits faster than it entered.
 * Reappraisal (Aikido Strategy). Using the stressor's energy.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Stargazer_GravityAssist({ onComplete }: Props) {
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
  // Slingshot trajectory — approach from left, curve around planet, exit right+up
  const shipAngle = -Math.PI + t * Math.PI * 1.4;
  const orbitR = 35 + Math.abs(Math.sin(shipAngle * 0.5)) * 15;
  const sx = 110 + Math.cos(shipAngle) * orbitR;
  const sy = 85 + Math.sin(shipAngle) * orbitR * 0.7;
  const speed = 0.5 + t * 1.5; // accelerates through slingshot

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Approaching the giant...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are small. The problem is big. Good. Use the problem's mass to fling you faster toward your goal. Momentum is free. Do not fight the giant. Use its gravity.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to slingshot around the giant planet</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.97, t * 2) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Stars */}
                {Array.from({ length: 15 }, (_, i) => (
                  <circle key={i}
                    cx={8 + (i * 41) % 204} cy={8 + (i * 29) % 144}
                    r={0.4 + (i % 3) * 0.15}
                    fill={themeColor(TH.primaryHSL, 0.03, 14 + (i % 6))} />
                ))}

                {/* Giant planet */}
                <circle cx="110" cy="85" r="22"
                  fill={themeColor(TH.accentHSL, 0.04, 10)} />
                <circle cx="110" cy="85" r="22"
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.06, 14)}
                  strokeWidth="0.6" />
                {/* Planet bands */}
                {[-8, -2, 4, 10].map((dy, i) => (
                  <line key={i} x1={92 + Math.abs(dy)} y1={85 + dy} x2={128 - Math.abs(dy)} y2={85 + dy}
                    stroke={themeColor(TH.accentHSL, 0.02, 8)}
                    strokeWidth="0.4" />
                ))}
                {/* Gravity field */}
                {[30, 38, 46].map((r, i) => (
                  <circle key={`gf-${i}`} cx="110" cy="85" r={r}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.015 - i * 0.004, 10)}
                    strokeWidth="0.3" strokeDasharray="2 4" />
                ))}

                {/* Trajectory trail */}
                {t > 0 && (() => {
                  const points = Array.from({ length: Math.floor(t * 40) }, (_, i) => {
                    const pt = i / 40;
                    const pa = -Math.PI + pt * Math.PI * 1.4;
                    const pr = 35 + Math.abs(Math.sin(pa * 0.5)) * 15;
                    return `${110 + Math.cos(pa) * pr},${85 + Math.sin(pa) * pr * 0.7}`;
                  }).join(' ');
                  return (
                    <polyline points={points}
                      fill="none"
                      stroke={themeColor(TH.accentHSL, 0.04, 15)}
                      strokeWidth="0.5" strokeLinecap="round" />
                  );
                })()}

                {/* Spaceship */}
                <motion.g initial={{ x: 0, y: 0 }} animate={{ x: sx - 110, y: sy - 85 }} transition={{ type: 'spring', stiffness: 20 }}>
                  {/* Speed trail */}
                  {t > 0.3 && (
                    <line x1="110" y1="85" x2={110 - speed * 6} y2={85 + speed * 2}
                      stroke={themeColor(TH.accentHSL, 0.04, 15)}
                      strokeWidth="0.4" strokeLinecap="round" />
                  )}
                  <polygon points="110,81 114,85 110,89 107,85"
                    fill={themeColor(TH.accentHSL, 0.12 + t * 0.06, 20 + t * 10)}
                    stroke={themeColor(TH.accentHSL, 0.08, 18)}
                    strokeWidth="0.3" />
                </motion.g>

                {/* Speed indicator */}
                <rect x="15" y="135" width="60" height="4" rx="2"
                  fill={themeColor(TH.primaryHSL, 0.03)} />
                <motion.rect x="15" y="135" width={60 * speed / 2} height="4" rx="2"
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.04, 15)}
                  animate={{ width: 60 * speed / 2 }}
                  transition={{ type: 'spring', stiffness: 20 }}
                />
                <text x="45" y="148" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05, 15)}>
                  velocity ×{speed.toFixed(1)}
                </text>

                <text x="160" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {t >= 0.95 ? 'SLINGSHOT COMPLETE' : t > 0.3 && t < 0.6 ? 'GRAVITY ASSIST' : `approach: ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.15 ? 'A small ship. A giant planet. Approaching.' : t < 0.4 ? 'Entering the gravity field. The pull begins.' : t < 0.65 ? 'Slingshotting. The giant\u2019s mass accelerates you.' : t < 0.95 ? 'Exiting faster than you entered. Momentum is free.' : 'Slingshot complete. The problem made you faster.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You entered slow and exited fast. The giant planet's gravity did not destroy you; it accelerated you. You are small. The problem is big. Good. Use its mass. Momentum is free. The obstacle is not the wall. It is the slingshot.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Reappraisal (Aikido Strategy). Using the energy of a stressor as motivational propellant rather than a wall. The bigger the obstacle, the greater the potential acceleration.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Small. Giant. Slingshot.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}