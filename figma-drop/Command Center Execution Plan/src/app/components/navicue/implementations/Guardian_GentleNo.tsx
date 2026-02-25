/**
 * GUARDIAN #9 — The Gentle No
 * "The loving limit. Firm boundary with warm delivery."
 * INTERACTION: A warm shield builds. User taps through 5 boundary
 * statements, each landing with a gentle pulse. The shield absorbs
 * incoming shapes without breaking. Firmness + warmth = safety.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BOUNDARIES = [
  { word: 'No', subtext: 'A complete sentence.' },
  { word: 'Not now', subtext: 'Timing is a boundary.' },
  { word: 'I can\'t', subtext: 'Capacity is real.' },
  { word: 'This stops', subtext: 'You decide where the line is.' },
  { word: 'I love you, and no', subtext: 'Love and limits coexist.' },
];

export default function Guardian_GentleNo({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [step, setStep] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const tap = () => {
    if (stage !== 'active' || step >= 5) return;
    const next = step + 1;
    setStep(next);
    if (next >= 5) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
    }
  };

  const t = step / 5;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The boundary forms...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The gentle no is not weakness. It is the deepest strength: holding the limit while keeping the connection warm. Children need this. Your inner child still does.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to speak each boundary</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={tap}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: step >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(340, ${5 + t * 6}%, ${6 + t * 3}%, 0.85)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Shield — grows with each boundary */}
                <defs>
                  <radialGradient id={`${svgId}-shieldWarm`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(42, ${20 + t * 12}%, ${30 + t * 12}%, ${t * 0.05})`} />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="110" cy="90" r={30 + t * 30} fill={`url(#${svgId}-shieldWarm)`} />

                {/* Shield rings — one per boundary */}
                {Array.from({ length: step }, (_, i) => (
                  <motion.circle key={`ring-${i}`}
                    cx="110" cy="90" r={25 + i * 10}
                    fill="none"
                    stroke={`hsla(42, ${18 + i * 3}%, ${35 + i * 4}%, ${0.06 + i * 0.015})`}
                    strokeWidth={0.8}
                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: safeOpacity(0.06 + i * 0.015) }}
                    transition={{ duration: 0.6 }}
                  />
                ))}

                {/* Boundary word */}
                {step > 0 && (
                  <motion.text x="110" y="88" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="300"
                    fill={`hsla(42, ${15 + t * 12}%, ${40 + t * 15}%, ${0.08 + t * 0.06})`}
                    key={`word-${step}`}
                    initial={{ opacity: 0, y: 95 }} animate={{ opacity: safeOpacity(0.08 + t * 0.06), y: 88 }}
                    transition={{ duration: 0.5 }}>
                    {BOUNDARIES[step - 1].word}
                  </motion.text>
                )}

                {/* Gentle pulse on each tap */}
                {step > 0 && (
                  <motion.circle key={`pulse-${step}`}
                    cx="110" cy="90" r="15"
                    fill={`hsla(42, 20%, 50%, 0.04)`}
                    initial={{ r: 15, opacity: 0.06 }} animate={{ r: 60, opacity: 0 }}
                    transition={{ duration: 1.2 }}
                  />
                )}
              </svg>
            </div>
            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center', maxWidth: '260px' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {step === 0 ? 'Five boundaries to practice. Each one gentle, each one firm.' : BOUNDARIES[step - 1].subtext}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < step ? 'hsla(42, 25%, 55%, 0.5)' : palette.primaryFaint,
                  opacity: i < step ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five boundaries spoken. Each one held with warmth. The gentle no is the guardian's superpower: it teaches that limits and love are not opposites. They are partners.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Research: children with firm-but-warm boundaries show higher emotional regulation, lower anxiety, and greater resilience. The boundary is not the wall; it is the frame that makes the picture safe.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            No. And still, love.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}