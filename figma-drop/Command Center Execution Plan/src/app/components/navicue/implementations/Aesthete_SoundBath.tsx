/**
 * AESTHETE #7 -- The Sound Bath
 * "The universe is vibration. Tune your internal string."
 * INTERACTION: A single sine wave oscillates on screen. Tap to
 * change its frequency -- watch and feel the wave stretch and compress.
 * Each frequency zone carries a different harmonic quality. Find your tone.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Somatic Regulation', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CHANNELS = [
  { hz: 'α', label: 'Alpha · Relaxation', wavelength: 30, color: 'hsla(200, 40%, 55%, 0.6)' },
  { hz: 'θ', label: 'Theta · Deep Calm', wavelength: 45, color: 'hsla(260, 35%, 55%, 0.6)' },
  { hz: 'δ', label: 'Delta · Stillness', wavelength: 60, color: 'hsla(220, 30%, 45%, 0.5)' },
];

export default function Aesthete_SoundBath({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [freqIdx, setFreqIdx] = useState(0);
  const [tuned, setTuned] = useState<number[]>([]);
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Animate wave
  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => {
      setPhase(prev => prev + 0.04);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const tuneFreq = useCallback(() => {
    if (stage !== 'active' || tuned.includes(freqIdx)) return;
    const next = [...tuned, freqIdx];
    setTuned(next);
    if (next.length >= CHANNELS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    } else {
      addTimer(() => setFreqIdx(prev => prev + 1), 2000);
    }
  }, [stage, freqIdx, tuned]);

  const current = CHANNELS[freqIdx];
  const isTuned = tuned.includes(freqIdx);

  const buildWavePath = (wl: number, ph: number) => {
    const points: string[] = [];
    for (let x = 0; x <= 240; x += 2) {
      const y = 50 + Math.sin((x / wl) * Math.PI * 2 + ph) * 30;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Somatic Regulation" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Tuning the frequency...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The universe is vibration. Tune your internal string.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to tune each frequency</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={tuneFreq}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: isTuned ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Wave visualization */}
            <div style={{ position: 'relative', width: '240px', height: '100px', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${isTuned ? current.color : palette.primaryFaint}` }}>
              <svg width="100%" height="100%" viewBox="0 0 240 100">
                {/* Center line */}
                <line x1="0" y1="50" x2="240" y2="50" stroke={palette.primaryFaint} strokeWidth={safeSvgStroke(0.3)} />
                {/* Wave */}
                <path d={buildWavePath(current.wavelength, phase)} fill="none" stroke={current.color} strokeWidth={isTuned ? 2 : 1.5} opacity={isTuned ? 0.7 : 0.4} />
                {/* Ghost wave for depth */}
                <path d={buildWavePath(current.wavelength, phase + 0.5)} fill="none" stroke={current.color} strokeWidth="0.5" opacity={0.15} />
              </svg>
              {/* Tuned glow */}
              {isTuned && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}
                  style={{ position: 'absolute', inset: 0, background: `linear-gradient(0deg, ${current.color}, transparent)` }} />
              )}
            </div>
            {/* Frequency label */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: current.color, fontSize: '16px', fontWeight: 300, letterSpacing: '0.1em' }}>{current.hz}</div>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4, marginTop: '4px' }}>{current.label}</div>
            </div>
            {/* Progress */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {CHANNELS.map((f, i) => (
                <motion.div key={i}
                  animate={{ opacity: tuned.includes(i) ? 0.6 : i === freqIdx ? 0.3 : 0.1 }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: tuned.includes(i) ? f.color : palette.primaryFaint }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>
              {isTuned ? 'tuned' : 'tap to tune'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Tuned. The string hums.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Harmony is not found. It is tuned. The spheres are singing.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            ∿ harmonic ∿
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}