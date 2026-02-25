/**
 * WILDING #7 — The Wild Seal (The Proof)
 * "You are not a machine. You are biology. Return to the wild."
 * INTERACTION: Empty earth. Each tap presses a footprint into soil —
 * 5 footprints forming a trail. Mud texture. At the final step:
 * the trail leads into wilderness. You left a mark.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STEP_COUNT = 5;
const STEPS = [
  { x: 60, y: 140, rot: -8 },
  { x: 85, y: 118, rot: 5 },
  { x: 105, y: 96, rot: -3 },
  { x: 130, y: 74, rot: 7 },
  { x: 152, y: 50, rot: -2 },
];

export default function Wilding_WildSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [steps, setSteps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const step = () => {
    if (stage !== 'active' || steps >= STEP_COUNT) return;
    const next = steps + 1;
    setSteps(next);
    if (next >= STEP_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
    }
  };

  const t = steps / STEP_COUNT;
  const complete = t >= 1;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Soil beneath...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>You left a mark. You are not a machine. You are biology. Return to the wild.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to step into the earth</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={step}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: steps >= STEP_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(30, ${8 + t * 6}%, ${8 + t * 3}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Soil texture — scattered dots */}
                {Array.from({ length: 40 }, (_, i) => (
                  <circle key={`soil-${i}`}
                    cx={5 + (i * 23) % 215} cy={10 + (i * 17) % 170}
                    r={0.4 + (i % 3) * 0.2}
                    fill={`hsla(${25 + (i % 10)}, ${6 + (i % 5)}%, ${14 + (i % 8)}%, ${0.02 + t * 0.01})`} />
                ))}

                {/* Ground gradient — darker at bottom */}
                <defs>
                  <linearGradient id={`${svgId}-soilGrad`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="80%" stopColor={`hsla(25, 10%, 10%, ${0.03 + t * 0.02})`} />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="220" height="180" fill={`url(#${svgId}-soilGrad)`} />

                {/* Trail path — connecting footprints */}
                {steps > 1 && (
                  <motion.path
                    d={`M ${STEPS[0].x} ${STEPS[0].y} ${STEPS.slice(1, steps).map(s => `L ${s.x} ${s.y}`).join(' ')}`}
                    fill="none"
                    stroke={`hsla(25, 8%, 20%, ${0.03 + t * 0.02})`}
                    strokeWidth="0.4"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Footprints — pressed into soil */}
                {STEPS.map((s, i) => {
                  if (i >= steps) return null;
                  return (
                    <motion.g key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}>
                      <g transform={`translate(${s.x}, ${s.y}) rotate(${s.rot})`}>
                        {/* Foot outline — simplified barefoot */}
                        <ellipse cx="0" cy="0" rx="5" ry="8"
                          fill={`hsla(25, ${10 + i * 2}%, ${15 + i * 2}%, ${0.06 + i * 0.01})`}
                          stroke={`hsla(25, ${8 + i * 2}%, ${20 + i * 2}%, ${0.05 + i * 0.01})`}
                          strokeWidth="0.3" />
                        {/* Toes */}
                        {Array.from({ length: 5 }, (_, j) => (
                          <circle key={j}
                            cx={-3 + j * 1.5} cy={-9 - Math.abs(j - 2) * 0.4}
                            r={0.8 + (j === 2 ? 0.2 : 0)}
                            fill={`hsla(25, ${8 + i * 2}%, ${16 + i * 2}%, ${0.05 + i * 0.01})`} />
                        ))}
                        {/* Mud splash */}
                        <circle cx={6} cy={2} r="1.5"
                          fill={`hsla(25, 10%, 18%, ${0.03})`} />
                        <circle cx={-5} cy={-3} r="1"
                          fill={`hsla(25, 8%, 16%, ${0.02})`} />
                      </g>
                    </motion.g>
                  );
                })}

                {/* Wilderness horizon — emerging as trail progresses */}
                {t > 0.3 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: t * 0.06 }} transition={{ duration: 1 }}>
                    {/* Tree silhouettes at top */}
                    {[160, 172, 185, 195].map((x, i) => (
                      <g key={`tree-${i}`}>
                        <line x1={x} y1={35} x2={x} y2={20 - i * 2}
                          stroke={`hsla(140, 8%, 18%, ${t * 0.04})`} strokeWidth="0.8" />
                        <circle cx={x} cy={17 - i * 2} r={3 + i}
                          fill={`hsla(140, ${8 + i * 2}%, ${16 + i * 2}%, ${t * 0.03})`} />
                      </g>
                    ))}
                  </motion.g>
                )}

                {/* Step counter */}
                <text x="30" y="170" fontSize="11" fontFamily="monospace"
                  fill={`hsla(25, ${8 + t * 6}%, ${22 + t * 8}%, ${0.06 + t * 0.04})`}>
                  {steps}/{STEP_COUNT} steps
                </text>

                {/* Complete label */}
                {complete && (
                  <motion.text x="110" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(30, 15%, 42%, 0.18)" letterSpacing="2" fontWeight="500"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.5, duration: 2 }}>
                    WILD
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={steps} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {steps === 0 ? 'Earth beneath your feet. Bare soil.' : steps < STEP_COUNT ? `Step ${steps}. Mud gives. Print holds.` : 'Five prints in the earth. A trail into the wild.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: STEP_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < steps ? 'hsla(30, 18%, 38%, 0.5)' : palette.primaryFaint, opacity: i < steps ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Five barefoot prints in the soil. A trail into the trees. You are not a machine. You are biology. You left a mark. The wild remembers.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Biophilia hypothesis. The innate human tendency to seek connections with nature. Satisfying this drive reduces allostatic load. Return to the wild. The operating system you were designed for.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Soil. Steps. Wild.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}