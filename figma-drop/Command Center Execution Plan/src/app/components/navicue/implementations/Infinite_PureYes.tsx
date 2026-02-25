/**
 * INFINITE PLAYER #6 — The Pure Yes
 * "Life offers you a scene. Do not block. Say 'Yes, And...'"
 * INTERACTION: A giant green button at center. Each tap it pulses
 * bigger with a ripple — 5 taps. YES grows larger.
 * Acceptance and commitment. No resistance.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const YES_STEPS = 5;

export default function Infinite_PureYes({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [yeses, setYeses] = useState(0);
  const [ripples, setRipples] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const sayYes = () => {
    if (stage !== 'active' || yeses >= YES_STEPS) return;
    const next = yeses + 1;
    setYeses(next);
    setRipples(prev => [...prev, Date.now()]);
    if (next >= YES_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = yeses / YES_STEPS;
  const btnR = 25 + t * 25; // button radius grows
  const fontSize = 10 + t * 8;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A question approaches...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Say YES to the next thing that happens. No resistance. Life offers you a scene. Do not block. Say "Yes, And..."</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the green button and say yes</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={sayYes}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: yeses >= YES_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '260px' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(140, ${5 + t * 8}%, ${4 + t * 4}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Ripples from each yes */}
                {ripples.map((key, i) => (
                  <motion.circle key={key} cx="90" cy="90" r={btnR}
                    fill="none"
                    stroke={`hsla(140, ${15 + i * 3}%, ${30 + i * 5}%, 0.06)`}
                    strokeWidth="0.5"
                    initial={{ r: btnR, opacity: 0.06 }}
                    animate={{ r: btnR + 50, opacity: 0 }}
                    transition={{ duration: 2 }}
                  />
                ))}

                {/* The Button */}
                <motion.circle cx="90" cy="90" r={btnR}
                  fill={`hsla(140, ${15 + t * 18}%, ${18 + t * 15}%, ${0.08 + t * 0.08})`}
                  stroke={`hsla(140, ${15 + t * 15}%, ${25 + t * 18}%, ${0.06 + t * 0.06})`}
                  strokeWidth={0.5 + t * 0.5}
                  initial={{ r: btnR }}
                  animate={{ r: btnR }}
                  transition={{ type: 'spring', stiffness: 100 }}
                />

                {/* Inner glow */}
                <motion.circle cx="90" cy="90" r={btnR * 0.6}
                  fill={`hsla(140, ${18 + t * 12}%, ${22 + t * 12}%, ${0.03 + t * 0.04})`}
                  initial={{ r: btnR * 0.6 }}
                  animate={{ r: btnR * 0.6 }}
                />

                {/* YES text */}
                <motion.text x="90" y={94} textAnchor="middle"
                  fontSize={fontSize} fontFamily="Impact, sans-serif" fontWeight="bold" letterSpacing="2"
                  fill={`hsla(140, ${18 + t * 15}%, ${30 + t * 20}%, ${0.1 + t * 0.1})`}
                  animate={{ fontSize }}
                  transition={{ type: 'spring', stiffness: 100 }}>
                  YES
                </motion.text>

                {/* "And..." appears at high yeses */}
                {yeses >= 3 && (
                  <motion.text x="90" y={94 + fontSize * 0.6} textAnchor="middle"
                    fontSize="5" fontFamily="Georgia, serif" fontStyle="italic"
                    fill={`hsla(140, 12%, 35%, ${(t - 0.6) * 0.12})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.6) * 0.12 }}>
                    And...
                  </motion.text>
                )}

                {/* Counter */}
                <text x="90" y="170" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(140, ${6 + t * 8}%, ${20 + t * 10}%, ${0.05 + t * 0.03})`}>
                  {t >= 1 ? 'PURE YES. no resistance.' : `yes x ${yeses}`}
                </text>
              </svg>
            </div>
            <motion.div key={yeses} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {yeses === 0 ? 'A green button. Waiting for your yes.' : yeses < YES_STEPS ? `Yes ${yeses}. The button grows. Ripples radiate.` : 'PURE YES. No resistance. Yes, And...'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: YES_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < yeses ? 'hsla(140, 20%, 42%, 0.5)' : palette.primaryFaint, opacity: i < yeses ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five yeses. The button grew from small to massive. Each tap sent ripples outward. YES. And... The scene was offered. You did not block. You accepted. Radical acceptance of what is, right now, dissolves resistance.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Acceptance and commitment. Radical acceptance of the present moment reduces the secondary suffering caused by psychological resistance. Yes, and...</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Button. Yes. And.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}