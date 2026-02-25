/**
 * ORACLE #6 — The Danger Beautiful
 * "The thing you most avoid is exactly what you need."
 * ARCHETYPE: Pattern A (Tap × 5) — A dark shape, radiating threat.
 * Each tap steps closer. At 5: the shape transforms into something luminous.
 * Fear as compass.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ORACLE_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
const TH = ORACLE_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }
const STEPS = 5;

export default function Oracle_DangerBeautiful({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [approached, setApproached] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const approach = () => {
    if (stage !== 'active' || approached >= STEPS) return;
    const next = approached + 1;
    setApproached(next);
    if (next >= STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = approached / STEPS;
  const threatHue = t * 35; // dark→amber
  const shapeR = 25 + t * 15;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something waits in the dark...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The thing you most avoid is exactly what you need. Fear is not a wall; it is a compass pointing to growth. Walk toward it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to step closer to the fear</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={approach}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: approached >= STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 5) }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                {/* Threat aura — jagged at start, smooth at end */}
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const jag = (1 - t) * 8 * Math.sin(i * 3);
                  const r = shapeR + 15 + jag;
                  return (
                    <motion.line key={i}
                      x1={95 + Math.cos(angle) * shapeR}
                      y1={95 + Math.sin(angle) * shapeR}
                      x2={95 + Math.cos(angle) * r}
                      y2={95 + Math.sin(angle) * r}
                      stroke={`hsla(${threatHue}, ${8 + t * 12}%, ${15 + t * 12}%, ${0.04 + t * 0.02})`}
                      strokeWidth={0.4 + t * 0.2}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Core shape — transforms from jagged dark to smooth luminous */}
                <motion.circle cx="95" cy="95" r={shapeR}
                  fill={`hsla(${threatHue}, ${6 + t * 15}%, ${6 + t * 14}%, ${0.06 + t * 0.05})`}
                  stroke={`hsla(${threatHue}, ${8 + t * 14}%, ${12 + t * 15}%, ${0.05 + t * 0.04})`}
                  strokeWidth={0.5 + t * 0.3}
                  animate={{ r: shapeR }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Inner glow — emerges with approach */}
                {t > 0.3 && (
                  <motion.circle cx="95" cy="95" r={shapeR * 0.6}
                    fill={`hsla(${threatHue}, ${t * 18}%, ${12 + t * 15}%, ${(t - 0.3) * 0.04})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.3) * 0.04 }}
                  />
                )}

                {/* Transformation: light burst at completion */}
                {t >= 1 && (
                  <>
                    <motion.circle cx="95" cy="95" r={shapeR + 25}
                      fill="hsla(35, 20%, 35%, 0.03)"
                      initial={{ opacity: 0, r: shapeR }} animate={{ opacity: 0.12, r: shapeR + 25 }}
                      transition={{ duration: 2 }}
                    />
                    <motion.text x="95" y="100" textAnchor="middle" fontSize="11" fontFamily="Georgia, serif"
                      fontStyle="italic" fill={themeColor(TH.accentHSL, 0.14, 20)}
                      initial={{ opacity: 0 }} animate={{ opacity: 0.14 }}
                      transition={{ delay: 0.5, duration: 1.5 }}>
                      beautiful
                    </motion.text>
                  </>
                )}

                {/* Distance indicator */}
                {t < 1 && (
                  <motion.circle cx="95" cy={160 - t * 50} r="3"
                    fill={themeColor(TH.accentHSL, 0.08, 12)}
                    initial={{ cy: 160 }}
                    animate={{ cy: 160 - t * 50 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                  />
                )}

                <text x="95" y="184" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'TRANSFORMED. fear became beauty' : `approach: ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {approached === 0 ? 'A dark shape. Jagged aura. Radiating threat.' : approached < STEPS ? `Step ${approached}. Closer. The edges soften. The color warms.` : 'Beautiful. The feared thing was the gift all along.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < approached ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five steps toward the fear. The dark shape, jagged, threatening, radiating danger, softened. Edges smoothed. Color warmed from black to amber. At the final step: "beautiful." The feared thing was the gift. Fear is not a wall. It is a compass pointing to growth.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Fear as compass. The amygdala flags both threats and opportunities. The strongest fear often surrounds the highest-stakes growth opportunity. Walk toward it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dark. Step. Beautiful.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}