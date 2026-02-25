/**
 * FUTURIST #5 — The Analog Switch
 * "Glass separates. Paper connects."
 * INTERACTION: A sleek glass surface. Each tap adds paper grain
 * texture — 5 layers. The glass progressively roughens. At full
 * grain: pen lines appear hand-drawn. The digital surface became
 * analog. Haptic encoding engaged.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const GRAIN_STEPS = 5;

export default function Futurist_AnalogSwitch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [grain, setGrain] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const addGrain = () => {
    if (stage !== 'active' || grain >= GRAIN_STEPS) return;
    const next = grain + 1;
    setGrain(next);
    if (next >= GRAIN_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = grain / GRAIN_STEPS;
  const full = t >= 1;

  // Generate deterministic grain dots
  const grainDots = useRef(
    Array.from({ length: 200 }, (_, i) => ({
      x: (i * 37 + i * i * 3) % 220,
      y: (i * 23 + i * i * 7) % 180,
      r: 0.3 + (i % 5) * 0.15,
    }))
  ).current;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Smooth glass...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Glass separates. Paper connects. The friction of the pen slows the mind down to the speed of truth. Pick up a pen.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to add paper grain</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={addGrain}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: grain >= GRAIN_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(40, ${t * 8}%, ${5 + t * 6}%, ${0.9 + t * 0.05})` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Glass surface — fades as grain increases */}
                <motion.rect x="0" y="0" width="220" height="180" rx="0"
                  fill={`hsla(220, ${6 * (1 - t)}%, ${8 * (1 - t)}%, ${0.03 * (1 - t)})`}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 - t * 0.8 }}
                />
                {/* Glass reflection */}
                <motion.line x1="30" y1="20" x2="190" y2="30"
                  stroke={`hsla(220, 8%, 25%, ${0.03 * (1 - t)})`}
                  strokeWidth={safeSvgStroke(0.3)}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 - t }}
                />
                <motion.line x1="40" y1="40" x2="180" y2="48"
                  stroke={`hsla(220, 6%, 22%, ${0.02 * (1 - t)})`}
                  strokeWidth={safeSvgStroke(0.2)}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 - t }}
                />

                {/* Paper grain — dots increasing with each tap */}
                {grainDots.slice(0, grain * 40).map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r={d.r}
                    fill={`hsla(35, ${8 + i % 5}%, ${25 + i % 8}%, ${0.02 + t * 0.015})`} />
                ))}

                {/* Paper fiber lines */}
                {grain >= 2 && Array.from({ length: grain * 3 }, (_, i) => {
                  const y = 10 + i * 12;
                  return (
                    <line key={`fiber-${i}`}
                      x1={5 + (i * 7) % 30} y1={y}
                      x2={190 + (i * 3) % 25} y2={y + (i % 3) - 1}
                      stroke={`hsla(35, 6%, 22%, ${0.01 + t * 0.008})`}
                      strokeWidth="0.15" />
                  );
                })}

                {/* Hand-drawn pen lines — appear when full */}
                {full && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 2 }}>
                    {/* Wobbly handwritten lines */}
                    <motion.path d="M 40,60 C 55,58 70,62 85,59 C 100,56 115,61 130,58 C 145,55 160,60 175,57"
                      fill="none" stroke="hsla(220, 8%, 25%, 0.1)" strokeWidth="0.6" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
                    />
                    <motion.path d="M 40,75 C 58,73 76,77 94,74 C 112,71 130,76 148,73"
                      fill="none" stroke="hsla(220, 8%, 25%, 0.08)" strokeWidth="0.5" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.5 }}
                    />
                    <motion.path d="M 40,90 C 60,88 80,92 100,89 C 120,86 140,91 160,88"
                      fill="none" stroke="hsla(220, 8%, 25%, 0.07)" strokeWidth="0.4" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1 }}
                    />
                    {/* Pen nib mark */}
                    <circle cx="160" cy="88" r="1.5" fill="hsla(220, 10%, 28%, 0.08)" />
                  </motion.g>
                )}

                {/* Texture label */}
                <text x="110" y="140" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${full ? 35 : 220}, ${6 + t * 6}%, ${22 + t * 8}%, ${0.05 + t * 0.04})`}>
                  {full ? 'paper. write it.' : grain === 0 ? 'glass. smooth, empty.' : `grain: ${grain}/${GRAIN_STEPS}`}
                </text>

                {/* Material readout */}
                <text x="15" y="170" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(${full ? 35 : 220}, 6%, 25%, ${0.04 + t * 0.02})`}>
                  surface: {full ? 'analog' : grain === 0 ? 'digital' : 'transitioning'}
                </text>
              </svg>
            </div>
            <motion.div key={grain} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {grain === 0 ? 'Sleek glass. Frictionless. Empty.' : grain < GRAIN_STEPS ? `Grain layer ${grain}. The surface is roughening.` : 'Full paper grain. Pen lines appearing. Truth at the speed of handwriting.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: GRAIN_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < grain ? 'hsla(35, 15%, 42%, 0.5)' : palette.primaryFaint, opacity: i < grain ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five layers of grain. The glass roughened. Fibers appeared. Then a pen began writing, slow, wobbly, human. Pixels are temporary. Atoms are forever. The friction of the pen slows the mind down to the speed of truth.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Haptic encoding. Writing by hand engages the reticular activating system differently than typing, improving memory retention and conceptual synthesis. Write it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Glass. Grain. Pen.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}