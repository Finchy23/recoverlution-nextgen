/**
 * ALCHEMIST II #4 -- The Envy Map
 * "Envy is not a sin. It is a map. It shows you what you secretly want."
 * INTERACTION: A green eye that transforms into a compass needle.
 * Tap to rotate the needle -- it points from resentment to ambition.
 * The golden shadow reclaimed.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PHASES = [
  { label: 'The green eye. Envy sees.', rotation: 0, morphProgress: 0 },
  { label: 'Not a sin. A signal.', rotation: 45, morphProgress: 0.25 },
  { label: 'What do you secretly want?', rotation: 135, morphProgress: 0.5 },
  { label: 'Follow the needle.', rotation: 315, morphProgress: 0.75 },
  { label: 'Compass North. Ambition.', rotation: 360, morphProgress: 1 },
];

export default function AlchemistII_EnvyMap({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [phaseIdx, setPhaseIdx] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const advance = () => {
    if (stage !== 'active' || phaseIdx >= PHASES.length - 1) return;
    const next = phaseIdx + 1;
    setPhaseIdx(next);
    if (next >= PHASES.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const current = PHASES[phaseIdx];
  const m = current.morphProgress; // 0 = eye, 1 = compass
  const greenToGold = `hsla(${120 - m * 80}, ${50 - m * 10}%, ${40 + m * 15}%, ${0.4 + m * 0.2})`;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The green eye opens...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Envy is not a sin. It is a map. It shows you what you secretly want. Follow it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to turn the eye into a compass</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={advance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: phaseIdx >= PHASES.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(140, 10%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                <g transform="translate(100, 80)">
                  {/* Outer shape: morphs from eye to circle */}
                  <motion.path
                    d={m < 0.5
                      ? `M -40 0 Q -20 ${-25 * (1 - m * 2)}, 0 ${-30 * (1 - m * 2)} Q 20 ${-25 * (1 - m * 2)}, 40 0 Q 20 ${25 * (1 - m * 2)}, 0 ${30 * (1 - m * 2)} Q -20 ${25 * (1 - m * 2)}, -40 0 Z`
                      : ''
                    }
                    fill="none"
                    stroke={greenToGold}
                    strokeWidth="1.5"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: m < 0.5 ? 0.6 : 0 }}
                  />
                  {/* Compass circle -- fades in */}
                  <motion.circle cx="0" cy="0" r="40"
                    fill="none"
                    stroke={greenToGold}
                    strokeWidth={1 + m}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: m > 0.3 ? 0.5 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                  {/* Inner ring */}
                  <motion.circle cx="0" cy="0" r="30"
                    fill="none"
                    stroke={greenToGold}
                    strokeWidth="0.5"
                    strokeDasharray={m > 0.5 ? '2 8' : '0 0'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: m * 0.3 }}
                  />
                  {/* Iris/pupil morphs to compass center */}
                  <motion.circle cx="0" cy="0" r={12 - m * 8}
                    fill={`hsla(${120 - m * 80}, ${40 - m * 10}%, ${30 + m * 10}%, ${0.3 + m * 0.2})`}
                    initial={{ r: 12 }}
                    animate={{ r: 12 - m * 8 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.circle cx="0" cy="0" r={4 - m * 1}
                    fill={`hsla(${120 - m * 80}, 30%, 20%, ${0.4 + m * 0.2})`}
                  />
                  {/* Compass needle -- fades in */}
                  {m > 0.2 && (
                    <motion.g
                      animate={{ rotate: current.rotation }}
                      transition={{ duration: 1, type: 'spring', stiffness: 60 }}>
                      {/* North needle */}
                      <motion.polygon
                        points="0,-35 -4,-5 4,-5"
                        fill={`hsla(40, 60%, 55%, ${m * 0.6})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: m * 0.6 }}
                      />
                      {/* South needle */}
                      <motion.polygon
                        points="0,35 -3,5 3,5"
                        fill={`hsla(220, 20%, 30%, ${m * 0.3})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: m * 0.3 }}
                      />
                    </motion.g>
                  )}
                  {/* Cardinal marks -- compass */}
                  {m > 0.5 && ['N', 'E', 'S', 'W'].map((dir, i) => {
                    const angle = (i * Math.PI / 2) - Math.PI / 2;
                    return (
                      <motion.text key={dir}
                        x={Math.cos(angle) * 48} y={Math.sin(angle) * 48 + 3}
                        textAnchor="middle" fontSize="7" fontFamily="monospace"
                        fill={`hsla(40, 40%, 55%, ${(m - 0.5) * 0.6})`}
                        initial={{ opacity: 0 }} animate={{ opacity: (m - 0.5) * 0.5 }}>
                        {dir}
                      </motion.text>
                    );
                  })}
                </g>
              </svg>
            </div>
            <motion.div key={phaseIdx} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>{current.label}</div>
            </motion.div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {PHASES.map((_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i <= phaseIdx ? greenToGold : palette.primaryFaint, opacity: i <= phaseIdx ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The green eye became a golden compass. Resentment alchemized into direction.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Golden shadow reclaimed. What you envied, you secretly are. Follow the needle.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Envy. Map. North.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}