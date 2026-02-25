/**
 * LOVER #4 — The Sacred Touch
 * "The skin is the boundary of the ego. Dissolve the boundary."
 * INTERACTION: A fingerprint at center. Each tap sends ripple rings
 * outward — slow, gentle pulses. The fingerprint whorls warm with
 * each touch. At completion: the boundary dissolves into warmth.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TOUCH_STEPS = 5;

export default function Lover_SacredTouch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [touches, setTouches] = useState(0);
  const [ripples, setRipples] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const touch = () => {
    if (stage !== 'active' || touches >= TOUCH_STEPS) return;
    const next = touches + 1;
    setTouches(next);
    setRipples(prev => [...prev, Date.now()]);
    if (next >= TOUCH_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = touches / TOUCH_STEPS;
  const dissolved = t >= 1;

  // Fingerprint whorls — simplified concentric arcs
  const whorls = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      r: 8 + i * 5,
      startAngle: (i * 37 % 60) - 30,
      sweep: 120 + (i * 23 % 80),
    }))
  ).current;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A print appears...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Touch their hand. Not to take. Just to feel the life inside.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap, gently</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={touch}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: touches >= TOUCH_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(15, ${12 + t * 18}%, ${7 + t * 4}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                {/* Warmth gradient */}
                <defs>
                  <radialGradient id={`${svgId}-touchWarm`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(15, 30%, 45%, ${t * 0.12})`} />
                    <stop offset="70%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="95" cy="95" r="90" fill={`url(#${svgId}-touchWarm)`} />

                {/* Fingerprint whorls — dissolving with t */}
                <motion.g initial={{ opacity: 0.12 }} animate={{ opacity: dissolved ? 0.03 : 0.12 - t * 0.04 }} transition={{ duration: 1.5 }}>
                  {whorls.map((w, i) => {
                    const startRad = (w.startAngle * Math.PI) / 180;
                    const endRad = ((w.startAngle + w.sweep) * Math.PI) / 180;
                    const x1 = 95 + Math.cos(startRad) * w.r;
                    const y1 = 95 + Math.sin(startRad) * w.r;
                    const x2 = 95 + Math.cos(endRad) * w.r;
                    const y2 = 95 + Math.sin(endRad) * w.r;
                    const largeArc = w.sweep > 180 ? 1 : 0;
                    return (
                      <path key={i}
                        d={`M ${x1} ${y1} A ${w.r} ${w.r} 0 ${largeArc} 1 ${x2} ${y2}`}
                        fill="none"
                        stroke={`hsla(15, ${15 + t * 15}%, ${30 + t * 12}%, ${0.12 - t * 0.05})`}
                        strokeWidth="0.6" strokeLinecap="round"
                      />
                    );
                  })}
                </motion.g>

                {/* Ripple rings — expanding outward */}
                {ripples.map((ts, i) => (
                  <motion.circle key={ts} cx="95" cy="95"
                    initial={{ r: 5, opacity: 0.15, strokeWidth: 1.5 }}
                    animate={{ r: 80, opacity: 0, strokeWidth: 1 }}
                    transition={{ duration: 3, ease: 'easeOut' }}
                    fill="none"
                    stroke={`hsla(15, 25%, 50%, 0.12)`}
                  />
                ))}

                {/* Center warmth dot */}
                <circle cx="95" cy="95" r={3 + t * 5}
                  fill={`hsla(15, ${25 + t * 20}%, ${38 + t * 15}%, ${0.08 + t * 0.12})`} />

                {/* Dissolved text */}
                {dissolved && (
                  <motion.text x="95" y="95" textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontFamily="monospace"
                    fill="hsla(15, 20%, 48%, 0.18)" letterSpacing="1"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.5, duration: 2 }}>
                    dissolved
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={touches} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {touches === 0 ? 'A fingerprint. The boundary of self.' : touches < TOUCH_STEPS ? `Touch ${touches}. Ripples spreading.` : 'The boundary dissolved. Warmth remains.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: TOUCH_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < touches ? 'hsla(15, 25%, 50%, 0.5)' : palette.primaryFaint, opacity: i < touches ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The fingerprint dissolved. Ripples outward. Not to take, just to feel the life inside. The skin was the boundary. You dissolved it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>C-tactile afferents. Slow gentle touch activates nerve fibers that stimulate the insular cortex and lower cortisol. The boundary of the ego, softened.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Print. Ripple. Warmth.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}