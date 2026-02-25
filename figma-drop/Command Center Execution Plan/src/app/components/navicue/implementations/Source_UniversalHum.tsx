/**
 * SOURCE #9 — The Universal Hum
 * "Everything is vibration. Tune yourself to the fundamental note."
 * INTERACTION: Concentric vibration rings emanating from center.
 * Each tap adds a harmonic layer — the rings multiply and synchronize.
 * At full harmonics, the visual hum becomes unified. 136.1 Hz.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const HARMONIC_STEPS = 5;

export default function Source_UniversalHum({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [harmonics, setHarmonics] = useState(0);
  const [phase, setPhase] = useState(0);
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
    const tick = () => { setPhase(p => p + 0.04); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const addHarmonic = () => {
    if (stage !== 'active' || harmonics >= HARMONIC_STEPS) return;
    const next = harmonics + 1;
    setHarmonics(next);
    if (next >= HARMONIC_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = harmonics / HARMONIC_STEPS;
  const ringCount = 4 + harmonics * 2;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A vibration...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Everything is vibration. Tune yourself to the fundamental note.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to add harmonics</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={addHarmonic}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: harmonics >= HARMONIC_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden', background: 'hsla(270, 10%, 6%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                {/* Vibration rings — concentric, oscillating */}
                {Array.from({ length: ringCount }, (_, i) => {
                  const baseR = 8 + (i / ringCount) * 75;
                  const harmonic = 1 + (i % (harmonics + 1));
                  const oscillation = Math.sin(phase * harmonic + i * 0.5) * (2 + t * 3);
                  const r = baseR + oscillation;
                  const hue = 270 + (i / ringCount) * 50 - t * 30;
                  const sync = t > 0.8 ? 0.9 : 0.3 + t * 0.3;
                  return (
                    <circle key={i} cx="95" cy="95" r={Math.max(r, 3)}
                      fill="none"
                      stroke={`hsla(${hue}, ${20 + t * 15}%, ${35 + t * 15}%, ${(0.06 + t * 0.06) * sync})`}
                      strokeWidth={0.5 + t * 0.3}
                    />
                  );
                })}
                {/* Center node — the fundamental */}
                <circle cx="95" cy="95" r={4 + Math.sin(phase) * 1.5 + t * 3}
                  fill={`hsla(${270 - t * 50}, ${30 + t * 20}%, ${40 + t * 20}%, ${0.15 + t * 0.25})`} />
                {/* Frequency label */}
                <text x="95" y="180" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(270, 15%, 40%, ${0.1 + t * 0.15})`}>
                  {(136.1 * (1 + t * 0.001)).toFixed(1)} Hz
                </text>
                {/* Om symbol at high harmonics */}
                {t > 0.6 && (
                  <motion.text x="95" y="100" textAnchor="middle" dominantBaseline="middle"
                    fontSize={16 + t * 6} fontFamily="serif" fontWeight="300"
                    fill={`hsla(${270 - t * 40}, 20%, 50%, ${(t - 0.6) * 0.2})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.6) * 0.2 }}>
                    ॐ
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={harmonics} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {harmonics === 0 ? 'One vibration. The fundamental.' : harmonics < HARMONIC_STEPS ? `${harmonics + 1} harmonics layered.` : 'All harmonics unified. The universal hum.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: HARMONIC_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < harmonics ? `hsla(${270 - i * 8}, 30%, ${45 + i * 4}%, 0.5)` : palette.primaryFaint, opacity: i < harmonics ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every ring vibrating. Every harmonic in tune. One hum. The universe's fundamental note. You are that vibration.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Vibrational entrainment. Specific frequencies synchronize brainwaves. Healing, relaxation, coherence, from a single tone.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            One note. Everything.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}