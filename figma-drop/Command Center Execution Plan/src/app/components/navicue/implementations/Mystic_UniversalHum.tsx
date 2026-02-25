/**
 * MYSTIC #9 — The Universal Hum
 * "Om. The sound of the engine of the universe."
 * INTERACTION: A circle at center vibrates in a tight, rapid oscillation.
 * Each tap deepens the resonance — 5 taps. The circle grows,
 * the vibration slows into a deep, smooth pulse. At the end:
 * a perfect, continuous drone. Vagal toning.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const HUM_STEPS = 5;

export default function Mystic_UniversalHum({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [depth, setDepth] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const deepen = () => {
    if (stage !== 'active' || depth >= HUM_STEPS) return;
    const next = depth + 1;
    setDepth(next);
    if (next >= HUM_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = depth / HUM_STEPS;
  const r = 15 + t * 30; // circle grows
  const dur = 0.3 + t * 1.7; // vibration slows: 0.3s → 2s

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Ommmmm...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Om. It is the sound of the engine of the universe. Hum with it. Disappear into the sound.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to deepen the resonance</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={deepen}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: depth >= HUM_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '260px' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(280, ${5 + t * 5}%, ${3 + t * 3}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Resonance rings — outer rings appear with depth */}
                {Array.from({ length: depth + 1 }, (_, i) => (
                  <motion.circle key={`ring-${i}`} cx="90" cy="90"
                    r={r + i * 8}
                    fill="none"
                    stroke={`hsla(280, ${10 + t * 8}%, ${20 + t * 10}%, ${0.02 + (depth - i) * 0.008})`}
                    strokeWidth="0.3"
                    animate={{
                      r: [r + i * 8, r + i * 8 + 2, r + i * 8],
                    }}
                    transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ))}

                {/* Core circle — vibrating */}
                <motion.circle cx="90" cy="90" r={r}
                  fill={`hsla(280, ${12 + t * 12}%, ${18 + t * 12}%, ${0.06 + t * 0.06})`}
                  stroke={`hsla(280, ${12 + t * 10}%, ${25 + t * 15}%, ${0.06 + t * 0.05})`}
                  strokeWidth={0.4 + t * 0.3}
                  animate={{
                    r: [r, r + 1.5, r],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Inner glow */}
                <motion.circle cx="90" cy="90" r={r * 0.5}
                  fill={`hsla(280, ${15 + t * 10}%, ${25 + t * 15}%, ${0.03 + t * 0.04})`}
                  animate={{
                    r: [r * 0.5, r * 0.55, r * 0.5],
                  }}
                  transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* OM glyph */}
                <motion.text x="90" y="94" textAnchor="middle" fontSize={8 + t * 4}
                  fontFamily="Georgia, serif"
                  fill={`hsla(280, ${12 + t * 12}%, ${30 + t * 18}%, ${0.06 + t * 0.08})`}
                  animate={{ opacity: [0.06 + t * 0.08, 0.08 + t * 0.1, 0.06 + t * 0.08] }}
                  transition={{ duration: dur, repeat: Infinity }}>
                  ॐ
                </motion.text>

                {/* Frequency readout */}
                <text x="90" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(280, ${8 + t * 8}%, ${22 + t * 10}%, ${0.05 + t * 0.03})`}>
                  {t >= 1 ? 'resonant. 432Hz.' : `depth: ${depth}/${HUM_STEPS}`}
                </text>
              </svg>
            </div>
            <motion.div key={depth} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {depth === 0 ? 'A tight, rapid vibration. Shallow. Anxious.' : depth < HUM_STEPS ? `Depth ${depth}. Vibration slowing. Circle growing.` : 'Deep, smooth pulse. The engine of the universe. Om.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: HUM_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < depth ? 'hsla(280, 18%, 48%, 0.5)' : palette.primaryFaint, opacity: i < depth ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five deepenings. The tight, anxious vibration slowed. The circle grew. Resonance rings radiated outward. At the center: OM. The sound of the engine of the universe. A perfect, continuous drone. You disappeared into it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Vagal toning. Self-generated vibration, humming, chanting, stimulates the vagus nerve, instantly activating the parasympathetic system. Hum with it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Vibrate. Slow. Om.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}