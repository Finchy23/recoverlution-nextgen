/**
 * MAGNET #5 — The Specific Praise
 * "Don't say 'Good job.' Say 'I saw how you handled that specific pressure.'"
 * ARCHETYPE: Pattern A (Tap × 5) — A laser pointer sweeps a rock face.
 * Each tap finds a tiny hidden diamond. Generic noise → specific signal.
 * Attribution Theory.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FIND_STEPS = 5;
const GEMS = [
  { x: 55, y: 48, label: 'how you stayed calm under fire' },
  { x: 145, y: 62, label: 'that subtle pause before you spoke' },
  { x: 90, y: 88, label: 'the way you listened, really listened' },
  { x: 170, y: 42, label: 'choosing honesty when it was hard' },
  { x: 120, y: 105, label: 'the grace in how you let it go' },
];

export default function Magnet_SpecificPraise({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [found, setFound] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const find = () => {
    if (stage !== 'active' || found >= FIND_STEPS) return;
    const next = found + 1;
    setFound(next);
    if (next >= FIND_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = found / FIND_STEPS;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Scanning for what's hidden...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Don't say "Good job." That is noise. Say "I saw how you handled that specific pressure." See the unseen variable.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to find each hidden diamond</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={find}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: found >= FIND_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Rock face texture */}
                {Array.from({ length: 25 }, (_, i) => (
                  <rect key={i}
                    x={10 + (i * 37 + i * i * 3) % 200}
                    y={15 + (i * 23 + i * 7) % 105}
                    width={5 + i % 8} height={3 + i % 5} rx="1"
                    fill={themeColor(TH.primaryHSL, 0.02 + (i % 3) * 0.005, 5)}
                    transform={`rotate(${i * 15}, ${10 + (i * 37 + i * i * 3) % 200}, ${15 + (i * 23 + i * 7) % 105})`}
                  />
                ))}

                {/* Gems — hidden until found */}
                {GEMS.map((gem, i) => {
                  const isFound = i < found;
                  return (
                    <g key={i}>
                      {isFound ? (
                        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
                          {/* Diamond shape */}
                          <motion.polygon
                            points={`${gem.x},${gem.y - 5} ${gem.x + 4},${gem.y} ${gem.x},${gem.y + 5} ${gem.x - 4},${gem.y}`}
                            fill={themeColor(TH.accentHSL, 0.15, 20)}
                            stroke={themeColor(TH.accentHSL, 0.1, 25)}
                            strokeWidth="0.3"
                          />
                          {/* Glow */}
                          <circle cx={gem.x} cy={gem.y} r="8"
                            fill={themeColor(TH.accentHSL, 0.03, 15)} />
                          {/* Laser beam to it */}
                          <line x1="10" y1="130" x2={gem.x} y2={gem.y}
                            stroke={themeColor(TH.accentHSL, 0.04, 15)}
                            strokeWidth="0.3" strokeDasharray="1 2" />
                        </motion.g>
                      ) : (
                        /* Hidden gem — barely visible dot */
                        <circle cx={gem.x} cy={gem.y} r="1"
                          fill={themeColor(TH.primaryHSL, 0.015)} />
                      )}
                    </g>
                  );
                })}

                {/* Laser pointer */}
                {found < FIND_STEPS && (
                  <motion.circle cx="10" cy="130" r="2"
                    fill="hsla(0, 25%, 35%, 0.1)"
                    animate={{ opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                <text x="110" y="138" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'ALL SEEN. precision over noise' : `diamonds found: ${found}/${FIND_STEPS}`}
                </text>
              </svg>
            </div>
            {/* Current gem label */}
            <motion.div key={found} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center', minHeight: '28px' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {found === 0 ? 'A rock face. Rough, grey, ordinary. Gems are hiding.' : `"I saw ${GEMS[found - 1].label}."`}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: FIND_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < found ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five diamonds, hidden in rough stone. The laser found each one: the calm under fire, the pause before speaking, the real listening, the hard honesty, the graceful release. Not "good job." That's noise. This is signal. See the unseen variable. Specificity bypasses the flattery filter and registers as deep attention.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Attribution theory. Specific, unexpected praise bypasses the flattery filter and registers as high-fidelity attention, building deep trust.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Rock. Laser. Diamond.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}