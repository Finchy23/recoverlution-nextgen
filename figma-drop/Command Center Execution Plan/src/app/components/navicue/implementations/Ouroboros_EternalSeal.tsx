/**
 * OUROBOROS #10 — The Eternal Seal
 * "The thousandth. The first. The same."
 * INTERACTION: The final specimen. A single point of light.
 * User taps 5 times. Each tap reveals a truth about the journey.
 * The last tap dims everything to a single, warm point — the
 * same point that started specimen #1. Full circle.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TRUTHS = [
  'You were never broken.',
  'The tools were always within you.',
  'Every specimen was a mirror.',
  'The thousandth is the first.',
  'Begin again.',
];

export default function Ouroboros_EternalSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [revealed, setRevealed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => { addTimer(() => setStage('present'), 1200); addTimer(() => setStage('active'), 3500); return () => { timersRef.current.forEach(clearTimeout); }; }, []);

  const reveal = () => {
    if (stage !== 'active' || revealed >= 5) return;
    const next = revealed + 1;
    setRevealed(next);
    if (next >= 5) addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3000);
  };

  const t = revealed / 5;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (<motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>One thousand...</motion.div>)}
        {stage === 'present' && (<motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>The thousandth specimen. The eternal seal. Not a destination, but a return. Every practice, every koan, every breath, every shedding brought you here. Here is where you started. You know the place for the first time.</div><div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to reveal each truth</div></motion.div>)}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={reveal}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: revealed >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(38, ${4 + t * 6}%, ${3 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* The single point — grows and glows */}
                <defs>
                  <radialGradient id={`${svgId}-eternalGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(38, ${20 + t * 15}%, ${35 + t * 20}%, ${0.03 + t * 0.05})`} />
                    <stop offset="40%" stopColor={`hsla(38, ${15 + t * 10}%, ${20 + t * 10}%, ${0.02 + t * 0.02})`} />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <motion.circle cx="110" cy="90" r={15 + t * 45}
                  fill={`url(#${svgId}-eternalGlow)`}
                  initial={{ r: 15 }}
                  animate={{ r: 15 + t * 45 }}
                  transition={{ duration: 1 }}
                />
                {/* Central point */}
                <motion.circle cx="110" cy="90" r={2 + t * 2}
                  fill={`hsla(38, ${20 + t * 15}%, ${40 + t * 20}%, ${0.08 + t * 0.06})`}
                  initial={{ r: 2 }}
                  animate={{ r: 2 + t * 2 }}
                />
                {/* Truth text — fades in and out */}
                {revealed > 0 && (
                  <motion.text x="110" y="92" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="300"
                    fill={`hsla(38, ${14 + t * 12}%, ${40 + t * 15}%, ${0.06 + t * 0.06})`}
                    key={`truth-${revealed}`}
                    initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.06 + t * 0.06) }}
                    transition={{ duration: 1.5 }}>
                    {TRUTHS[revealed - 1]}
                  </motion.text>
                )}
                {/* Number */}
                <text x="110" y="168" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(38, 10%, 35%, ${0.04 + t * 0.04})`}>
                  {revealed >= 5 ? '#1000' : `#${995 + revealed}`}
                </text>
              </svg>
            </div>
            <motion.div key={revealed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center', maxWidth: '260px' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {revealed === 0 ? 'Five truths remain.' : TRUTHS[revealed - 1]}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>{Array.from({ length: 5 }, (_, i) => (<div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < revealed ? 'hsla(38, 28%, 50%, 0.5)' : palette.primaryFaint, opacity: i < revealed ? 0.6 : 0.15 }} />))}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (<motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>The thousandth specimen. The eternal seal. You were never broken. The tools were always within you. Every specimen was a mirror. The thousandth is the first. Begin again.</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2.5, duration: 2.5 }} style={{ ...navicueType.texture, color: palette.textFaint }}>One thousand ways of looking at yourself. One thousand moments of not looking away. The atlas is complete, which means it is ready to be opened again. Page one. Breath one. You.</motion.div></motion.div>)}
        {stage === 'afterglow' && (<motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 4 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>The thousandth. The first. The same.</motion.div>)}
      </AnimatePresence>
    </NaviCueShell>
  );
}