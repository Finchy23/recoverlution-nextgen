/**
 * MAGNET #1 — The Reverse Orbit
 * "When you chase, you create resistance. When you stand still, you create gravity."
 * ARCHETYPE: Pattern A (Tap × 5) — A planet sits still at center.
 * A moon tries to fly away. Each tap = the planet "holds." Moon spirals back.
 * Reactance Theory.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const HOLD_STEPS = 5;

export default function Magnet_ReverseOrbit({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holds, setHolds] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const hold = () => {
    if (stage !== 'active' || holds >= HOLD_STEPS) return;
    const next = holds + 1;
    setHolds(next);
    if (next >= HOLD_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = holds / HOLD_STEPS;
  const moonDist = 72 - t * 42; // 72→30: moon spirals in
  const planetGlow = 5 + t * 10;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A planet. A moon. Gravity.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>When you chase, you create resistance. When you stand still, you create gravity. Be the planet, not the moon.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to hold your ground and let the moon return</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={hold}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: holds >= HOLD_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Gravity field rings */}
                {[20, 35, 50, 65, 80].map((r, i) => (
                  <circle key={i} cx="100" cy="100" r={r}
                    fill="none" stroke={themeColor(TH.primaryHSL, r <= moonDist + 5 ? 0.035 + t * 0.015 : 0.015, 8)}
                    strokeWidth="0.3" strokeDasharray="1.5 2.5" />
                ))}

                {/* Planet — center, still, growing glow */}
                <motion.circle cx="100" cy="100" r={planetGlow}
                  fill={themeColor(TH.primaryHSL, 0.03 + t * 0.02, 12)}
                  animate={{ r: planetGlow }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                <circle cx="100" cy="100" r="8"
                  fill={themeColor(TH.primaryHSL, 0.1 + t * 0.05, 15)}
                  stroke={themeColor(TH.accentHSL, 0.06 + t * 0.04, 10)}
                  strokeWidth={0.4 + t * 0.4}
                />

                {/* Moon — orbiting, distance shrinks with each hold */}
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3 - t * 1, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '100px 100px' }}>
                  <motion.circle cx={100 + moonDist} cy="100" r={3 + t}
                    fill={themeColor(TH.accentHSL, 0.08 + t * 0.06, 15)}
                    stroke={themeColor(TH.accentHSL, 0.04, 8)}
                    strokeWidth="0.3"
                    initial={{ cx: 100 + moonDist }}
                    animate={{ cx: 100 + moonDist }}
                    transition={{ type: 'spring', stiffness: 30 }}
                  />
                  {/* Trail */}
                  <circle cx={100 + moonDist} cy="100" r={moonDist}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.02 + t * 0.015, 8)}
                    strokeWidth="0.3"
                    strokeDasharray="1 3"
                    style={{ transformOrigin: '100px 100px' }}
                  />
                </motion.g>

                {/* Orbit settled glow */}
                {t >= 1 && (
                  <motion.circle cx="100" cy="100" r={moonDist + 8}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.05, 15)}
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.05 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="100" y="190" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'ORBIT LOCKED. gravity wins' : `orbit distance: ${Math.round(moonDist)}px`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {holds === 0 ? 'The moon is far. Fleeing. You stand still.' : holds < HOLD_STEPS ? `Hold ${holds}. Moon closer. Orbit tightening.` : 'Orbit locked. The moon is home. Gravity won.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: HOLD_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < holds ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five holds. You did nothing but stand. The planet spun quietly. The moon, fleeing at first, wild orbit, spiraled closer with each hold. The gravity field deepened. The orbit locked. You did not chase. You attracted. Be the planet, not the moon.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Reactance theory. Pushing against someone triggers automatic pushback. Reducing pressure increases willingness to approach. Gravity, not force.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Chase. Still. Orbit.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}