/**
 * INFINITE PLAYER #4 — The Dance Break
 * "Your body wants to wiggle. Let it. Serious people are boring."
 * INTERACTION: A music visualizer — 12 bars throbbing. Each tap
 * energizes them — 5 taps. Bars grow taller, pulse faster.
 * At the end: full visualizer, "MOVE." Somatic discharge.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ENERGY_STEPS = 5;
const BAR_COUNT = 12;

export default function Infinite_DanceBreak({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [energy, setEnergy] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const energize = () => {
    if (stage !== 'active' || energy >= ENERGY_STEPS) return;
    const next = energy + 1;
    setEnergy(next);
    if (next >= ENERGY_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = energy / ENERGY_STEPS;
  const barMax = 15 + t * 65; // max bar height grows
  const speed = 1.5 - t * 1; // animation speed increases

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The beat is starting...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stop thinking. Move for 10 seconds. Shake the dust off. Your body wants to wiggle. Let it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to energize the visualizer</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={energize}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: energy >= ENERGY_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(${300 + t * 30}, ${5 + t * 5}%, ${4 + t * 3}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Visualizer bars */}
                {Array.from({ length: BAR_COUNT }, (_, i) => {
                  const x = 20 + i * 15;
                  const baseH = 5 + (Math.sin(i * 0.8) * 0.5 + 0.5) * barMax;
                  const hue = 280 + i * 8 + t * 40;
                  return (
                    <motion.rect key={i}
                      x={x} width="10" rx="2"
                      fill={`hsla(${hue}, ${15 + t * 15}%, ${22 + t * 15}%, ${0.06 + t * 0.06})`}
                      initial={{
                        height: baseH * 0.4,
                        y: 120 - baseH * 0.4,
                      }}
                      animate={{
                        height: [baseH * 0.4, baseH, baseH * 0.6, baseH * 0.9, baseH * 0.3],
                        y: [120 - baseH * 0.4, 120 - baseH, 120 - baseH * 0.6, 120 - baseH * 0.9, 120 - baseH * 0.3],
                      }}
                      transition={{
                        duration: speed,
                        repeat: Infinity,
                        delay: i * 0.08,
                        ease: 'easeInOut',
                      }}
                    />
                  );
                })}

                {/* Floor line */}
                <line x1="15" y1="120" x2="205" y2="120"
                  stroke={`hsla(300, 8%, 18%, ${0.03 + t * 0.02})`}
                  strokeWidth="0.3" />

                {/* MOVE text — at full energy */}
                {t >= 1 && (
                  <motion.text x="110" y="30" textAnchor="middle" fontSize="14"
                    fontFamily="Impact, sans-serif" letterSpacing="4"
                    fill="hsla(320, 20%, 45%, 0.15)"
                    initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 0.15 }}
                    transition={{ type: 'spring', stiffness: 120 }}>
                    MOVE
                  </motion.text>
                )}

                {/* BPM */}
                <text x="15" y="135" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(300, ${8 + t * 8}%, ${20 + t * 8}%, ${0.04 + t * 0.03})`}>
                  BPM: {Math.round(60 + t * 80)}
                </text>
                <text x="205" y="135" textAnchor="end" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(300, ${8 + t * 8}%, ${20 + t * 8}%, ${0.04 + t * 0.03})`}>
                  energy: {Math.round(t * 100)}%
                </text>
              </svg>
            </div>
            <motion.div key={energy} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {energy === 0 ? 'Twelve bars. Barely pulsing. Low energy.' : energy < ENERGY_STEPS ? `Energy ${energy}. Bars growing. Pulse quickening.` : 'Full throttle. MOVE. Shake the dust off.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ENERGY_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < energy ? 'hsla(320, 20%, 48%, 0.5)' : palette.primaryFaint, opacity: i < energy ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five energizes. Twelve bars went from a whisper to a roar. The BPM climbed. The colors shifted from cool to hot. MOVE. Your body wants to wiggle. Let it. Serious people are boring.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Somatic discharge. Rhythmic movement shakes off cortisol and signals safety to the autonomic nervous system. Move for 10 seconds. Shake the dust off.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Bars. Pulse. Move.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}