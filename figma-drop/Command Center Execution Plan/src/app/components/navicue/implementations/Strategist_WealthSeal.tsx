/**
 * STRATEGIST #10 — The Wealth Seal (The Proof)
 * "The game is won when you stop playing."
 * INTERACTION: A gold coin, spinning in space. Each tap slows the
 * spin. 5 taps: the coin slows from a blur to a gentle wobble
 * to a final landing. It lands on "FREEDOM." Not heads, not tails.
 * Money is a tool. Freedom is the goal.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SLOW_STEPS = 5;

export default function Strategist_WealthSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [slowed, setSlowed] = useState(0);
  const [spinPhase, setSpinPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => {
      const speed = 0.12 * Math.pow(1 - slowed / SLOW_STEPS, 1.5);
      setSpinPhase(p => p + speed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage, slowed]);

  const slow = () => {
    if (stage !== 'active' || slowed >= SLOW_STEPS) return;
    const next = slowed + 1;
    setSlowed(next);
    if (next >= SLOW_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
    }
  };

  const t = slowed / SLOW_STEPS;
  const landed = t >= 1;

  // Coin appearance: ellipse that stretches/compresses based on spin phase
  const coinScaleX = landed ? 1 : Math.abs(Math.cos(spinPhase));
  const coinWidth = 40 * Math.max(coinScaleX, 0.08);
  const isEdge = coinScaleX < 0.15;

  // Wobble at near-landing
  const wobble = t > 0.6 && !landed ? Math.sin(spinPhase * 3) * (1 - t) * 5 : 0;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A coin spins...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Money is a tool. Freedom is the goal. You have enough. The game is won when you stop playing. You are free.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to slow the spin</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={slow}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: slowed >= SLOW_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(42, ${6 + t * 6}%, ${6 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Ambient glow */}
                <defs>
                  <radialGradient id={`${svgId}-coinAmbient`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(42, ${20 + t * 15}%, ${40 + t * 10}%, ${0.04 + t * 0.06})`} />
                    <stop offset="70%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill={`url(#${svgId}-coinAmbient)`} />

                {/* Coin */}
                <motion.g style={{ transformOrigin: '100px 100px' }}
                  animate={{ rotate: wobble }}>
                  {/* Coin face */}
                  <ellipse cx="100" cy="100" rx={coinWidth} ry="40"
                    fill={`hsla(42, ${18 + t * 12}%, ${28 + t * 12}%, ${0.06 + t * 0.06})`}
                    stroke={`hsla(42, ${15 + t * 10}%, ${32 + t * 10}%, ${0.1 + t * 0.08})`}
                    strokeWidth={0.6 + t * 0.4} />

                  {/* Inner ring */}
                  {!isEdge && (
                    <ellipse cx="100" cy="100" rx={coinWidth * 0.75} ry="30"
                      fill="none"
                      stroke={`hsla(42, ${12 + t * 8}%, ${28 + t * 8}%, ${0.04 + t * 0.04})`}
                      strokeWidth="0.4" />
                  )}

                  {/* Face text — visible when face is showing */}
                  {!isEdge && coinScaleX > 0.4 && (
                    <text x="100" y="103" textAnchor="middle" fontSize={landed ? "7" : "5"}
                      fontFamily="monospace" fontWeight={landed ? "500" : "400"}
                      fill={`hsla(42, ${15 + t * 10}%, ${35 + t * 12}%, ${0.08 + coinScaleX * 0.06 + t * 0.06})`}>
                      {landed ? 'FREEDOM' : Math.cos(spinPhase) > 0 ? '$' : '¢'}
                    </text>
                  )}

                  {/* Edge shimmer */}
                  {isEdge && (
                    <line x1="100" y1="60" x2="100" y2="140"
                      stroke={`hsla(42, 20%, 45%, ${0.08 + t * 0.04})`} strokeWidth="1.5" strokeLinecap="round" />
                  )}
                </motion.g>

                {/* Shadow beneath coin */}
                <ellipse cx="100" cy="155" rx={25 + t * 5} ry={3 + t * 1}
                  fill={`hsla(0, 0%, 8%, ${0.03 + t * 0.02})`} />

                {/* Speed readout */}
                <text x="100" y="178" textAnchor="middle" fontSize="5" fontFamily="monospace"
                  fill={`hsla(42, ${10 + t * 8}%, ${28 + t * 10}%, ${0.06 + t * 0.04})`}>
                  {landed ? 'landed' : `spin: ${Math.round((1 - t) * 100)}%`}
                </text>

                {/* Landed label */}
                {landed && (
                  <motion.text x="100" y="32" textAnchor="middle" fontSize="6.5" fontFamily="monospace"
                    fill="hsla(42, 22%, 52%, 0.2)" letterSpacing="2" fontWeight="500"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.5, duration: 2 }}>
                    FREE
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={slowed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {slowed === 0 ? 'Spinning fast. Heads? Tails? Blur.' : slowed < SLOW_STEPS ? `Slowing... wobble visible.` : 'Landed. Not heads. Not tails. Freedom.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SLOW_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < slowed ? 'hsla(42, 25%, 50%, 0.5)' : palette.primaryFaint, opacity: i < slowed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>The coin landed. Not on heads. Not on tails. On freedom. Money is a tool. The game is won when you stop playing. You are free.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Financial well-being. Decoupling net worth from self-worth. Money reframed as a resource for autonomy, not status. Freedom was always the answer on both sides of the coin.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Spin. Slow. Freedom.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}