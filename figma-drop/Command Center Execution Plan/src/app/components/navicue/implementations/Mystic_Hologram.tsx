/**
 * MYSTIC #6 — The Hologram
 * "The part contains the whole. The universe is in you."
 * INTERACTION: A shard of glass at center. Each tap zooms in — 5 levels.
 * At each level, the full image re-appears at smaller scale.
 * Fractal self-similarity. The micro reflects the macro.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ZOOM_STEPS = 5;

export default function Mystic_Hologram({ onComplete }: Props) {
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
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = zoomed / ZOOM_STEPS;

  // Nested fractal shapes — each level
  const renderShard = (cx: number, cy: number, size: number, level: number, maxLevel: number) => {
    if (level > maxLevel || size < 3) return null;
    const points = `${cx},${cy - size} ${cx + size * 0.6},${cy + size * 0.3} ${cx - size * 0.6},${cy + size * 0.3}`;
    const alpha = 0.04 + (level / maxLevel) * 0.06;
    const hue = 260 + level * 15;
    return (
      <g key={`${level}-${cx}-${cy}`}>
        <polygon points={points}
          fill={`hsla(${hue}, ${10 + level * 3}%, ${20 + level * 5}%, ${alpha})`}
          stroke={`hsla(${hue}, ${8 + level * 2}%, ${25 + level * 5}%, ${alpha + 0.02})`}
          strokeWidth={0.3} />
        {/* Recursive: smaller shard inside */}
        {level < maxLevel && renderShard(cx, cy - size * 0.15, size * 0.45, level + 1, maxLevel)}
      </g>
    );
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A shard of glass...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The part contains the whole. You are not in the universe. The universe is in you.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to zoom deeper; the whole repeats</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={zoom}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: zoomed >= ZOOM_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '180px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(260, ${5 + t * 4}%, ${3 + t * 3}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 180 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Fractal shard — depth increases with zoomed */}
                <motion.g initial={{ scale: 1 }} animate={{ scale: 1 + t * 0.15 }} style={{ transformOrigin: '90px 75px' }}
                  transition={{ type: 'spring', stiffness: 40 }}>
                  {renderShard(90, 75, 45, 0, zoomed)}
                </motion.g>

                {/* Reflection lines — suggest the whole in the part */}
                {zoomed > 0 && Array.from({ length: zoomed * 2 }, (_, i) => (
                  <motion.line key={`ref-${i}`}
                    x1={90 + Math.cos(i * 1.2) * 50} y1={75 + Math.sin(i * 1.2) * 50}
                    x2={90 + Math.cos(i * 1.2) * 55} y2={75 + Math.sin(i * 1.2) * 55}
                    stroke={`hsla(260, 8%, 25%, ${0.02 + t * 0.015})`}
                    strokeWidth="0.3"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                  />
                ))}

                {/* Coherence glow */}
                {t >= 1 && (
                  <motion.circle cx="90" cy="75" r="50"
                    fill="hsla(280, 15%, 30%, 0.03)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="90" y="140" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(260, ${8 + t * 8}%, ${22 + t * 10}%, ${0.05 + t * 0.04})`}>
                  {t >= 1 ? 'infinite depth. the part is the whole.' : `depth: ${zoomed}/${ZOOM_STEPS}`}
                </text>
                <text x="90" y="155" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(260, 6%, 20%, ${0.04 + t * 0.02})`}>
                  fractal level {zoomed}
                </text>
              </svg>
            </div>
            <motion.div key={zoomed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {zoomed === 0 ? 'A shard of glass. Look closer.' : zoomed < ZOOM_STEPS ? `Level ${zoomed}. The same shape repeats inside itself.` : 'Five levels deep. The whole was always in the part.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ZOOM_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < zoomed ? 'hsla(280, 15%, 45%, 0.5)' : palette.primaryFaint, opacity: i < zoomed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five zoom levels. Each time you looked closer, the same shape appeared again, smaller, but complete. The part contains the whole. You are not in the universe. The universe is in you. Fractal, infinite, belonging.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Fractal fluency. Recognizing self-similarity across scales creates a profound sense of coherence and belonging. The micro reflects the macro.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Shard. Zoom. Whole.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}