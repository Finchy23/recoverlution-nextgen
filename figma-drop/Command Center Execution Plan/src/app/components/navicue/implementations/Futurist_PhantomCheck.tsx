/**
 * FUTURIST #7 — The Phantom Check
 * "It didn't buzz. Your nervous system did."
 * INTERACTION: A phone shape vibrates on screen. Each tap stops
 * a vibration — 5 phantom buzzes. After each: "It didn't buzz."
 * At the end: the phone goes still. The nervous system stands down.
 * Signal detection recalibrated.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PHANTOM_COUNT = 5;
const MESSAGES = [
  'It didn\'t buzz.',
  'That was your nervous system.',
  'Anticipating a social threat.',
  'Hyper-vigilance. Not reality.',
  'Stand down. You are safe.',
];

export default function Futurist_PhantomCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [checked, setChecked] = useState(0);
  const [vibrating, setVibrating] = useState(true);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const check = () => {
    if (stage !== 'active' || checked >= PHANTOM_COUNT || !vibrating) return;
    setVibrating(false);
    const next = checked + 1;
    setChecked(next);
    if (next >= PHANTOM_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    } else {
      // Resume vibrating after a pause
      addTimer(() => setVibrating(true), 2000);
    }
  };

  const t = checked / PHANTOM_COUNT;
  const full = t >= 1;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            *buzz*...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Phantom vibration syndrome is a sign of hyper-vigilance. Your brain is anticipating a social threat. Stand down. You are safe.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the phone to stop the vibration</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={check}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: checked >= PHANTOM_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(260, ${4 + t * 3}%, ${5 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Phone body */}
                <motion.g
                  animate={vibrating && !full
                    ? { x: [0, -1.5, 1.5, -1, 1, -0.5, 0.5, 0], y: [0, 0.5, -0.5, 0.3, -0.3, 0] }
                    : { x: 0, y: 0 }
                  }
                  transition={vibrating && !full
                    ? { duration: 0.4, repeat: Infinity, repeatDelay: 0.6 }
                    : { duration: 0.5 }
                  }>
                  <rect x="80" y="30" width="60" height="110" rx="6"
                    fill="none"
                    stroke={`hsla(260, ${8 + (vibrating ? 8 : 0)}%, ${20 + t * 6}%, ${0.08 + (vibrating ? 0.04 : 0)})`}
                    strokeWidth="0.8" />
                  {/* Screen */}
                  <rect x="84" y="40" width="52" height="85" rx="2"
                    fill={`hsla(260, ${4 + t * 3}%, ${8 + t * 3}%, ${0.04 + t * 0.02})`} />
                  {/* Home button */}
                  <circle cx="110" cy="134" r="3"
                    fill="none" stroke={`hsla(260, 6%, 18%, 0.04)`} strokeWidth={safeSvgStroke(0.3)} />
                  {/* Vibration waves — only when vibrating */}
                  {vibrating && !full && (
                    <>
                      <motion.path d="M 75,60 C 72,55 72,45 75,40"
                        fill="none" stroke="hsla(260, 10%, 28%, 0.06)" strokeWidth="0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.06, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                      <motion.path d="M 145,60 C 148,55 148,45 145,40"
                        fill="none" stroke="hsla(260, 10%, 28%, 0.06)" strokeWidth="0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.06, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} />
                      <motion.path d="M 70,65 C 66,58 66,42 70,35"
                        fill="none" stroke="hsla(260, 8%, 25%, 0.04)" strokeWidth={safeSvgStroke(0.3)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.04, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                      <motion.path d="M 150,65 C 154,58 154,42 150,35"
                        fill="none" stroke="hsla(260, 8%, 25%, 0.04)" strokeWidth={safeSvgStroke(0.3)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.04, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                    </>
                  )}
                </motion.g>

                {/* "It didn't buzz" messages */}
                {checked > 0 && checked <= PHANTOM_COUNT && (
                  <motion.text x="110" y="160" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(260, ${10 + t * 8}%, ${30 + t * 10}%, ${0.08 + t * 0.05})`}
                    key={checked}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    transition={{ duration: 1 }}>
                    {MESSAGES[checked - 1]}
                  </motion.text>
                )}

                {/* Vigilance meter — decreasing */}
                <text x="20" y="172" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(260, 6%, 25%, ${0.04 + t * 0.02})`}>
                  vigilance: {Math.round((1 - t) * 100)}%
                </text>

                {/* SAFE — when complete */}
                {full && (
                  <motion.text x="110" y="20" textAnchor="middle" fontSize="6.5" fontFamily="monospace"
                    fill="hsla(260, 15%, 45%, 0.15)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                    transition={{ delay: 0.5, duration: 2 }}>
                    STILL
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={`${checked}-${vibrating}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {checked === 0 ? 'The phone is buzzing. Or is it?' : checked < PHANTOM_COUNT ? `Phantom ${checked}. ${MESSAGES[checked - 1]}` : 'Five phantom buzzes. None were real. The phone is still. You are safe.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: PHANTOM_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < checked ? 'hsla(260, 15%, 42%, 0.5)' : palette.primaryFaint, opacity: i < checked ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five buzzes. None of them were real. Your nervous system invented every single one. Phantom vibration syndrome, the hallucination of connection. The phone is still. The vigilance drops to zero. You are safe.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Signal detection theory. High anxiety lowers the brain's threshold for sensory detection, causing it to hallucinate signals that are not there. Stand down.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Buzz. Nothing. Still.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}