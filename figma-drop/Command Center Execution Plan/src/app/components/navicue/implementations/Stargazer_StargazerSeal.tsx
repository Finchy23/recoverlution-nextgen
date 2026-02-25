/**
 * STARGAZER #10 — The Stargazer Seal (The Proof)
 * "You are the universe experiencing itself."
 * ARCHETYPE: Pattern A (Tap × 5) — A thumb silhouette held up to the sky.
 * Each tap zooms out: behind the thumb, galaxies appear — one, then clusters,
 * then a billion. Your thumb covers a billion galaxies.
 * The Overview Effect. Cosmic unity.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ZOOM_STEPS = 5;
const ZOOM_LABELS = [
  'one galaxy, 200 billion stars',
  'a galaxy cluster, thousands of galaxies',
  'a supercluster, millions of galaxies',
  'the cosmic web, billions of galaxies',
  'all of it, behind your thumb',
];

export default function Stargazer_StargazerSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [zoomed, setZoomed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const zoom = () => {
    if (stage !== 'active' || zoomed >= ZOOM_STEPS) return;
    const next = zoomed + 1;
    setZoomed(next);
    if (next >= ZOOM_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = zoomed / ZOOM_STEPS;
  const galaxyCount = Math.floor(Math.pow(10, zoomed * 1.8));

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Look up...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>You are the universe experiencing itself. You are not in the universe. The universe is in you. Hold your thumb up to the sky.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to zoom out, see what your thumb covers</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={zoom}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: zoomed >= ZOOM_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.98, t * 2) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Deep field background — galaxies multiply with each zoom */}
                {Array.from({ length: Math.min(80, Math.floor(5 + zoomed * 15)) }, (_, i) => {
                  const gx = 15 + ((i * 47 + i * i * 3) % 170);
                  const gy = 15 + ((i * 31 + i * i * 7) % 170);
                  const gr = 0.3 + (i % 5) * 0.4 + (zoomed > 3 ? 0.2 : 0);
                  const isSpiral = i % 4 === 0;
                  // Check if behind thumb
                  const behindThumb = gx > 72 && gx < 128 && gy > 90;
                  const opacity = behindThumb ? 0.01 : 0.02 + t * 0.015;
                  return (
                    <g key={`gal-${i}`}>
                      {isSpiral ? (
                        <ellipse cx={gx} cy={gy} rx={gr * 2} ry={gr}
                          fill={themeColor(TH.accentHSL, opacity, 15 + (i % 8))}
                          transform={`rotate(${i * 30}, ${gx}, ${gy})`} />
                      ) : (
                        <circle cx={gx} cy={gy} r={gr}
                          fill={themeColor(TH.primaryHSL, opacity, 14 + (i % 6))} />
                      )}
                    </g>
                  );
                })}

                {/* Cosmic web filaments at high zoom */}
                {zoomed >= 3 && Array.from({ length: 8 }, (_, i) => {
                  const x1 = 20 + (i * 43) % 160;
                  const y1 = 20 + (i * 29) % 80;
                  const x2 = 30 + ((i + 3) * 37) % 140;
                  const y2 = 30 + ((i + 2) * 41) % 80;
                  return (
                    <motion.line key={`web-${i}`}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={themeColor(TH.accentHSL, 0.015, 12)}
                      strokeWidth="0.3"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.015 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  );
                })}

                {/* THUMB SILHOUETTE — always in foreground */}
                <path d="M 78,200 L 78,130 Q 78,108 88,105 Q 92,103 96,105 L 96,95 Q 96,90 100,90 Q 104,90 104,95 L 104,105 Q 108,103 112,105 Q 122,108 122,130 L 122,200 Z"
                  fill={themeColor(TH.voidHSL, 0.95, 1)}
                  stroke={themeColor(TH.primaryHSL, 0.04, 8)}
                  strokeWidth="0.4"
                />
                {/* Thumbnail */}
                <ellipse cx="100" cy="100" rx="8" ry="5"
                  fill={themeColor(TH.primaryHSL, 0.02, 6)} />

                {/* Zoom counter overlay */}
                <text x="100" y="25" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.05 + t * 0.03, 18)}>
                  {zoomed === 0 ? 'the night sky' : `zoom ×${Math.pow(10, zoomed).toLocaleString()}`}
                </text>

                <text x="100" y="80" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {t >= 1 ? 'A BILLION GALAXIES. behind your thumb' : zoomed > 0 ? ZOOM_LABELS[zoomed - 1] : 'tap to zoom out'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {zoomed === 0 ? 'Your thumb against the sky. A small patch of darkness.' : zoomed < ZOOM_STEPS ? `Zoom ${zoomed}. ${ZOOM_LABELS[zoomed - 1]}.` : 'A billion galaxies. All behind your thumb. All inside you.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: ZOOM_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < zoomed ? themeColor(TH.accentHSL, 0.5, 18) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Five taps. Each one zoomed out further. Behind your thumb: one galaxy. Then thousands. Then millions. Then billions. All of it, behind your thumb. You are not in the universe. The universe is in you. You are made of star-stuff. The atoms in your left hand came from a different star than the atoms in your right. You are the universe experiencing itself. Act like it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The Overview Effect. The cognitive shift reported by astronauts viewing Earth from space: a sudden sense of unity, fragility, and the pettiness of human conflict. You do not need a spaceship. You need perspective.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Thumb. Sky. Universe. You.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}