/**
 * LOVER #2 — The 30-Second Gaze
 * "Oxytocin peaks after 20 seconds of eye contact."
 * INTERACTION: Two interlocking circles, slightly offset. A 30-second
 * timer runs. The circles pulse in sync — heartbeat rhythm. As seconds
 * pass, the circles drift closer. At 30s: they perfectly overlap.
 * Nervous systems synced.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const GAZE_DURATION = 30; // seconds

export default function Lover_30SecondGaze({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [gazing, setGazing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pulse, setPulse] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const startGaze = () => {
    if (gazing || stage !== 'active') return;
    setGazing(true);
    startRef.current = performance.now();
  };

  useEffect(() => {
    if (!gazing) return;
    const tick = (ts: number) => {
      const s = (ts - startRef.current) / 1000;
      setPulse(p => p + 0.06);
      if (s >= GAZE_DURATION) {
        setElapsed(GAZE_DURATION);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
        return;
      }
      setElapsed(s);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [gazing]);

  const t = Math.min(elapsed / GAZE_DURATION, 1);
  const separation = 28 * (1 - t); // circles drift from 28px apart to 0
  const heartbeat = Math.sin(pulse * 1.2) * 0.5 + 0.5; // 0–1 pulse
  const circleR = 32 + heartbeat * 3;
  const syncGlow = t * 0.15;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two circles appear...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Look at them. Don't speak. Just breathe. Thirty seconds.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to begin the gaze</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startGaze}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: gazing ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(350, ${10 + syncGlow * 80}%, ${7 + syncGlow * 5}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Sync glow */}
                <defs>
                  <radialGradient id={`${svgId}-gazeGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(350, 30%, 45%, ${syncGlow})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill={`url(#${svgId}-gazeGlow)`} />

                {/* Circle A — left, rose */}
                <circle cx={100 - separation} cy="100" r={circleR}
                  fill="none"
                  stroke={`hsla(350, 25%, 45%, ${0.12 + t * 0.12})`}
                  strokeWidth={1 + heartbeat * 0.5} />
                {/* Circle B — right, amber */}
                <circle cx={100 + separation} cy="100" r={circleR}
                  fill="none"
                  stroke={`hsla(25, 25%, 48%, ${0.12 + t * 0.12})`}
                  strokeWidth={1 + heartbeat * 0.5} />

                {/* Overlap fill — grows as circles converge */}
                {t > 0.15 && (
                  <circle cx="100" cy="100" r={circleR * t * 0.6}
                    fill={`hsla(0, 20%, 42%, ${t * 0.06})`} />
                )}

                {/* Center dot — heartbeat */}
                <circle cx="100" cy="100" r={2 + heartbeat * 1.5}
                  fill={`hsla(350, 30%, 50%, ${0.08 + heartbeat * 0.08 + t * 0.08})`} />

                {/* Timer ring */}
                {gazing && (
                  <circle cx="100" cy="100" r="88" fill="none"
                    stroke={`hsla(350, 18%, 40%, ${0.06 + t * 0.06})`}
                    strokeWidth="1"
                    strokeDasharray={`${t * 553} ${553 - t * 553}`}
                    strokeDashoffset="138"
                    strokeLinecap="round" />
                )}

                {/* Seconds counter */}
                {gazing && (
                  <text x="100" y="160" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(350, 15%, 40%, ${0.12 + t * 0.08})`}>
                    {Math.floor(elapsed)}s
                  </text>
                )}

                {/* Synced label */}
                {t >= 1 && (
                  <motion.text x="100" y="100" textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontFamily="monospace"
                    fill="hsla(350, 20%, 48%, 0.25)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ duration: 1.5 }}>
                    SYNCED
                  </motion.text>
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
              {!gazing ? 'Two circles. Separate. Waiting.' : t < 0.6 ? 'Hold the gaze. Breathing.' : t < 1 ? 'Almost... the circles converge.' : 'Thirty seconds. Synced.'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Thirty seconds. No words. Just breath and eyes. The circles became one. Oxytocin peaked. Nervous systems synchronized.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Limbic resonance. Direct nervous system synchronization through non-verbal cues. Heart rates align. Two become one rhythm.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Eyes. Breath. One.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}