/**
 * PHENOMENOLOGIST #10 — The Perception Seal (The Proof)
 * "The world changes. The witness remains. You are the one watching the movie."
 * INTERACTION: An eye icon that gradually opens and holds — stable,
 * unwavering. Surrounding content shifts and changes, but the eye
 * remains constant. Establishing the observer self.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'embodying', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const WITNESS_PHASES = [
  { openness: 0.2, label: 'The eye begins to open.', surround: 'chaos' },
  { openness: 0.5, label: 'The world shifts around it.', surround: 'shifting' },
  { openness: 0.8, label: 'The witness holds steady.', surround: 'turbulent' },
  { openness: 1, label: 'I am the witness.', surround: 'still' },
];

export default function Phenomenologist_PerceptionSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);
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
    const tick = () => { setAnimPhase(p => p + 0.03); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const openEye = () => {
    if (stage !== 'active' || phaseIdx >= WITNESS_PHASES.length - 1) return;
    const next = phaseIdx + 1;
    setPhaseIdx(next);
    if (next >= WITNESS_PHASES.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 4000);
    }
  };

  const current = WITNESS_PHASES[phaseIdx];
  const openness = current.openness;
  const turbulence = current.surround === 'still' ? 0 : current.surround === 'chaos' ? 0.5 : current.surround === 'turbulent' ? 0.8 : 0.3;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The witness awakens...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The world changes. The witness remains. You are the one watching the movie.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to open the eye</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={openEye}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: phaseIdx >= WITNESS_PHASES.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(250, 10%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Surrounding chaos — shifting lines/shapes */}
                {turbulence > 0 && Array.from({ length: 12 }, (_, i) => {
                  const sx = 20 + Math.sin(animPhase * (0.5 + i * 0.1) + i * 2) * 70 + 60;
                  const sy = 20 + Math.cos(animPhase * (0.3 + i * 0.08) + i * 1.5) * 55 + 40;
                  return (
                    <motion.circle key={i} cx={sx} cy={sy} r={2 + Math.random() * 3}
                      fill={`hsla(${200 + i * 15}, 20%, 40%, ${turbulence * 0.06})`}
                    />
                  );
                })}
                {turbulence > 0 && Array.from({ length: 6 }, (_, i) => (
                  <motion.line key={`l${i}`}
                    x1={10 + Math.sin(animPhase + i) * turbulence * 30}
                    y1={20 + i * 22}
                    x2={190 + Math.cos(animPhase * 0.7 + i) * turbulence * 25}
                    y2={25 + i * 22 + Math.sin(animPhase + i) * turbulence * 10}
                    stroke={`hsla(220, 15%, 35%, ${turbulence * 0.04})`}
                    strokeWidth="0.5"
                  />
                ))}
                {/* The Eye — always centered, always stable */}
                <g transform="translate(100, 85)">
                  {/* Outer eye shape */}
                  <motion.path
                    d={`M -30 0 Q -15 ${-18 * openness}, 0 ${-20 * openness} Q 15 ${-18 * openness}, 30 0 Q 15 ${18 * openness}, 0 ${20 * openness} Q -15 ${18 * openness}, -30 0 Z`}
                    fill="none"
                    stroke={`hsla(220, 25%, ${50 + openness * 15}%, ${0.3 + openness * 0.3})`}
                    strokeWidth="1"
                    initial={{ d: 'M -30 0 Q -15 0, 0 0 Q 15 0, 30 0 Q 15 0, 0 0 Q -15 0, -30 0 Z' }}
                    animate={{ d: `M -30 0 Q -15 ${-18 * openness}, 0 ${-20 * openness} Q 15 ${-18 * openness}, 30 0 Q 15 ${18 * openness}, 0 ${20 * openness} Q -15 ${18 * openness}, -30 0 Z` }}
                    transition={{ duration: 1 }}
                  />
                  {/* Iris */}
                  <motion.circle cx="0" cy="0" r={8 * openness}
                    fill={`hsla(200, 30%, 40%, ${openness * 0.3})`}
                    stroke={`hsla(200, 30%, 50%, ${openness * 0.4})`}
                    strokeWidth="0.5"
                    initial={{ r: 0 }}
                    animate={{ r: 8 * openness }}
                    transition={{ duration: 1 }}
                  />
                  {/* Pupil */}
                  <motion.circle cx="0" cy="0" r={3 * openness}
                    fill={`hsla(220, 20%, 15%, ${openness * 0.6})`}
                    initial={{ r: 0 }}
                    animate={{ r: 3 * openness }}
                    transition={{ duration: 1 }}
                  />
                  {/* Light reflection */}
                  {openness > 0.5 && (
                    <motion.circle cx="3" cy={-3 * openness} r={1.5}
                      fill={`hsla(0, 0%, 90%, ${(openness - 0.5) * 0.4})`}
                      initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                    />
                  )}
                  {/* Stability glow */}
                  <motion.circle cx="0" cy="0" r={22}
                    fill="none"
                    stroke={`hsla(220, 25%, 55%, ${openness * 0.06})`}
                    strokeWidth="0.5"
                    strokeDasharray="2 4"
                  />
                </g>
              </svg>
            </div>
            {/* Phase text */}
            <motion.div key={phaseIdx} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: openness < 1 ? 'italic' : 'normal', fontWeight: openness >= 1 ? 500 : 400 }}>{current.label}</div>
            </motion.div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {WITNESS_PHASES.map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= phaseIdx ? 'hsla(220, 25%, 55%, 0.5)' : palette.primaryFaint, opacity: i <= phaseIdx ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>I am the witness. The world changes. I remain.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The observer self established. Distinct from the contents of consciousness. Stable. Watching.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The eye opened. The witness remains.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}