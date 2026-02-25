/**
 * STRATEGIST #7 — The Leverage Lever
 * "One hour of judgement is worth 1,000 hours of labor."
 * INTERACTION: A seesaw with a fulcrum. On the left: a heavy
 * block (LABOR). Each tap moves the fulcrum closer to the heavy
 * end — the same force lifts more. 5 adjustments. At final:
 * maximum leverage, minimal effort.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LEVER_STEPS = 5;

export default function Strategist_LeverageLever({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [adjustments, setAdjustments] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const adjust = () => {
    if (stage !== 'active' || adjustments >= LEVER_STEPS) return;
    const next = adjustments + 1;
    setAdjustments(next);
    if (next >= LEVER_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = adjustments / LEVER_STEPS;
  const maxLeverage = t >= 1;
  // Fulcrum position: starts at center (100), moves left toward the heavy block
  const fulcrumX = 100 - t * 40; // 100 → 60
  // Beam tilt: tilts right as leverage increases (lifting the heavy side)
  const beamTilt = t * 6;

  // Effort arrow size: shrinks as leverage increases
  const effortSize = 1 - t * 0.7;
  // Output arrow size: grows
  const outputSize = 0.3 + t * 0.7;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A lever waits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Work smarter, not harder. Where is the leverage point? One hour of judgement is worth a thousand hours of labor. Sharpen the judgement.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to move the fulcrum</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={adjust}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: adjustments >= LEVER_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(35, ${5 + t * 5}%, ${7 + t * 2}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Fulcrum triangle — moves left */}
                <motion.polygon
                  points={`${fulcrumX},110 ${fulcrumX - 6},125 ${fulcrumX + 6},125`}
                  fill={`hsla(35, ${10 + t * 8}%, ${20 + t * 8}%, ${0.08 + t * 0.04})`}
                  initial={{ points: '100,110 94,125 106,125' }}
                  animate={{ points: `${fulcrumX},110 ${fulcrumX - 6},125 ${fulcrumX + 6},125` }}
                />

                {/* Beam — tilts as fulcrum moves */}
                <motion.g style={{ transformOrigin: `${fulcrumX}px 110px` }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: beamTilt }}
                  transition={{ type: 'spring', stiffness: 50, damping: 10 }}>
                  <line x1="30" y1="110" x2="190" y2="110"
                    stroke={`hsla(35, ${10 + t * 8}%, ${25 + t * 10}%, ${0.1 + t * 0.06})`}
                    strokeWidth="1.5" strokeLinecap="round" />

                  {/* Heavy block — LABOR (left side) */}
                  <rect x="35" y="95" width="20" height="15" rx="1.5"
                    fill={`hsla(0, ${6 + (1 - t) * 8}%, ${18 + (1 - t) * 6}%, ${0.08 + (1 - t) * 0.04})`}
                    stroke="hsla(0, 5%, 20%, 0.04)" strokeWidth="0.3" />
                  <text x="45" y="105" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(0, 6%, 30%, 0.08)">LABOR</text>

                  {/* Light touch — JUDGEMENT (right side) */}
                  <motion.g initial={{ y: 0 }} animate={{ y: -beamTilt * 2.5 }}>
                    <line x1="175" y1="110" x2="175" y2={110 - effortSize * 20}
                      stroke={`hsla(150, ${12 + t * 10}%, ${35 + t * 10}%, ${0.08 + t * 0.06})`}
                      strokeWidth="0.6" strokeLinecap="round" />
                    <polygon
                      points={`175,${110 - effortSize * 20 - 3} 173,${110 - effortSize * 20 + 1} 177,${110 - effortSize * 20 + 1}`}
                      fill={`hsla(150, 12%, 38%, ${0.06 + t * 0.04})`} />
                    <text x="175" y={110 - effortSize * 20 - 6} textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(150, 10%, 38%, ${0.06 + t * 0.04})`}>
                      {maxLeverage ? 'judgement' : 'effort'}
                    </text>
                  </motion.g>
                </motion.g>

                {/* Leverage multiplier readout */}
                <text x="110" y="145" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(35, ${10 + t * 10}%, ${30 + t * 12}%, ${0.08 + t * 0.06})`}>
                  leverage: {(1 + t * 9).toFixed(0)}×
                </text>

                {/* Ground line */}
                <line x1="20" y1="125" x2="200" y2="125" stroke="hsla(0, 0%, 18%, 0.04)" strokeWidth="0.5" />

                {/* Max leverage label */}
                {maxLeverage && (
                  <motion.text x="110" y="30" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(35, 18%, 48%, 0.18)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    MAXIMUM LEVERAGE
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={adjustments} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {adjustments === 0 ? 'Fulcrum at center. No leverage. Brute force.' : adjustments < LEVER_STEPS ? `Fulcrum shifted. Leverage at ${(1 + t * 9).toFixed(0)}×.` : 'Maximum leverage. Minimum effort. Pure judgement.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: LEVER_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < adjustments ? 'hsla(35, 20%, 48%, 0.5)' : palette.primaryFaint, opacity: i < adjustments ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five adjustments. The fulcrum moved. The same force lifted ten times more. One hour of judgement replaced a thousand hours of labor. Work smart.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Metacognition. Stepping back to evaluate the strategy of the task rather than just executing the content. Find the fulcrum first. Then push.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Force. Fulcrum. Leverage.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}