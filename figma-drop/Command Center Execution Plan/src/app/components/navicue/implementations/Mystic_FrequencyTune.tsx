/**
 * MYSTIC #7 — The Frequency Tune
 * "Emotion is energy vibrating. Fear jagged. Love smooth. Tune it."
 * INTERACTION: A jagged waveform. Each tap smooths it — 5 taps.
 * The chaotic wave progressively becomes a clean sine curve.
 * HRV coherence visualization. Tune the instrument.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TUNE_STEPS = 5;

function buildWavePath(smoothness: number): string {
  const points: string[] = [];
  const w = 200, h = 60, cy = 70;
  const chaos = 1 - smoothness;
  for (let x = 0; x <= w; x += 2) {
    const sine = Math.sin((x / w) * Math.PI * 4) * 20;
    const noise = chaos * (Math.sin(x * 0.7) * 12 + Math.cos(x * 1.3) * 8 + Math.sin(x * 2.1) * 5);
    const y = cy + sine + noise;
    points.push(`${10 + x},${y}`);
  }
  return `M ${points.join(' L ')}`;
}

export default function Mystic_FrequencyTune({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tuned, setTuned] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const tune = () => {
    if (stage !== 'active' || tuned >= TUNE_STEPS) return;
    const next = tuned + 1;
    setTuned(next);
    if (next >= TUNE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = tuned / TUNE_STEPS;
  const wavePath = buildWavePath(t);
  const hue = 0 + t * 160; // red→green as it smooths

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A jagged signal...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Emotion is energy vibrating at a specific frequency. Fear is a jagged wave. Love is a smooth wave. Tune the instrument.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to smooth the waveform</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={tune}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: tuned >= TUNE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(${hue}, ${4 + t * 4}%, ${4 + t * 2}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Baseline */}
                <line x1="10" y1="70" x2="210" y2="70"
                  stroke={`hsla(${hue}, 6%, 15%, 0.03)`} strokeWidth="0.3" strokeDasharray="3 3" />

                {/* Waveform */}
                <motion.path d={wavePath}
                  fill="none"
                  stroke={`hsla(${hue}, ${12 + t * 15}%, ${28 + t * 15}%, ${0.1 + t * 0.08})`}
                  strokeWidth={0.6 + t * 0.3}
                  strokeLinecap="round"
                  initial={{ d: wavePath }}
                  animate={{ d: wavePath }}
                  transition={{ type: 'spring', stiffness: 30, damping: 15 }}
                />

                {/* Coherence glow at smooth */}
                {t >= 1 && (
                  <motion.rect x="10" y="40" width="200" height="60" rx="4"
                    fill={`hsla(${hue}, 15%, 30%, 0.03)`}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    transition={{ duration: 2 }}
                  />
                )}

                {/* Frequency label */}
                <text x="15" y="18" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${hue}, ${8 + t * 8}%, ${22 + t * 10}%, ${0.05 + t * 0.03})`}>
                  {t >= 1 ? 'coherent' : t > 0.5 ? 'smoothing' : 'chaotic'}
                </text>

                {/* Coherence % */}
                <text x="205" y="18" textAnchor="end" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${hue}, ${8 + t * 8}%, ${22 + t * 10}%, ${0.05 + t * 0.03})`}>
                  coherence: {Math.round(t * 100)}%
                </text>

                {/* Fader indicator */}
                <rect x="10" y="120" width="200" height="3" rx="1.5"
                  fill={`hsla(${hue}, 6%, 12%, 0.04)`} />
                <motion.rect x="10" y="120" width={200 * t} height="3" rx="1.5"
                  fill={`hsla(${hue}, ${12 + t * 10}%, ${25 + t * 12}%, ${0.06 + t * 0.05})`}
                  animate={{ width: 200 * t }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                <text x="110" y="135" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${hue}, 6%, 22%, ${0.04 + t * 0.02})`}>
                  tune {tuned}/{TUNE_STEPS}
                </text>
              </svg>
            </div>
            <motion.div key={tuned} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {tuned === 0 ? 'A jagged, chaotic waveform. Fear frequency.' : tuned < TUNE_STEPS ? `Tune ${tuned}. The wave is smoothing.` : 'Pure sine wave. Love frequency. Coherent.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: TUNE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < tuned ? `hsla(${hue}, 18%, 45%, 0.5)` : palette.primaryFaint, opacity: i < tuned ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five tunes. The jagged red wave smoothed into a green sine curve. Fear became love. Chaos became coherence. The instrument is tuned. Your heart rate variability shifted from noise to signal.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>HRV coherence is literally the smoothing of the heart's waveform. Visual biofeedback reinforces this physiological shift. Tune the instrument.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Jagged. Smooth. Tuned.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}