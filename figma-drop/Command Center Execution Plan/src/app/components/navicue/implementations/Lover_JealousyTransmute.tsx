/**
 * LOVER #6 — The Jealousy Transmute
 * "Jealousy is just a map of your own buried potential."
 * INTERACTION: A green filter overlays a silhouette. Each tap
 * transmutes a patch of green into gold. The green shrinks, gold
 * grows. At completion: a golden map of your unlived life.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TRANSMUTE_STEPS = 5;

export default function Lover_JealousyTransmute({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [transmuted, setTransmuted] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const transmute = () => {
    if (stage !== 'active' || transmuted >= TRANSMUTE_STEPS) return;
    const next = transmuted + 1;
    setTransmuted(next);
    if (next >= TRANSMUTE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = transmuted / TRANSMUTE_STEPS;
  const greenOpacity = 0.15 * (1 - t);
  const goldOpacity = 0.15 * t;

  // Regions that transmute green→gold
  const regions = useRef([
    { cx: 90, cy: 60, r: 25 },
    { cx: 115, cy: 85, r: 20 },
    { cx: 75, cy: 100, r: 22 },
    { cx: 105, cy: 120, r: 18 },
    { cx: 90, cy: 90, r: 30 },
  ]).current;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A green filter forms...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Where does it hurt? That is where you want to grow. Jealousy is just a map of your own buried potential.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to transmute green into gold</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={transmute}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: transmuted >= TRANSMUTE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(${120 - t * 80}, ${12 - t * 4}%, ${7 + t * 3}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 190 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Silhouette — abstract figure */}
                <ellipse cx="95" cy="55" rx="18" ry="22" fill="hsla(0, 0%, 15%, 0.08)" />
                <path d="M 70 80 Q 95 75, 120 80 L 115 145 Q 95 150, 75 145 Z"
                  fill="hsla(0, 0%, 15%, 0.06)" />

                {/* Green filter — fading */}
                <rect x="0" y="0" width="190" height="180" rx="12"
                  fill={`hsla(120, 25%, 30%, ${greenOpacity})`} />

                {/* Transmuted gold regions */}
                {regions.slice(0, transmuted).map((reg, i) => (
                  <motion.circle key={i} cx={reg.cx} cy={reg.cy} r={reg.r}
                    fill={`hsla(42, 35%, 45%, ${0.04 + (i + 1) * 0.02})`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ transformOrigin: `${reg.cx}px ${reg.cy}px` }}
                  />
                ))}

                {/* Map lines — connect gold regions */}
                {transmuted >= 2 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ duration: 1 }}>
                    {regions.slice(0, transmuted - 1).map((reg, i) => {
                      const next = regions[i + 1];
                      return (
                        <line key={i} x1={reg.cx} y1={reg.cy} x2={next.cx} y2={next.cy}
                          stroke="hsla(42, 30%, 48%, 0.08)" strokeWidth="0.5" strokeDasharray="2 2" />
                      );
                    })}
                  </motion.g>
                )}

                {/* Label */}
                <text x="95" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={t >= 1 ? 'hsla(42, 30%, 50%, 0.2)' : `hsla(120, 15%, 35%, ${0.1 - t * 0.05})`}>
                  {t >= 1 ? 'golden map' : 'green filter'}
                </text>
              </svg>
            </div>
            <motion.div key={transmuted} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {transmuted === 0 ? 'Green with envy. Where does it hurt?' : transmuted < TRANSMUTE_STEPS ? `Transmuting... ${transmuted} region${transmuted > 1 ? 's' : ''} golden.` : 'All gold. A map of buried potential.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: TRANSMUTE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < transmuted ? 'hsla(42, 35%, 50%, 0.5)' : palette.primaryFaint,
                  opacity: i < transmuted ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Green became gold. Each jealous sting, a map coordinate. These are not their traits you envy. They are your suppressed traits waiting to be activated.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Projection integration. Reclaiming the golden shadow. What you admire in others is what sleeps in you. Jealousy is the map. Follow it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Green. Gold. Yours.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}