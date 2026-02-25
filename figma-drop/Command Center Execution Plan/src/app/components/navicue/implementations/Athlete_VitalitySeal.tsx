/**
 * ATHLETE #10 -- The Vitality Seal (The Proof)
 * "I am alive. I am an engine."
 * INTERACTION: A pulse circle -- expanding/contracting in heartbeat
 * rhythm. Each tap strengthens the pulse. 5 taps. A haptic-style
 * readout appears: "I will carry you if you treat me with respect."
 * Interoceptive trust re-established.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Self-Compassion', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PULSE_STEPS = 5;

export default function Athlete_VitalitySeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pulses, setPulses] = useState(0);
  const [heartPhase, setHeartPhase] = useState(0);
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
    const tick = () => { setHeartPhase(p => p + 0.05); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const strengthen = () => {
    if (stage !== 'active' || pulses >= PULSE_STEPS) return;
    const next = pulses + 1;
    setPulses(next);
    if (next >= PULSE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
    }
  };

  const t = pulses / PULSE_STEPS;
  const sealed = t >= 1;

  // Heartbeat curve -- sharp systole + diastole
  const heartbeat = () => {
    const p = (heartPhase % (Math.PI * 2)) / (Math.PI * 2); // 0–1 within cycle
    if (p < 0.1) return Math.sin(p / 0.1 * Math.PI) * (0.5 + t * 0.5); // systole spike
    if (p < 0.15) return -Math.sin((p - 0.1) / 0.05 * Math.PI) * 0.2 * (0.3 + t * 0.3); // dip
    if (p < 0.25) return Math.sin((p - 0.15) / 0.1 * Math.PI) * 0.3 * (0.4 + t * 0.3); // T-wave
    return 0;
  };

  const beat = heartbeat();
  const pulseR = 30 + beat * 15 + t * 8;

  // ECG trace
  const buildECG = () => {
    const points: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = 10 + (i / 60) * 180;
      const ph = heartPhase - (60 - i) * 0.04;
      const p = ((ph % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);
      let y = 135;
      if (p < 0.1) y -= Math.sin(p / 0.1 * Math.PI) * (10 + t * 8);
      else if (p < 0.15) y += Math.sin((p - 0.1) / 0.05 * Math.PI) * (4 + t * 2);
      else if (p < 0.25) y -= Math.sin((p - 0.15) / 0.1 * Math.PI) * (5 + t * 3);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A pulse begins...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>I am alive. I am an engine. I will carry you if you treat me with respect.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to strengthen the pulse</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={strengthen}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: pulses >= PULSE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(0, ${6 + t * 8}%, ${6 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Pulse glow */}
                <defs>
                  <radialGradient id={`${svgId}-pulseGlow`} cx="50%" cy="42%">
                    <stop offset="0%" stopColor={`hsla(0, ${20 + t * 15}%, ${40 + t * 10}%, ${0.04 + beat * 0.08})`} />
                    <stop offset="70%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="85" r="80" fill={`url(#${svgId}-pulseGlow)`} />

                {/* Pulse circle -- heartbeat */}
                <circle cx="100" cy="85" r={pulseR}
                  fill={`hsla(0, ${18 + t * 12}%, ${30 + t * 10}%, ${0.04 + beat * 0.04})`}
                  stroke={`hsla(0, ${20 + t * 15}%, ${38 + t * 12}%, ${0.1 + beat * 0.08 + t * 0.06})`}
                  strokeWidth={0.6 + beat * 0.8 + t * 0.3} />

                {/* Inner rings -- strength layers */}
                {Array.from({ length: pulses }, (_, i) => (
                  <circle key={i} cx="100" cy="85" r={pulseR - (i + 1) * 5}
                    fill="none"
                    stroke={`hsla(0, ${15 + i * 3}%, ${35 + i * 3}%, ${0.03 + beat * 0.02})`}
                    strokeWidth="0.5" />
                ))}

                {/* Center dot -- alive */}
                <circle cx="100" cy="85" r={2 + beat * 2}
                  fill={`hsla(0, ${25 + t * 15}%, ${45 + t * 10}%, ${0.1 + beat * 0.1})`} />

                {/* ECG trace at bottom */}
                <path d={buildECG()}
                  fill="none"
                  stroke={`hsla(0, ${15 + t * 10}%, ${35 + t * 10}%, ${0.08 + t * 0.06})`}
                  strokeWidth={0.5 + t * 0.3}
                  strokeLinecap="round" />

                {/* BPM readout */}
                <text x="100" y="170" textAnchor="middle" fontSize="6" fontFamily="monospace"
                  fill={`hsla(0, ${12 + t * 8}%, ${32 + t * 10}%, ${0.08 + t * 0.06})`}>
                  {Math.round(62 + t * 10)} bpm -- {sealed ? 'trusted' : 'strengthening'}
                </text>

                {/* Sealed label */}
                {sealed && (
                  <motion.text x="100" y="85" textAnchor="middle" dominantBaseline="middle"
                    fontSize="7" fontFamily="monospace" fill="hsla(0, 18%, 50%, 0.2)" letterSpacing="2" fontWeight="500"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.5, duration: 2 }}>
                    ALIVE
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={pulses} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {pulses === 0 ? 'A weak pulse. Faint.' : pulses < PULSE_STEPS ? `Pulse ${pulses}. Stronger. The engine hums.` : 'Strong pulse. Trusted. Alive.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: PULSE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < pulses ? 'hsla(0, 18%, 48%, 0.5)' : palette.primaryFaint, opacity: i < pulses ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Strong pulse. ECG steady. I am alive. I am an engine. I will carry you if you treat me with respect. Trust re-established.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Interoceptive trust. Re-establishing the alliance between conscious mind and somatic vessel. The body is the temple, not the garage.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Pulse. Engine. Alive.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}