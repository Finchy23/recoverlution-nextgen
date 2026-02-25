/**
 * MAGNUMOPUS #1 — Prima Materia
 * "Everything gold was once lead."
 * ARCHETYPE: Pattern A (Tap ×5) — Five alchemical stages:
 * nigredo → albedo → citrinitas → rubedo → the stone.
 * Each tap transmutes the matter. Psychological Alchemy.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNUMOPUS_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Ember');
const TH = MAGNUMOPUS_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PHASES = [
  { name: 'NIGREDO', desc: 'the blackening, what must be burned away', hsl: [0, 0, 6], glow: [0, 0, 12] },
  { name: 'ALBEDO', desc: 'the whitening, clarity after destruction', hsl: [0, 0, 22], glow: [0, 0, 35] },
  { name: 'CITRINITAS', desc: 'the yellowing, dawn of new understanding', hsl: [48, 28, 25], glow: [48, 35, 40] },
  { name: 'RUBEDO', desc: 'the reddening, the heart of the work', hsl: [8, 35, 28], glow: [8, 40, 38] },
  { name: 'THE STONE', desc: 'what cannot be destroyed', hsl: [48, 30, 38], glow: [48, 35, 52] },
];

export default function MagnumOpus_PrimaMateria({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const transmute = () => {
    if (stage !== 'active' || taps >= PHASES.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= PHASES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const phase = PHASES[Math.min(taps, PHASES.length - 1)];
  const pc = (a: number, lo = 0) => `hsla(${phase.hsl[0]}, ${phase.hsl[1]}%, ${Math.min(100, phase.hsl[2] + lo)}%, ${a})`;
  const gc = (a: number) => `hsla(${phase.glow[0]}, ${phase.glow[1]}%, ${phase.glow[2]}%, ${a})`;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Raw matter stirs...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The alchemists knew: gold is not created. It is revealed. The lead was always gold, buried under impurity. Five stages of fire, and the stone appears.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to transmute</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={transmute}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= PHASES.length ? 'default' : 'pointer' }}>

            <AnimatePresence mode="wait">
              <motion.div key={taps}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8 }}
                style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg width="100%" height="100%" viewBox="0 0 180 180">
                  {/* Ambient glow */}
                  <circle cx="90" cy="90" r="70" fill={gc(0.04)} />
                  <circle cx="90" cy="90" r="50" fill={gc(0.06)} />

                  {/* The matter — morphing form */}
                  <motion.circle cx="90" cy="90" r={30 + taps * 3}
                    fill={pc(0.9)}
                    stroke={gc(0.15)}
                    strokeWidth="0.5"
                    animate={{ r: [30 + taps * 3, 33 + taps * 3, 30 + taps * 3] }}
                    transition={{ duration: 2.5, repeat: Infinity }} />

                  {/* Inner crystalline structure — appears with progression */}
                  {taps >= 2 && Array.from({ length: taps }, (_, i) => {
                    const a = (i / taps) * Math.PI * 2;
                    const r = 12 + taps * 2;
                    return (
                      <motion.line key={i}
                        x1={90 + Math.cos(a) * 5} y1={90 + Math.sin(a) * 5}
                        x2={90 + Math.cos(a) * r} y2={90 + Math.sin(a) * r}
                        stroke={gc(0.08 + taps * 0.02)}
                        strokeWidth="0.4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }} />
                    );
                  })}

                  {/* Fire particles rising */}
                  {Array.from({ length: 4 + taps * 2 }, (_, i) => (
                    <motion.circle key={`p-${i}`}
                      cx={60 + (i * 17) % 70} cy={140}
                      r={0.8 + (i % 2) * 0.4}
                      fill={gc(0.08)}
                      initial={{ cy: 140, opacity: 0.08 }}
                      animate={{ cy: [140, 40 + (i % 3) * 15], opacity: [0.08, 0] }}
                      transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }} />
                  ))}

                  {/* Phase label */}
                  <text x="90" y="155" textAnchor="middle" fontSize="6" fontFamily="monospace"
                    fill={gc(0.15)} letterSpacing="0.12em">
                    {phase.name}
                  </text>
                  <text x="90" y="168" textAnchor="middle" fontSize="5" fontFamily="serif" fontStyle="italic"
                    fill={gc(0.1)}>
                    {phase.desc}
                  </text>
                </svg>
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '6px' }}>
              {PHASES.map((_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.25, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Five fires. The lead is gone. What remains cannot be burned. Jung called it individuation. The alchemists called it the philosopher{'\u2019'}s stone. You might call it becoming yourself.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>everything gold was once lead</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The stone appears.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}