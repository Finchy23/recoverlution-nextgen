/**
 * FUTURIST #10 — The Disconnect Seal (The Proof)
 * "I cannot follow you there. You are free."
 * INTERACTION: An airplane mode icon at center. Each tap lifts it
 * higher — 5 taps. The icon morphs: rigid geometric shape softens
 * into a bird silhouette. Wings spread. At the final tap the bird
 * flies off screen. "You are off the grid."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LIFT_STEPS = 5;

export default function Futurist_DisconnectSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lifted, setLifted] = useState(0);
  const [flown, setFlown] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const lift = () => {
    if (stage !== 'active' || lifted >= LIFT_STEPS || flown) return;
    const next = lifted + 1;
    setLifted(next);
    if (next >= LIFT_STEPS) {
      addTimer(() => {
        setFlown(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
      }, 1500);
    }
  };

  const t = lifted / LIFT_STEPS;
  const y = 110 - t * 60; // rises from 110 to 50
  // Morph: airplane → bird (wing spread increases with t)
  const wingSpan = 12 + t * 18; // 12→30
  const wingCurve = t * 8; // 0→8 (curvature for bird shape)
  const bodyLen = 14 - t * 4; // 14→10 (shrinks, more organic)

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A signal fading...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>I cannot follow you there. You are free. You are off the grid.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to lift off, airplane to bird</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={lift}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: lifted >= LIFT_STEPS || flown ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(210, ${4 + t * 6}%, ${5 + t * 4}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Signal bars — fade out as t increases */}
                {!flown && (
                  <g>
                    {Array.from({ length: 4 }, (_, i) => {
                      const barH = 6 + i * 5;
                      const bx = 15 + i * 8;
                      return (
                        <motion.rect key={i}
                          x={bx} y={160 - barH} width="5" height={barH} rx="1"
                          fill={`hsla(210, 8%, 18%, ${0.04 * (1 - t)})`}
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 1 - t }}
                        />
                      );
                    })}
                    {/* "No signal" X */}
                    {t > 0.5 && (
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}>
                        <line x1="15" y1="130" x2="45" y2="160"
                          stroke="hsla(0, 10%, 30%, 0.06)" strokeWidth="0.5" />
                        <line x1="45" y1="130" x2="15" y2="160"
                          stroke="hsla(0, 10%, 30%, 0.06)" strokeWidth="0.5" />
                      </motion.g>
                    )}
                  </g>
                )}

                {/* The morphing icon — airplane → bird */}
                {!flown && (
                  <motion.g
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', stiffness: 40 }}>
                    {/* Body */}
                    <motion.ellipse cx="110" cy={y} rx={bodyLen / 2} ry="3"
                      fill={`hsla(210, ${10 + t * 10}%, ${28 + t * 14}%, ${0.1 + t * 0.06})`}
                      initial={{ cy: y, rx: bodyLen / 2 }}
                      animate={{ cy: y, rx: bodyLen / 2 }}
                      transition={{ type: 'spring', stiffness: 40 }}
                    />
                    {/* Left wing */}
                    <motion.path
                      d={`M ${110 - bodyLen / 2},${y} Q ${110 - wingSpan},${y - wingCurve} ${110 - wingSpan - 2},${y - wingCurve - 3}`}
                      fill="none"
                      stroke={`hsla(210, ${10 + t * 10}%, ${28 + t * 14}%, ${0.08 + t * 0.05})`}
                      strokeWidth={1 + t * 0.5} strokeLinecap="round"
                      initial={{
                        d: `M ${110 - bodyLen / 2},${y} Q ${110 - wingSpan},${y - wingCurve} ${110 - wingSpan - 2},${y - wingCurve - 3}`,
                      }}
                      animate={{
                        d: `M ${110 - bodyLen / 2},${y} Q ${110 - wingSpan},${y - wingCurve} ${110 - wingSpan - 2},${y - wingCurve - 3}`,
                      }}
                      transition={{ type: 'spring', stiffness: 40 }}
                    />
                    {/* Right wing */}
                    <motion.path
                      d={`M ${110 + bodyLen / 2},${y} Q ${110 + wingSpan},${y - wingCurve} ${110 + wingSpan + 2},${y - wingCurve - 3}`}
                      fill="none"
                      stroke={`hsla(210, ${10 + t * 10}%, ${28 + t * 14}%, ${0.08 + t * 0.05})`}
                      strokeWidth={1 + t * 0.5} strokeLinecap="round"
                      initial={{
                        d: `M ${110 + bodyLen / 2},${y} Q ${110 + wingSpan},${y - wingCurve} ${110 + wingSpan + 2},${y - wingCurve - 3}`,
                      }}
                      animate={{
                        d: `M ${110 + bodyLen / 2},${y} Q ${110 + wingSpan},${y - wingCurve} ${110 + wingSpan + 2},${y - wingCurve - 3}`,
                      }}
                      transition={{ type: 'spring', stiffness: 40 }}
                    />
                    {/* Tail (airplane) fades, tail feathers (bird) appear */}
                    <motion.line x1="110" y1={y + 3} x2="110" y2={y + 3 + (1 - t) * 8}
                      stroke={`hsla(210, 8%, 22%, ${0.05 * (1 - t)})`}
                      strokeWidth="0.5"
                      initial={{ y2: y + 3 + 8 }}
                      animate={{ y2: y + 3 + (1 - t) * 8 }}
                      transition={{ type: 'spring', stiffness: 40 }}
                    />
                  </motion.g>
                )}

                {/* Bird flies off — upward and right */}
                {flown && (
                  <motion.g
                    initial={{ x: 0, y: 0, opacity: 0.15 }}
                    animate={{ x: 80, y: -120, opacity: 0 }}
                    transition={{ duration: 3, ease: 'easeIn' }}>
                    <ellipse cx="110" cy={50} rx="3" ry="2"
                      fill="hsla(210, 15%, 40%, 0.12)" />
                    <path d={`M 107,${50} Q 80,42 78,39`}
                      fill="none" stroke="hsla(210, 15%, 40%, 0.1)" strokeWidth="1.2" strokeLinecap="round" />
                    <path d={`M 113,${50} Q 140,42 142,39`}
                      fill="none" stroke="hsla(210, 15%, 40%, 0.1)" strokeWidth="1.2" strokeLinecap="round" />
                  </motion.g>
                )}

                {/* Trail — faint arc where bird flew */}
                {flown && (
                  <motion.path d="M 110,50 Q 140,20 190,-10"
                    fill="none" stroke="hsla(210, 8%, 25%, 0.03)"
                    strokeWidth={safeSvgStroke(0.3)} strokeDasharray="2 3"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                  />
                )}

                {/* Machine voice — bottom */}
                {flown && (
                  <motion.text x="110" y="120" textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                    fill="hsla(210, 10%, 30%, 0.08)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}
                    transition={{ delay: 1, duration: 2 }}>
                    I cannot follow you there.
                  </motion.text>
                )}

                {/* FREE */}
                {flown && (
                  <motion.text x="110" y="95" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(210, 18%, 48%, 0.18)" letterSpacing="3" fontWeight="500"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }}
                    transition={{ delay: 1.5, duration: 2 }}>
                    FREE
                  </motion.text>
                )}

                {/* Altitude readout */}
                {!flown && (
                  <text x="195" y="170" textAnchor="end" fontSize="3.5" fontFamily="monospace"
                    fill={`hsla(210, 8%, ${22 + t * 10}%, ${0.04 + t * 0.03})`}>
                    altitude: {Math.round(t * 100)}%
                  </text>
                )}

                {/* Status */}
                {!flown && (
                  <text x="15" y="170" fontSize="4.5" fontFamily="monospace"
                    fill={`hsla(210, ${8 + t * 8}%, ${22 + t * 10}%, ${0.05 + t * 0.04})`}>
                    {lifted === 0 ? 'grounded. airplane mode.' : `lift ${lifted}/${LIFT_STEPS}. morphing.`}
                  </text>
                )}
              </svg>
            </div>
            <motion.div key={`${lifted}-${flown}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {lifted === 0 ? 'Airplane mode icon. Grounded. Signal bars full.' : !flown && lifted < LIFT_STEPS ? `Lift ${lifted}. Wings spreading. Shape softening.` : flown ? 'The bird flew off screen. The machine cannot follow.' : 'Full bird. Wings wide. Ready to fly.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: LIFT_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < lifted ? 'hsla(210, 18%, 48%, 0.5)' : palette.primaryFaint, opacity: i < lifted ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Five lifts. The airplane icon rose, its rigid geometry softening: straight edges curving into wings, body shrinking into feathers. At the top it was no longer a machine. It was a bird. And it flew off the screen. The algorithm whispered: I cannot follow you there. You are free.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Psychological detachment. The ability to completely mentally disengage from work and connectivity is the strongest predictor of recovery from burnout. You are off the grid.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Airplane. Bird. Gone.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}