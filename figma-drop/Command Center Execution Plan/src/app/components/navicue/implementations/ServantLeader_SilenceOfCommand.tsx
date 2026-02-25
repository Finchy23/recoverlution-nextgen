/**
 * SERVANT LEADER #3 — The Silence of Command
 * "The loudest person in the room is the weakest. Hold the silence."
 * INTERACTION: A conductor's baton raised. A waveform below it.
 * Each tap holds the silence longer — the waveform flattens toward
 * stillness. The room leans in. Power in the pause.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SILENCE_STEPS = 5;

export default function ServantLeader_SilenceOfCommand({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [silence, setSilence] = useState(0);
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

  const hold = () => {
    if (stage !== 'active' || silence >= SILENCE_STEPS) return;
    const next = silence + 1;
    setSilence(next);
    if (next >= SILENCE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = silence / SILENCE_STEPS;
  const waveAmplitude = 20 * (1 - t); // shrinks to flatline

  const buildWaveform = () => {
    const points: string[] = [];
    for (let x = 15; x <= 205; x += 2) {
      const noise = Math.sin(x * 0.08 + phase) * waveAmplitude
        + Math.sin(x * 0.15 + phase * 1.3) * waveAmplitude * 0.4
        + Math.sin(x * 0.22 + phase * 0.7) * waveAmplitude * 0.2;
      points.push(`${x},${105 + noise}`);
    }
    return points.join(' ');
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The baton rises...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The loudest person in the room is the weakest. Hold the silence. Let them lean in.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to hold silence</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={hold}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: silence >= SILENCE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(240, 10%, 7%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Conductor baton */}
                <motion.g initial={{ rotate: -15 }} animate={{ rotate: -15 + t * 15 }} style={{ transformOrigin: '110px 50px' }}>
                  <line x1="110" y1="50" x2="145" y2="25"
                    stroke={`hsla(0, 0%, ${40 + t * 20}%, ${0.3 + t * 0.2})`}
                    strokeWidth="2" strokeLinecap="round" />
                  {/* Baton tip glow */}
                  <circle cx="145" cy="25" r={2 + t * 1}
                    fill={`hsla(0, 0%, ${50 + t * 20}%, ${0.2 + t * 0.2})`} />
                </motion.g>
                {/* Hand holding baton */}
                <ellipse cx="110" cy="53" rx="6" ry="4"
                  fill={`hsla(30, 15%, 30%, ${0.15 + t * 0.05})`} />
                {/* Center reference line */}
                <line x1="15" y1="105" x2="205" y2="105"
                  stroke={`hsla(0, 0%, 25%, ${0.08 + t * 0.05})`}
                  strokeWidth="0.3" />
                {/* Waveform */}
                <polyline points={buildWaveform()} fill="none"
                  stroke={`hsla(220, 20%, ${40 + t * 15}%, ${0.3 - t * 0.1})`}
                  strokeWidth={1.5 - t * 0.5} strokeLinecap="round" />
                {/* Flatline glow when silent */}
                {t >= 1 && (
                  <motion.line x1="15" y1="105" x2="205" y2="105"
                    stroke="hsla(0, 0%, 55%, 0.15)" strokeWidth="1"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                    transition={{ duration: 1.5 }}
                  />
                )}
                {/* dB meter */}
                <text x="205" y="140" textAnchor="end" fontSize="11" fontFamily="monospace"
                  fill={`hsla(0, 0%, 40%, ${0.2 + t * 0.1})`}>
                  {Math.floor((1 - t) * 60)} dB
                </text>
              </svg>
            </div>
            <motion.div key={silence} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {silence === 0 ? 'Noise. The room is loud.' : silence < SILENCE_STEPS ? `Holding... ${Math.floor(t * 100)}% silence.` : 'Absolute silence. They lean in.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SILENCE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < silence ? 'hsla(0, 0%, 55%, 0.4)' : palette.primaryFaint, opacity: i < silence ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Silence held. The room leaned in. The quietest voice commanded the most attention.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Calmness signals competence. Noise signals distress. Silence is the highest status.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Silence. Command. Presence.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}