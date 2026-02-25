/**
 * STOIC #3 — The View from Above
 * "How big is this problem from the moon?"
 * INTERACTION: Google-Earth-style zoom. Starting at street level (buildings,
 * a red stress dot). Each tap zooms out — city, country, stratosphere, orbit.
 * The stress dot shrinks to sub-pixel. Dust.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ZOOM_STEPS = 5;
const ZOOM_LABELS = ['street', 'neighborhood', 'city', 'stratosphere', 'orbit'];

export default function Stoic_ViewFromAbove({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [zoom, setZoom] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const zoomOut = () => {
    if (stage !== 'active' || zoom >= ZOOM_STEPS) return;
    const next = zoom + 1;
    setZoom(next);
    if (next >= ZOOM_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = zoom / ZOOM_STEPS;
  const stressDotR = Math.max(0.3, 8 * (1 - t));
  const gridScale = 1 - t * 0.9;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Street level...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>How big is this problem from the moon? It is dust. Do not give it a mountain's weight.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to zoom out</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={zoomOut}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: zoom >= ZOOM_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <motion.div
              animate={{ backgroundColor: `hsla(${210 + t * 20}, ${10 + t * 8}%, ${8 + t * 4}%, 0.3)` }}
              transition={{ duration: 0.8 }}
              style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Grid lines — city blocks, fading as zoom increases */}
                <motion.g initial={{ opacity: 0.08, scale: 1 }} animate={{ opacity: 0.08 * (1 - t * 0.8), scale: gridScale }} style={{ transformOrigin: '100px 100px' }}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <g key={i}>
                      <line x1={25 * i + 12} y1="0" x2={25 * i + 12} y2="200"
                        stroke="hsla(0, 0%, 30%, 0.1)" strokeWidth="0.3" />
                      <line x1="0" y1={25 * i + 12} x2="200" y2={25 * i + 12}
                        stroke="hsla(0, 0%, 30%, 0.1)" strokeWidth="0.3" />
                    </g>
                  ))}
                </motion.g>
                {/* Earth curvature — appears at higher zoom */}
                {t > 0.5 && (
                  <motion.circle cx="100" cy={250 + (1 - t) * 150} r={150 + t * 100}
                    fill="none" stroke={`hsla(200, 15%, 25%, ${(t - 0.5) * 0.12})`}
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
                  />
                )}
                {/* Atmosphere haze — at orbit */}
                {t > 0.7 && (
                  <motion.ellipse cx="100" cy="160" rx={90 + t * 10} ry="15"
                    fill={`hsla(200, 20%, 40%, ${(t - 0.7) * 0.06})`}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}
                  />
                )}
                {/* The stress dot — shrinking */}
                <motion.circle cx="100" cy="100" r={stressDotR}
                  fill={`hsla(0, ${40 - t * 25}%, ${45 + t * 5}%, ${0.4 - t * 0.3})`}
                  animate={{ r: stressDotR }}
                  transition={{ type: 'spring', stiffness: 60 }}
                />
                {/* Stress dot glow — also shrinking */}
                <circle cx="100" cy="100" r={stressDotR * 2.5}
                  fill={`hsla(0, 30%, 40%, ${(0.06 - t * 0.05) * (stressDotR > 1 ? 1 : 0.3)})`} />
                {/* Zoom label */}
                <text x="100" y="190" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(210, 12%, 40%, ${0.15 + t * 0.08})`}>
                  {ZOOM_LABELS[Math.min(zoom, ZOOM_LABELS.length - 1)]}
                </text>
                {/* Stars — visible at orbit */}
                {t > 0.6 && Array.from({ length: 12 }, (_, i) => (
                  <motion.circle key={`s${i}`}
                    cx={15 + (i * 47 % 170)} cy={10 + (i * 31 % 170)}
                    r={0.5 + (i % 3) * 0.3}
                    fill={`hsla(0, 0%, ${50 + (i % 3) * 10}%, ${(t - 0.6) * 0.15})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.6) * 0.15 }}
                  />
                ))}
              </svg>
            </motion.div>
            <motion.div key={zoom} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {zoom === 0 ? 'Street level. The problem looms.' : zoom < ZOOM_STEPS ? `Pulling back... the dot shrinks.` : 'From orbit. A speck. Dust.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ZOOM_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < zoom ? `hsla(210, 20%, ${40 + i * 4}%, 0.5)` : palette.primaryFaint, opacity: i < zoom ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>From orbit, the traffic jam is a pixel. The argument is dust. The worry is invisible. You gave it a mountain's weight. It was always dust.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Self-distancing. Altering visual and cognitive scale reduces emotional reactivity. The threat shrinks to its true size.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Street. Orbit. Dust.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}