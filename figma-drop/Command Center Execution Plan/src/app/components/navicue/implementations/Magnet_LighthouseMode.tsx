/**
 * MAGNET #7 — The Lighthouse Mode
 * "The lighthouse does not run around the island looking for boats."
 * ARCHETYPE: Pattern A (Tap × 5) — A beam of light in fog. Each tap strengthens it.
 * Ships appear, steering toward the light. Signal Theory.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Practice');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SHINE_STEPS = 5;
const SHIPS = [
  { startX: 190, startY: 80, label: 'kindred' },
  { startX: 185, startY: 45, label: 'mentor' },
  { startX: 195, startY: 110, label: 'partner' },
  { startX: 180, startY: 65, label: 'friend' },
  { startX: 188, startY: 95, label: 'ally' },
];

export default function Magnet_LighthouseMode({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [shine, setShine] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const intensify = () => {
    if (stage !== 'active' || shine >= SHINE_STEPS) return;
    const next = shine + 1;
    setShine(next);
    if (next >= SHINE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = shine / SHINE_STEPS;
  const beamWidth = 8 + t * 22;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Fog. A distant light.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The lighthouse does not run around the island looking for boats. It stands. It shines. It waits.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to strengthen the beam</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={intensify}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: shine >= SHINE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Fog layers */}
                {Array.from({ length: 4 }, (_, i) => (
                  <motion.rect key={i} x="0" y={i * 35} width="220" height="35"
                    fill={themeColor(TH.primaryHSL, 0.015 * (1 - t * 0.5), 5)}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 - t * 0.3 }}
                  />
                ))}

                {/* Lighthouse tower */}
                <rect x="18" y="50" width="12" height="65" rx="2"
                  fill={themeColor(TH.primaryHSL, 0.08 + t * 0.03, 10)} />
                {/* Lighthouse top/lantern */}
                <rect x="15" y="42" width="18" height="12" rx="2"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.06, 12)} />
                {/* Light source */}
                <circle cx="24" cy="48" r={2 + t * 2}
                  fill={themeColor(TH.accentHSL, 0.1 + t * 0.1, 20)} />

                {/* Beam — expanding triangle of light */}
                <motion.polygon
                  points={`24,48 200,${48 - beamWidth} 200,${48 + beamWidth}`}
                  fill={themeColor(TH.accentHSL, 0.02 + t * 0.02, 12)}
                  initial={{ points: '24,48 200,48 200,48' }}
                  animate={{ points: `24,48 200,${48 - beamWidth} 200,${48 + beamWidth}` }}
                  transition={{ type: 'spring', stiffness: 30 }}
                />
                {/* Beam core */}
                <motion.line x1="24" y1="48" x2="200" y2="48"
                  stroke={themeColor(TH.accentHSL, 0.04 + t * 0.04, 15)}
                  strokeWidth={0.5 + t * 0.5}
                />

                {/* Rotating beam effect */}
                <motion.g
                  animate={{ rotate: [0, 8, -3, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: '24px 48px' }}>
                  <line x1="24" y1="48" x2="200" y2={48 + 5}
                    stroke={themeColor(TH.accentHSL, 0.02 + t * 0.015, 10)}
                    strokeWidth="0.3" />
                </motion.g>

                {/* Ships — appear and approach as beam strengthens */}
                {SHIPS.map((ship, i) => {
                  if (i >= shine) return null;
                  const approach = (shine - i) / SHINE_STEPS;
                  const sx = ship.startX - approach * 50;
                  const sy = ship.startY;
                  return (
                    <motion.g key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: safeOpacity(0.06 + approach * 0.04), x: 0 }}
                      transition={{ duration: 1.5, delay: 0.2 }}>
                      {/* Ship hull */}
                      <polygon points={`${sx - 6},${sy} ${sx + 6},${sy} ${sx + 4},${sy + 4} ${sx - 4},${sy + 4}`}
                        fill={themeColor(TH.primaryHSL, 0.04 + approach * 0.03, 12)} />
                      {/* Mast */}
                      <line x1={sx} y1={sy - 8} x2={sx} y2={sy}
                        stroke={themeColor(TH.primaryHSL, 0.04 + approach * 0.02, 10)} strokeWidth="0.4" />
                      {/* Label */}
                      <text x={sx} y={sy + 12} textAnchor="middle" fontSize="2.5" fontFamily="monospace"
                        fill={themeColor(TH.accentHSL, 0.05, 10)}>{ship.label}</text>
                    </motion.g>
                  );
                })}

                {/* Water line */}
                <line x1="0" y1="120" x2="220" y2="120"
                  stroke={themeColor(TH.primaryHSL, 0.03)} strokeWidth="0.3" />

                <text x="110" y="134" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'SIGNAL CLEAR. they found you' : `beam: ${Math.round(t * 100)}%, ${shine} ships approaching`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {shine === 0 ? 'A dim lighthouse in fog. No ships in sight.' : shine < SHINE_STEPS ? `Beam strengthened. ${SHIPS[shine - 1].label} approaching.` : 'Maximum signal. All five ships steering home.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: SHINE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < shine ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five taps. The beam grew. Fog thinned. And ships appeared: kindred, mentor, partner, friend, ally, all steering toward the light. You did not run around the island looking for them. You stood. You shone. They came. Consistent, high-fidelity signaling lets compatible connections find you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Signal theory. Consistent, authentic signaling reduces noise in social interactions, allowing compatible connections to find you effortlessly. Stand. Shine. Wait.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Fog. Beam. Ships.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}