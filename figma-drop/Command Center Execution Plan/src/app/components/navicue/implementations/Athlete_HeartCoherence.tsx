/**
 * ATHLETE #9 -- The Heart Coherence
 * "Get the head and the heart to beat in the same rhythm."
 * INTERACTION: A smooth sine wave scrolls. A breathing guide cursor
 * rides the wave. You tap in rhythm to "sync the drum."
 * 5 synced beats. The wave smooths. HRV coherence achieved.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SYNC_BEATS = 5;

export default function Athlete_HeartCoherence({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [beats, setBeats] = useState(0);
  const [wavePhase, setWavePhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setWavePhase(p => p + 0.03); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const syncBeat = () => {
    if (stage !== 'active' || beats >= SYNC_BEATS) return;
    const next = beats + 1;
    setBeats(next);
    if (next >= SYNC_BEATS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = beats / SYNC_BEATS;
  const coherence = t;

  // Sine wave -- smoother with more coherence
  const buildWave = (yOffset: number, amplitude: number, noise: number) => {
    const points: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = 10 + (i / 80) * 180;
      const clean = Math.sin(wavePhase * 2 + i * 0.08) * amplitude;
      const n = Math.sin(wavePhase * 5 + i * 0.3) * noise * (1 - coherence);
      points.push(`${x},${yOffset + clean + n}`);
    }
    return `M ${points.join(' L ')}`;
  };

  // Cursor position
  const cursorX = 100;
  const cursorY = 80 + Math.sin(wavePhase * 2 + 45 * 0.08) * (20 + coherence * 5);

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A rhythm waits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Sync the drum. Get the head and the heart to beat in the same rhythm. Coherence.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap in rhythm with the wave</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={syncBeat}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: beats >= SYNC_BEATS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(0, ${4 + coherence * 8}%, ${7 + coherence * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Coherence glow */}
                <defs>
                  <radialGradient id={`${svgId}-cohGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(0, 25%, 45%, ${coherence * 0.08})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="200" height="160" fill={`url(#${svgId}-cohGlow)`} />

                {/* Main wave -- heart */}
                <path d={buildWave(80, 20 + coherence * 5, 8)}
                  fill="none"
                  stroke={`hsla(0, ${18 + coherence * 15}%, ${35 + coherence * 12}%, ${0.12 + coherence * 0.1})`}
                  strokeWidth={0.8 + coherence * 0.4}
                  strokeLinecap="round" />

                {/* Breath guide wave -- thinner, above */}
                <path d={buildWave(80, 18 + coherence * 7, 4)}
                  fill="none"
                  stroke={`hsla(200, ${15 + coherence * 10}%, ${35 + coherence * 10}%, ${0.06 + coherence * 0.06})`}
                  strokeWidth={0.4 + coherence * 0.2}
                  strokeLinecap="round"
                  strokeDasharray={coherence > 0.5 ? 'none' : '3 3'} />

                {/* Breathing cursor */}
                <circle cx={cursorX} cy={cursorY} r={3 + coherence * 1.5}
                  fill={`hsla(0, ${20 + coherence * 15}%, ${40 + coherence * 12}%, ${0.12 + coherence * 0.08})`}
                  stroke={`hsla(0, ${15 + coherence * 10}%, ${35 + coherence * 10}%, 0.08)`}
                  strokeWidth="0.5" />

                {/* Baseline */}
                <line x1="10" y1="80" x2="190" y2="80"
                  stroke="hsla(0, 0%, 20%, 0.03)" strokeWidth={safeSvgStroke(0.3)} />

                {/* HRV readout */}
                <text x="100" y="145" textAnchor="middle" fontSize="6" fontFamily="monospace"
                  fill={`hsla(0, ${12 + coherence * 8}%, ${32 + coherence * 10}%, ${0.08 + coherence * 0.06})`}>
                  HRV coherence: {Math.round(coherence * 100)}%
                </text>

                {/* Coherence label */}
                {t >= 1 && (
                  <motion.text x="100" y="28" textAnchor="middle" fontSize="7" fontFamily="monospace"
                    fill="hsla(0, 18%, 48%, 0.2)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    COHERENT
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={beats} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {beats === 0 ? 'Two waves. Noisy. Out of sync.' : beats < SYNC_BEATS ? `Beat ${beats}. Waves aligning. Noise dropping.` : 'Coherent. One smooth rhythm.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SYNC_BEATS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < beats ? 'hsla(0, 20%, 48%, 0.5)' : palette.primaryFaint, opacity: i < beats ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five beats synced. The noisy waves smoothed into one clean curve. Head and heart in the same rhythm. Coherence.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Heart rate variability. High coherence between respiration and heart rate is the physiological signature of resilience and emotional stability. The drum synced.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Noisy. Sync. Coherent.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}