/**
 * OUROBOROS #9 — The Alpha Omega
 * "You are not the beginning. You are not the end. You are the turning."
 * INTERACTION: Alpha (α) and Omega (ω) symbols orbit each other.
 * 5 taps bring them closer. On the 5th, they merge into a single
 * glyph — the turning point between beginning and end.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Ouroboros_AlphaOmega({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [step, setStep] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => { addTimer(() => setStage('present'), 1200); addTimer(() => setStage('active'), 3500); return () => { timersRef.current.forEach(clearTimeout); }; }, []);

  const advance = () => {
    if (stage !== 'active' || step >= 5) return;
    const next = step + 1;
    setStep(next);
    if (next >= 5) addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  const t = step / 5;
  const separation = 50 - t * 46; // From 50px apart to 4px (merged)

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (<motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Alpha and Omega...</motion.div>)}
        {stage === 'present' && (<motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>You are not the beginning. You are not the end. You are the turning. The point where alpha becomes omega becomes alpha. The hinge of everything.</div><div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to bring them closer</div></motion.div>)}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={advance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: step >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(260, ${5 + t * 5}%, ${4 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Connection field */}
                <defs>
                  <radialGradient id={`${svgId}-mergeGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(38, ${15 + t * 15}%, ${25 + t * 15}%, ${t * 0.04})`} />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="110" cy="90" r={40 + t * 20} fill={`url(#${svgId}-mergeGlow)`} />
                {/* Alpha symbol */}
                <motion.text x={110 - separation} y="95" textAnchor="middle"
                  fontSize={step >= 5 ? '18' : '14'} fontFamily="serif" fontWeight="300"
                  fill={`hsla(38, ${14 + t * 12}%, ${35 + t * 15}%, ${0.06 + t * 0.06})`}
                  animate={{ x: 110 - separation }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}>
                  {step >= 5 ? '∞' : 'α'}
                </motion.text>
                {/* Omega symbol */}
                {step < 5 && (
                  <motion.text x={110 + separation} y="95" textAnchor="middle"
                    fontSize="14" fontFamily="serif" fontWeight="300"
                    fill={`hsla(260, ${14 + t * 12}%, ${35 + t * 15}%, ${0.06 + t * 0.06})`}
                    animate={{ x: 110 + separation }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}>
                    ω
                  </motion.text>
                )}
                {/* Orbit trace */}
                {step > 0 && step < 5 && (
                  <motion.ellipse cx="110" cy="90" rx={separation} ry={separation * 0.4}
                    fill="none" stroke={`hsla(38, 10%, 30%, ${0.02})`} strokeWidth="0.3"
                    strokeDasharray="2 4" />
                )}
              </svg>
            </div>
            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {step === 0 ? 'Alpha. Omega. Separated.' : step === 1 ? 'Closer. The gap narrows.' : step === 2 ? 'Beginning and end recognize each other.' : step === 3 ? 'Almost touching.' : step === 4 ? 'The space between is a breath.' : 'Alpha and omega merge. Infinity.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>{Array.from({ length: 5 }, (_, i) => (<div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < step ? 'hsla(260, 18%, 50%, 0.5)' : palette.primaryFaint, opacity: i < step ? 0.6 : 0.15 }} />))}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (<motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>Alpha met omega. They became infinity. You are not the beginning or the end; you are the turning. The hinge point where one becomes the other. The pivot that makes the circle possible.</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The infinity symbol (∞) was introduced by John Wallis in 1655. But the concept is older than mathematics: every culture knew that the line is an illusion. Everything curves. Everything returns. Even light bends around mass.</motion.div></motion.div>)}
        {stage === 'afterglow' && (<motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>α → ω → ∞</motion.div>)}
      </AnimatePresence>
    </NaviCueShell>
  );
}