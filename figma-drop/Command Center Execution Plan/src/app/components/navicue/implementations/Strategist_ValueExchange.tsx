/**
 * STRATEGIST #1 — The Value Exchange
 * "Solve a problem. The money is just the applause."
 * INTERACTION: An old-fashioned balance scale. Left pan holds a
 * gold coin (reward). Right pan holds a glowing orb (value).
 * Each tap adds value to the right pan — the scale tips, then
 * rebalances. 5 additions. At equilibrium: perfect balance.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const VALUE_STEPS = 5;

export default function Strategist_ValueExchange({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [values, setValues] = useState(0);
  const [tiltPhase, setTiltPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setTiltPhase(p => p + 0.04); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const addValue = () => {
    if (stage !== 'active' || values >= VALUE_STEPS) return;
    const next = values + 1;
    setValues(next);
    if (next >= VALUE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = values / VALUE_STEPS;
  const balanced = t >= 1;
  // Tilt: starts tilted left (money heavy), approaches level
  const tiltBase = (1 - t) * 8;
  const tiltOscillation = Math.sin(tiltPhase * 3) * (1 - t) * 2;
  const tilt = tiltBase + tiltOscillation;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A scale tips...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Don't ask for money. Ask: where can I add value today? Solve a problem. The money is just the applause. Focus on the performance.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to add value</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={addValue}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: values >= VALUE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(42, ${6 + t * 6}%, ${7 + t * 2}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Fulcrum triangle */}
                <polygon points="110,130 104,145 116,145"
                  fill={`hsla(42, 12%, 22%, ${0.08 + t * 0.04})`} />
                {/* Stand */}
                <line x1="110" y1="145" x2="110" y2="160" stroke="hsla(42, 8%, 20%, 0.06)" strokeWidth="1.5" />
                <line x1="95" y1="160" x2="125" y2="160" stroke="hsla(42, 8%, 20%, 0.06)" strokeWidth="1" />

                {/* Beam — tilts */}
                <motion.g style={{ transformOrigin: '110px 130px' }}
                  animate={{ rotate: -tilt }} transition={{ type: 'spring', stiffness: 40, damping: 8 }}>
                  <line x1="40" y1="130" x2="180" y2="130"
                    stroke={`hsla(42, ${10 + t * 8}%, ${25 + t * 10}%, ${0.1 + t * 0.06})`} strokeWidth="1.2" strokeLinecap="round" />

                  {/* Left pan — money/reward */}
                  <line x1="55" y1="130" x2="45" y2="108" stroke="hsla(42, 8%, 22%, 0.06)" strokeWidth="0.4" />
                  <line x1="55" y1="130" x2="65" y2="108" stroke="hsla(42, 8%, 22%, 0.06)" strokeWidth="0.4" />
                  <ellipse cx="55" cy="107" rx="14" ry="3"
                    fill={`hsla(42, ${15 + t * 8}%, ${25 + t * 8}%, ${0.06 + t * 0.03})`} />
                  {/* Gold coin */}
                  <circle cx="55" cy="100" r="6"
                    fill={`hsla(42, 25%, 40%, ${0.06 + t * 0.02})`}
                    stroke="hsla(42, 20%, 35%, 0.06)" strokeWidth="0.4" />
                  <text x="55" y="103" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(42, 15%, 35%, 0.08)">$</text>

                  {/* Right pan — value */}
                  <line x1="165" y1="130" x2="155" y2="108" stroke="hsla(42, 8%, 22%, 0.06)" strokeWidth="0.4" />
                  <line x1="165" y1="130" x2="175" y2="108" stroke="hsla(42, 8%, 22%, 0.06)" strokeWidth="0.4" />
                  <ellipse cx="165" cy="107" rx="14" ry="3"
                    fill={`hsla(42, ${15 + t * 8}%, ${25 + t * 8}%, ${0.06 + t * 0.03})`} />
                  {/* Value orbs — one per addition */}
                  {Array.from({ length: values }, (_, i) => (
                    <motion.circle key={i}
                      cx={158 + (i % 3) * 5} cy={100 - Math.floor(i / 3) * 6}
                      r={3 + i * 0.3}
                      fill={`hsla(${160 + i * 15}, ${18 + i * 3}%, ${38 + i * 3}%, ${0.08 + i * 0.01})`}
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: safeOpacity(0.08 + i * 0.01) }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    />
                  ))}
                </motion.g>

                {/* Labels */}
                <text x="55" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill="hsla(42, 10%, 30%, 0.08)">reward</text>
                <text x="165" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(160, ${10 + t * 8}%, ${30 + t * 8}%, ${0.08 + t * 0.04})`}>value</text>

                {/* Equilibrium label */}
                {balanced && (
                  <motion.text x="110" y="30" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(42, 18%, 48%, 0.18)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    BALANCED
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={values} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {values === 0 ? 'Tilted. Chasing reward. Wrong pan.' : values < VALUE_STEPS ? `Value ${values} added. Scale leveling.` : 'Balanced. Value equals reward. Applause follows.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: VALUE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < values ? 'hsla(42, 22%, 48%, 0.5)' : palette.primaryFaint, opacity: i < values ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five additions. The scale leveled. Value on one side, reward on the other, perfectly balanced. The performance creates the applause.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Self-determination theory. Shifting from extrinsic reward to intrinsic competence increases persistence and satisfaction. Solve the problem first. The rest follows.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Tilted. Add value. Balance.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}