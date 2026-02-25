/**
 * BENDER #9 — The Belief Bridge
 * "Faith is not believing what you see. It is seeing what you believe."
 * ARCHETYPE: Pattern A (Tap × 5) — Each tap steps onto empty air.
 * A bridge segment materializes under your foot. 5 steps across the void.
 * Perceptual set. Beliefs shape sensory processing.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STEP_COUNT = 5;

export default function Bender_BeliefBridge({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [steps, setSteps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const step = () => {
    if (stage !== 'active' || steps >= STEP_COUNT) return;
    const next = steps + 1;
    setSteps(next);
    if (next >= STEP_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = steps / STEP_COUNT;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            An edge. A void. A question.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Faith is not believing what you see. It is seeing what you believe. The bridge builds itself only as you step onto the empty air. Step.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to step into the void</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={step}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: steps >= STEP_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '240px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Left cliff */}
                <rect x="0" y="60" width="30" height="80" rx="2"
                  fill={themeColor(TH.primaryHSL, 0.06, 8)} />
                <rect x="0" y="58" width="30" height="4" rx="1"
                  fill={themeColor(TH.primaryHSL, 0.08, 12)} />

                {/* Right cliff */}
                <rect x="210" y="60" width="30" height="80" rx="2"
                  fill={themeColor(TH.primaryHSL, 0.06, 8)} />
                <rect x="210" y="58" width="30" height="4" rx="1"
                  fill={themeColor(TH.primaryHSL, 0.08, 12)} />

                {/* The void below */}
                <rect x="30" y="80" width="180" height="60"
                  fill={themeColor(TH.voidHSL, 0.04)} />
                {/* Depth lines */}
                {Array.from({ length: 4 }, (_, i) => (
                  <line key={i} x1="50" y1={90 + i * 10} x2="190" y2={90 + i * 10}
                    stroke={themeColor(TH.primaryHSL, 0.015 - i * 0.003)} strokeWidth={safeSvgStroke(0.3)} />
                ))}

                {/* Bridge segments — materialize as you step */}
                {Array.from({ length: STEP_COUNT }, (_, i) => {
                  const sx = 35 + i * 36;
                  const visible = i < steps;
                  return visible ? (
                    <motion.g key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 80, damping: 10 }}>
                      {/* Bridge plank */}
                      <rect x={sx} y="58" width="32" height="4" rx="1"
                        fill={themeColor(TH.accentHSL, 0.08 + i * 0.015, 12 + i * 3)} />
                      {/* Support cables */}
                      <line x1={sx + 16} y1="42" x2={sx + 4} y2="58"
                        stroke={themeColor(TH.accentHSL, 0.04, 8)} strokeWidth={safeSvgStroke(0.3)} />
                      <line x1={sx + 16} y1="42" x2={sx + 28} y2="58"
                        stroke={themeColor(TH.accentHSL, 0.04, 8)} strokeWidth={safeSvgStroke(0.3)} />
                      <line x1={60} y1="80" x2={90} y2="75"
                        stroke={themeColor(TH.accentHSL, 0.04, 8)} strokeWidth={safeSvgStroke(0.3)} />
                    </motion.g>
                  ) : (
                    /* Ghost outline of missing segment */
                    <rect key={i} x={sx} y="58" width="32" height="4" rx="1"
                      fill="none" stroke={themeColor(TH.primaryHSL, 0.02)} strokeWidth={safeSvgStroke(0.3)} strokeDasharray="2 2" />
                  );
                })}

                {/* Avatar — walks across */}
                <motion.g
                  animate={{ x: steps * 36 }}
                  transition={{ type: 'spring', stiffness: 60 }}>
                  <circle cx="42" cy="48" r="5"
                    fill={themeColor(TH.accentHSL, 0.1 + t * 0.06, 15)} />
                  <rect cx="42" x="39" y="53" width="6" height="8" rx="2"
                    fill={themeColor(TH.accentHSL, 0.08 + t * 0.04, 12)} />
                </motion.g>

                {/* Completion glow */}
                {steps >= STEP_COUNT && (
                  <motion.rect x="30" y="50" width="180" height="20" rx="3"
                    fill={themeColor(TH.accentHSL, 0.03, 10)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="120" y="132" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'CROSSED. the bridge built itself' : `step ${steps}/${STEP_COUNT} into the void`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {steps === 0 ? 'An edge. Empty air. The other side is far.' : steps < STEP_COUNT ? `Step ${steps}. The plank materialized under your foot.` : 'Five steps. Five planks. You crossed the void. The bridge was always there.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: STEP_COUNT }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < steps ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five steps into empty air. Each time you stepped, the bridge materialized: plank, cables, support. It only appeared because you moved first. Faith is not believing what you see. It is seeing what you believe. The bridge was always there. You just had to step.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Perceptual set. Our expectations shape our sensory processing. We literally perceive opportunities that align with our beliefs and miss those that don't. Step first.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Edge. Step. Bridge.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}