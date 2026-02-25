/**
 * STRATEGIST #3 — The Compound Interest
 * "The brain underestimates exponential growth."
 * INTERACTION: An empty chart with a flat line. Each tap adds a
 * small daily deposit. The curve stays flat for 3 taps, then
 * bends upward at tap 4, then goes vertical at tap 5.
 * The hockey-stick moment. Trust the curve.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DEPOSIT_STEPS = 5;

export default function Strategist_CompoundInterest({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [deposits, setDeposits] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const deposit = () => {
    if (stage !== 'active' || deposits >= DEPOSIT_STEPS) return;
    const next = deposits + 1;
    setDeposits(next);
    if (next >= DEPOSIT_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = deposits / DEPOSIT_STEPS;

  // Exponential curve points
  const buildCurve = () => {
    const pts: string[] = [];
    const resolution = 40;
    for (let i = 0; i <= resolution; i++) {
      const x = 30 + (i / resolution) * 160;
      const prog = i / resolution;
      // Only draw up to current progress
      if (prog > t + 0.02) break;
      // Exponential: y = e^(k*x) mapped to canvas
      const expVal = Math.pow(prog * t, 2.2) * 2;
      const y = 135 - Math.min(expVal * 100, 105);
      pts.push(`${x},${y}`);
    }
    return pts.length > 1 ? `M ${pts.join(' L ')}` : '';
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A flat line waits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Do one small thing today that pays you back forever. The brain underestimates exponential growth. It thinks linearly. Trust the curve.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to deposit</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={deposit}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: deposits >= DEPOSIT_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(150, ${5 + t * 6}%, ${7 + t * 2}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Grid lines */}
                {Array.from({ length: 5 }, (_, i) => (
                  <line key={`h-${i}`} x1="30" y1={30 + i * 26} x2="195" y2={30 + i * 26}
                    stroke="hsla(0, 0%, 18%, 0.03)" strokeWidth="0.3" />
                ))}
                {Array.from({ length: 6 }, (_, i) => (
                  <line key={`v-${i}`} x1={30 + i * 33} y1="25" x2={30 + i * 33} y2="140"
                    stroke="hsla(0, 0%, 18%, 0.03)" strokeWidth="0.3" />
                ))}

                {/* Axes */}
                <line x1="30" y1="135" x2="195" y2="135" stroke="hsla(0, 0%, 20%, 0.06)" strokeWidth="0.5" />
                <line x1="30" y1="25" x2="30" y2="135" stroke="hsla(0, 0%, 20%, 0.06)" strokeWidth="0.5" />

                {/* Linear expectation line — dashed */}
                <line x1="30" y1="135" x2="195" y2="95"
                  stroke="hsla(0, 0%, 22%, 0.04)" strokeWidth="0.4" strokeDasharray="3 3" />
                <text x="197" y="94" fontSize="11" fontFamily="monospace"
                  fill="hsla(0, 0%, 25%, 0.05)">linear</text>

                {/* Exponential curve */}
                {t > 0 && (
                  <motion.path d={buildCurve()}
                    fill="none"
                    stroke={`hsla(150, ${18 + t * 15}%, ${38 + t * 12}%, ${0.12 + t * 0.1})`}
                    strokeWidth={0.8 + t * 0.6}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                )}

                {/* Deposit markers */}
                {Array.from({ length: deposits }, (_, i) => {
                  const prog = (i + 1) / DEPOSIT_STEPS;
                  const x = 30 + prog * 160;
                  const expVal = Math.pow(prog * t, 2.2) * 2;
                  const y = 135 - Math.min(expVal * 100, 105);
                  return (
                    <motion.circle key={i}
                      cx={x} cy={y} r="2.5"
                      fill={`hsla(150, ${18 + i * 3}%, ${40 + i * 3}%, ${0.1 + i * 0.02})`}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    />
                  );
                })}

                {/* Hockey stick arrow */}
                {t >= 1 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    <line x1="175" y1="45" x2="180" y2="32" stroke="hsla(150, 15%, 45%, 0.12)" strokeWidth="0.8" strokeLinecap="round" />
                    <polygon points="178,28 182,34 176,33" fill="hsla(150, 15%, 45%, 0.1)" />
                  </motion.g>
                )}

                {/* Axis labels */}
                <text x="112" y="148" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill="hsla(0, 0%, 28%, 0.06)">time</text>
                <text x="18" y="80" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill="hsla(0, 0%, 28%, 0.06)" transform="rotate(-90, 18, 80)">value</text>

                {/* Vertical label */}
                {t >= 1 && (
                  <motion.text x="110" y="20" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(150, 18%, 48%, 0.18)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.5, duration: 1.5 }}>
                    VERTICAL
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={deposits} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {deposits === 0 ? 'Flat line. Nothing visible yet.' : deposits <= 3 ? `Deposit ${deposits}. Still flat. Patience.` : deposits < DEPOSIT_STEPS ? 'The curve bends. The hockey stick.' : 'Vertical. Exponential. Trust confirmed.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: DEPOSIT_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < deposits ? 'hsla(150, 22%, 45%, 0.5)' : palette.primaryFaint, opacity: i < deposits ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five deposits. The line was flat for three. Then it bent. Then it went vertical. The brain expected linear. Reality is exponential. Trust the curve.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Delayed gratification. Strengthening the prefrontal cortex's ability to override impulsive now-rewards for larger future gains. The marshmallow test, applied to a life.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Flat. Bend. Vertical.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}