/**
 * MAGNET #4 — The Velvet Rope
 * "If you are available to everyone, you are valuable to no one."
 * ARCHETYPE: Pattern E (Hold) — Press and hold on "Access Denied."
 * Slowly, patiently, the rope lifts and the sign changes to "Access Granted."
 * Scarcity Principle.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Magnet_VelvetRope({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = hold.tension;
  const ropeY = 80 - t * 35; // rope lifts upward

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Access pending...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>If you are available to everyone, you are valuable to no one. Curate your access. Scarcity is the father of value.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold to earn the access slowly</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 200, 160).base }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Left post */}
                <rect x="35" y="35" width="4" height="95" rx="2"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.04, 12)} />
                <circle cx="37" cy="35" r="4"
                  fill={themeColor(TH.accentHSL, 0.1 + t * 0.05, 15)} />

                {/* Right post */}
                <rect x="161" y="35" width="4" height="95" rx="2"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.04, 12)} />
                <circle cx="163" cy="35" r="4"
                  fill={themeColor(TH.accentHSL, 0.1 + t * 0.05, 15)} />

                {/* The velvet rope — catenary curve that lifts */}
                <motion.path
                  d={`M 37,${ropeY} Q 100,${ropeY + (1 - t) * 20} 163,${ropeY}`}
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.12 + t * 0.05, 18)}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  initial={{ d: `M 37,${ropeY} Q 100,${ropeY + 20} 163,${ropeY}` }}
                  animate={{ d: `M 37,${ropeY} Q 100,${ropeY + (1 - t) * 20} 163,${ropeY}` }}
                  transition={{ type: 'spring', stiffness: 30 }}
                />

                {/* Access sign */}
                <motion.rect x="60" y="55" width="80" height="22" rx="3"
                  fill={themeColor(t >= 1 ? TH.accentHSL : TH.primaryHSL, 0.05 + t * 0.03, t >= 1 ? 15 : 5)}
                  stroke={themeColor(t >= 1 ? TH.accentHSL : TH.primaryHSL, 0.06, 10)}
                  strokeWidth="0.3"
                />
                <motion.text x="100" y="69" textAnchor="middle" fontSize="5" fontFamily="monospace" fontWeight="bold"
                  fill={themeColor(t >= 1 ? TH.accentHSL : TH.primaryHSL, t >= 1 ? 0.16 : 0.08, t >= 1 ? 20 : 12)}
                  letterSpacing="1">
                  {t >= 1 ? 'ACCESS GRANTED' : t > 0.5 ? 'VERIFYING...' : 'ACCESS DENIED'}
                </motion.text>

                {/* Exclusivity glow beyond the rope */}
                {t > 0.3 && (
                  <motion.rect x="35" y="20" width="130" height={ropeY - 20}
                    fill={themeColor(TH.accentHSL, (t - 0.3) * 0.02, 10)}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.3) * 0.02 }}
                  />
                )}

                {/* Queue of figures outside */}
                {[140, 145, 150].map((y, i) => (
                  <g key={i}>
                    <circle cx={70 + i * 30} cy={y - 8} r="3"
                      fill={themeColor(TH.primaryHSL, 0.03 + t * 0.01)} />
                    <rect x={67 + i * 30} y={y - 4} width="6" height="8" rx="1"
                      fill={themeColor(TH.primaryHSL, 0.025 + t * 0.01)} />
                  </g>
                ))}

                {/* Progress ring */}
                <circle cx="100" cy="115" r="12"
                  fill="none" stroke={themeColor(TH.primaryHSL, 0.03)} strokeWidth="2" />
                <motion.circle cx="100" cy="115" r="12"
                  fill="none" stroke={themeColor(TH.accentHSL, 0.08 + t * 0.06, 12)}
                  strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${t * 75.4} 75.4`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 115px' }}
                />

                <text x="100" y="148" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {hold.completed ? 'welcome. you earned this' : hold.isHolding ? `patience: ${Math.round(t * 100)}%` : 'press and hold'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'The rope lifted. Access granted. It was worth the wait.' :
                 hold.isHolding ? `${t < 0.3 ? 'Denied. Keep holding.' : t < 0.7 ? 'Verifying. Patience.' : 'Almost there. The rope is lifting.'}` :
                 'A golden rope. "Access Denied." Press and hold.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You held. Access Denied became Verifying became Access Granted. The rope lifted slowly. The glow beyond it deepened. You did not beg. You waited. And the value of what lay beyond the rope, it was amplified by the wait. If you are available to everyone, you are valuable to no one. Curate your access.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The scarcity principle. We assign higher value to opportunities that are less available. Availability signals commodity. Selectivity signals luxury.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Denied. Wait. Granted.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}