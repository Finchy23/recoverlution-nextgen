/**
 * SOURCE #1 — The I AM
 * "I am not this body. I am not this story. I am the witness of it all."
 * INTERACTION: A pulsing light at center — gentle cardiac rhythm.
 * Each tap strips a label ("not this body", "not this story"…) until
 * only the pure pulse remains. I Am.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Self-Compassion', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STRIPS = [
  'I am not this body.',
  'I am not this name.',
  'I am not this story.',
  'I am not this fear.',
  'I am the witness.',
];

export default function Source_IAm({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stripped, setStripped] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);
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
    if (stage !== 'active' && stage !== 'resonant') return;
    // cardiac rhythm ~60 bpm = 1 Hz
    const tick = () => { setPulsePhase(p => p + 0.035); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const strip = () => {
    if (stage !== 'active' || stripped >= STRIPS.length) return;
    const next = stripped + 1;
    setStripped(next);
    if (next >= STRIPS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = stripped / STRIPS.length;
  const pulse = Math.sin(pulsePhase) * 0.5 + 0.5; // 0-1
  const coreR = 12 + pulse * 6 + t * 8;
  const glowR = 30 + pulse * 15 + t * 25;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Self-Compassion" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A pulse appears...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>I am not this body. I am not this story. I am the witness of it all. I Am.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to release each identity</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={strip}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: stripped >= STRIPS.length ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <radialGradient id={`${svgId}-iamGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(45, ${30 + t * 25}%, ${55 + t * 30}%, ${0.15 + pulse * 0.2 + t * 0.3})`} />
                    <stop offset="50%" stopColor={`hsla(45, 20%, 45%, ${0.04 + pulse * 0.04 + t * 0.06})`} />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                {/* Outer glow rings — breathing */}
                <circle cx="95" cy="95" r={glowR + 15} fill="none"
                  stroke={`hsla(45, 25%, 50%, ${(0.03 + pulse * 0.03) * (1 + t)})`} strokeWidth="0.5" />
                <circle cx="95" cy="95" r={glowR} fill={`url(#${svgId}-iamGlow)`} />
                {/* Core pulse */}
                <circle cx="95" cy="95" r={coreR}
                  fill={`hsla(45, ${35 + t * 20}%, ${50 + t * 35}%, ${0.2 + pulse * 0.15 + t * 0.25})`} />
                <circle cx="95" cy="95" r={coreR * 0.5}
                  fill={`hsla(45, ${40 + t * 15}%, ${60 + t * 25}%, ${0.15 + pulse * 0.1 + t * 0.2})`} />
                {/* Stripped labels — orbiting, fading as released */}
                {STRIPS.slice(0, stripped < STRIPS.length ? STRIPS.length : 0).map((label, i) => {
                  const dismissed = i < stripped;
                  const angle = (i / STRIPS.length) * Math.PI * 2 - Math.PI / 2;
                  const dist = dismissed ? 90 + (stripped - i) * 15 : 55;
                  const x = 95 + Math.cos(angle) * dist;
                  const y = 95 + Math.sin(angle) * dist;
                  return (
                    <motion.text key={i} x={x} y={y} textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(0, 0%, ${dismissed ? 25 : 45}%, ${dismissed ? 0.08 : 0.25})`}
                      initial={{ opacity: 0.25 }}
                      animate={{ opacity: dismissed ? 0.05 : 0.25, x, y }}
                      transition={{ duration: 0.8 }}>
                      {label}
                    </motion.text>
                  );
                })}
                {/* I AM — appears when all stripped */}
                {stripped >= STRIPS.length && (
                  <motion.text x="95" y="100" textAnchor="middle" fontSize="12" fontFamily="monospace"
                    fill="hsla(45, 40%, 60%, 0.5)" fontWeight="300" letterSpacing="4"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ duration: 2 }}>
                    I AM
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={stripped} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {stripped === 0 ? 'Labels orbit the light. Release them.' : stripped < STRIPS.length ? STRIPS[stripped - 1] : 'Nothing left but presence.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {STRIPS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < stripped ? 'hsla(45, 40%, 55%, 0.5)' : palette.primaryFaint, opacity: i < stripped ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Not the body. Not the name. Not the story. Not the fear. The witness. I Am.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Ontological self-affirmation. Anchoring in existence rather than performance. A buffer against all that threatens the ego.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            I Am.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}