/**
 * MAGNET #8 — The "Yes, And" Spiral
 * "Take their energy, add your magic, and give it back. Spin the web together."
 * ARCHETYPE: Pattern A (Tap × 5) — Two DNA strands twisting upward.
 * Each tap adds a rung, the helix tightens. Improvisational co-creation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Practice');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const RUNG_STEPS = 5;
const RUNG_LABELS = ['yes', 'and...', 'yes, and...', 'yes, AND...', 'YES, AND!'];

export default function Magnet_YesAndSpiral({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [rungs, setRungs] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const addRung = () => {
    if (stage !== 'active' || rungs >= RUNG_STEPS) return;
    const next = rungs + 1;
    setRungs(next);
    if (next >= RUNG_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = rungs / RUNG_STEPS;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two strands, waiting to meet...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Blocking energy is boring. Take their energy, add your magic, and give it back. Spin the web together. Do not block. Add.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to weave; each rung connects the strands</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={addRung}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: rungs >= RUNG_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '160px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 160 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Helix strands */}
                {Array.from({ length: 30 }, (_, i) => {
                  const y = 170 - i * 5;
                  const amp = 25 + t * 8;
                  const x1 = 80 + Math.sin(i * 0.5 + t * 2) * amp;
                  const x2 = 80 - Math.sin(i * 0.5 + t * 2) * amp;
                  const visible = i < rungs * 6 + 8;
                  return visible ? (
                    <g key={i}>
                      <circle cx={x1} cy={y} r="1"
                        fill={themeColor(TH.accentHSL, 0.04 + t * 0.02, 12 + i * 0.3)} />
                      <circle cx={x2} cy={y} r="1"
                        fill={themeColor(TH.primaryHSL, 0.04 + t * 0.02, 12 + i * 0.3)} />
                    </g>
                  ) : null;
                })}

                {/* Connecting rungs — the "Yes, And" bridges */}
                {Array.from({ length: rungs }, (_, i) => {
                  const rungY = 150 - i * 25;
                  const amp = 25 + t * 8;
                  const x1 = 80 + Math.sin((150 - rungY) / 5 * 0.5 + t * 2) * amp;
                  const x2 = 80 - Math.sin((150 - rungY) / 5 * 0.5 + t * 2) * amp;
                  return (
                    <motion.g key={`rung-${i}`}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ type: 'spring', stiffness: 80 }}>
                      <line x1={x1} y1={rungY} x2={x2} y2={rungY}
                        stroke={themeColor(TH.accentHSL, 0.08 + i * 0.015, 15 + i * 2)}
                        strokeWidth={0.6 + i * 0.1}
                        strokeLinecap="round" />
                      {/* Rung label */}
                      <text x="80" y={rungY - 4} textAnchor="middle" fontSize="3" fontFamily="monospace"
                        fill={themeColor(TH.accentHSL, 0.06, 12)}>
                        {RUNG_LABELS[i]}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Spiral energy glow at full connection */}
                {t >= 1 && (
                  <motion.ellipse cx="80" cy="90" rx="35" ry="60"
                    fill={themeColor(TH.accentHSL, 0.025, 12)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.025 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="80" y="175" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'HELIX COMPLETE. co-creation' : `rungs: ${rungs}/${RUNG_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {rungs === 0 ? 'Two parallel strands. Separate. No connection.' : rungs < RUNG_STEPS ? `"${RUNG_LABELS[rungs - 1]}", the strands are weaving.` : 'Full helix. Two became one. The spiral rises together.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: RUNG_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < rungs ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five rungs. Two separate strands began to twist: "yes," "and," "yes, and," "yes, AND," "YES, AND!" Each rung connecting the helices. The conversation spiraled upward. Not a debate. A co-creation. Take their energy, add your magic, give it back. The web spins together.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Improvisational co-creation. The "Yes, And" protocol builds psychological safety and flow, turning conversation into shared creative act rather than debate.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Block. Add. Spiral.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}