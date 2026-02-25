/**
 * ALCHEMIST II #6 -- The Anxiety Anchor
 * "Tension makes the music possible. Tune the string. Play the note."
 * INTERACTION: A vibrating string rendered as a sine wave with
 * increasing frequency. Tap to tune it -- vibration narrows, then
 * produces a clear, single musical note. Eustress from chaos.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Somatic Regulation', 'embodying', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TUNE_STEPS = 5;

export default function AlchemistII_AnxietyAnchor({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tuned, setTuned] = useState(0);
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
    const tick = () => { setPhase(p => p + 0.06); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const tune = () => {
    if (stage !== 'active' || tuned >= TUNE_STEPS) return;
    const next = tuned + 1;
    setTuned(next);
    if (next >= TUNE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = tuned / TUNE_STEPS;
  // Chaos → order: amplitude decreases, frequency stabilizes
  const chaos = 1 - t;
  const baseAmp = 25 * chaos + 8;
  const noiseAmp = 15 * chaos;
  const freq = 0.04 + t * 0.02;
  const stringColor = `hsla(${220 + t * 30}, ${30 + t * 25}%, ${40 + t * 15}%, ${0.3 + t * 0.3})`;

  const buildString = () => {
    const points: string[] = [];
    for (let x = 10; x <= 210; x += 2) {
      const clean = Math.sin(x * freq + phase) * baseAmp;
      const noise = Math.sin(x * 0.15 + phase * 2.3) * noiseAmp
        + Math.sin(x * 0.23 + phase * 1.7) * noiseAmp * 0.5;
      const y = 80 + clean + noise;
      points.push(`${x},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Somatic Regulation" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A string vibrates...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Tension makes the music possible. Tune the string. Play the note.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to tune</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={tune}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: tuned >= TUNE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(240, 10%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Anchor points */}
                <circle cx="10" cy="80" r="3" fill="hsla(0, 0%, 30%, 0.3)" />
                <circle cx="210" cy="80" r="3" fill="hsla(0, 0%, 30%, 0.3)" />
                {/* String */}
                <polyline points={buildString()} fill="none"
                  stroke={stringColor} strokeWidth={1 + t * 0.5} strokeLinecap="round" />
                {/* Ghost string echo */}
                <polyline points={buildString()} fill="none"
                  stroke={stringColor} strokeWidth="0.5" opacity={0.15}
                  style={{ transform: 'translateY(3px)' }} />
                {/* Center line -- true pitch reference */}
                <line x1="10" y1="80" x2="210" y2="80"
                  stroke={`hsla(250, 20%, 40%, ${0.05 + t * 0.08})`} strokeWidth="0.5"
                  strokeDasharray="4 8" />
                {/* Musical note -- appears when tuned */}
                {tuned >= TUNE_STEPS && (
                  <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.5, y: 0 }} transition={{ duration: 1.5 }}>
                    <ellipse cx="110" cy="50" rx="6" ry="4" fill={stringColor} transform="rotate(-15, 110, 50)" />
                    <line x1="116" y1="50" x2="116" y2="25" stroke={stringColor} strokeWidth="1" />
                    <path d="M 116 25 Q 122 28, 116 33" fill="none" stroke={stringColor} strokeWidth="0.8" />
                  </motion.g>
                )}
                {/* Resonance rings when tuned */}
                {tuned >= TUNE_STEPS && [25, 35, 45].map((r, i) => (
                  <motion.circle key={i} cx="110" cy="80" r={r}
                    fill="none" stroke={`hsla(250, 30%, 55%, 0.04)`} strokeWidth="0.5"
                    initial={{ r: r - 10, opacity: 0 }}
                    animate={{ r, opacity: 0.1 }}
                    transition={{ delay: i * 0.3, duration: 1 }}
                  />
                ))}
              </svg>
            </div>
            <motion.div key={tuned} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {tuned === 0 ? 'Chaotic vibration. Anxious string.' : tuned < TUNE_STEPS ? `Tuning... ${Math.floor(t * 100)}% clarity.` : 'Clear note. Perfect tension.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: TUNE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < tuned ? 'hsla(250, 35%, 55%, 0.5)' : palette.primaryFaint, opacity: i < tuned ? 0.7 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The tension made the music. Anxiety was the instrument. You tuned it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Eustress converted. Yerkes-Dodson optimal. The note rings clear.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Tension. Tuned. Music.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}