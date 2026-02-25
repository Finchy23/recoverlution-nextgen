/**
 * PHENOMENOLOGIST #3 — The Blind Walk
 * "Vision is a tyrant. Dethrone it. Let the skin see."
 * INTERACTION: Screen goes absolute black. Three steps to take
 * with eyes closed — each step reveals a different non-visual
 * sensory channel. Air on skin. Floor beneath feet. Sound of space.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Somatic Regulation', 'embodying', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STEPS = [
  { sense: 'skin', instruction: 'Step one. Feel the air on your skin.', reveal: 'The skin sees temperature, pressure, movement.', icon: '〰' },
  { sense: 'feet', instruction: 'Step two. Feel the floor listen beneath you.', reveal: 'The feet read the earth. Texture, slope, solidity.', icon: '◌' },
  { sense: 'ears', instruction: 'Step three. Hear the shape of the room.', reveal: 'Sound maps space. Echolocation. You always knew.', icon: '◎' },
];

export default function Phenomenologist_BlindWalk({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stepIdx, setStepIdx] = useState(-1);
  const [revealing, setRevealing] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const takeStep = () => {
    if (stage !== 'active' || revealing) return;
    const next = stepIdx + 1;
    if (next >= STEPS.length) return;
    setStepIdx(next);
    setRevealing(true);
    addTimer(() => {
      setRevealing(false);
      if (next >= STEPS.length - 1) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
      }
    }, 4000);
  };

  const current = stepIdx >= 0 ? STEPS[stepIdx] : null;
  const darkness = stage === 'active' ? 0.95 : 0;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Somatic Regulation" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The lights dim...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Vision is a tyrant. Dethrone it. Let the skin see. Let the feet listen.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>close your eyes and tap to take a step</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={takeStep}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: revealing || stepIdx >= STEPS.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* The void */}
            <motion.div
              animate={{ opacity: darkness }}
              style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(0, 0%, 2%, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Minimal sensory indicators */}
              {current && revealing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ duration: 2 }}
                  style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Sensory traces — barely visible */}
                  {current.sense === 'skin' && (
                    <svg width="100%" height="100%" viewBox="0 0 220 160">
                      {Array.from({ length: 8 }, (_, i) => (
                        <motion.line key={i}
                          x1={20 + i * 25} y1={40 + Math.sin(i) * 20}
                          x2={30 + i * 25} y2={120 + Math.cos(i) * 15}
                          stroke="hsla(200, 20%, 50%, 0.15)" strokeWidth="0.5"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                          transition={{ duration: 2, delay: i * 0.2 }}
                        />
                      ))}
                    </svg>
                  )}
                  {current.sense === 'feet' && (
                    <svg width="100%" height="100%" viewBox="0 0 220 160">
                      <motion.line x1="0" y1="130" x2="220" y2="130"
                        stroke="hsla(25, 15%, 35%, 0.12)" strokeWidth="1"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2 }}
                      />
                      {[60, 110, 160].map((x, i) => (
                        <motion.circle key={i} cx={x} cy="130" r="3"
                          fill="hsla(25, 15%, 35%, 0.08)"
                          initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                          transition={{ delay: i * 0.5 }}
                        />
                      ))}
                    </svg>
                  )}
                  {current.sense === 'ears' && (
                    <svg width="100%" height="100%" viewBox="0 0 220 160">
                      {[30, 50, 70].map((r, i) => (
                        <motion.circle key={i} cx="110" cy="80" r={r}
                          fill="none" stroke="hsla(260, 20%, 45%, 0.08)" strokeWidth="0.5"
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ duration: 1.5, delay: i * 0.4 }}
                        />
                      ))}
                    </svg>
                  )}
                </motion.div>
              )}
              {/* Step instruction */}
              {current && (
                <motion.div key={stepIdx} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 1.5 }}
                  style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '18px', opacity: 0.3 }}>{current.icon}</div>
                  <div style={{ ...navicueType.texture, color: 'hsla(0, 0%, 70%, 0.35)', fontSize: '11px', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5 }}>
                    {revealing ? current.reveal : current.instruction}
                  </div>
                </motion.div>
              )}
              {stepIdx < 0 && (
                <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 3, repeat: Infinity }}
                  style={{ ...navicueType.hint, color: 'hsla(0, 0%, 50%, 0.2)', fontSize: '11px' }}>
                  darkness. tap to step.
                </motion.div>
              )}
            </motion.div>
            {/* Progress */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= stepIdx ? 'hsla(0, 0%, 50%, 0.4)' : palette.primaryFaint, opacity: i <= stepIdx ? 0.5 : 0.12 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The skin saw. The feet listened. You never needed the eyes.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Neural plasticity activated. Other senses heightened. Grounded in the dark.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dark. Sensing. Alive.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}