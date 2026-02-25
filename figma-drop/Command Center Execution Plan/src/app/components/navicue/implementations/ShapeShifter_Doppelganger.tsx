/**
 * SHAPESHIFTER #5 — The Doppelganger
 * "Your shadow is not your enemy. It is your missing half."
 * ARCHETYPE: Pattern A (Tap ×5) — Two silhouettes. Each tap brings
 * them closer together until they overlap and merge.
 * Shadow Integration — befriending the disowned self.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }
const STEPS = 5;

export default function ShapeShifter_Doppelganger({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const merge = () => {
    if (stage !== 'active' || taps >= STEPS) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = taps / STEPS;
  const merged = taps >= STEPS;
  const separation = 50 * (1 - t); // px between figures

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two shapes in the dark...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Your shadow is not your enemy. It is your missing half. The parts of yourself you exiled still belong to you.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to bring them together</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={merge}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '300px',
              cursor: merged ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '220px', height: '180px' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180">
                {/* Ground line */}
                <line x1="30" y1="150" x2="190" y2="150"
                  stroke={themeColor(TH.primaryHSL, 0.04, 5)} strokeWidth="0.5" />

                {/* Left figure — "light self" */}
                <motion.g
                  animate={{ x: separation }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}>
                  {/* Head */}
                  <ellipse cx={70} cy="55" rx="14" ry="16"
                    fill={themeColor(TH.accentHSL, 0.06 + t * 0.03, 15)}
                    stroke={themeColor(TH.accentHSL, 0.1, 18)} strokeWidth="0.5" />
                  {/* Body */}
                  <rect x={60} y="73" width="20" height="40" rx="6"
                    fill={themeColor(TH.accentHSL, 0.04 + t * 0.02, 12)} />
                  {/* Legs */}
                  <rect x={58} y="113" width="9" height="35" rx="3"
                    fill={themeColor(TH.accentHSL, 0.03 + t * 0.02, 10)} />
                  <rect x={73} y="113" width="9" height="35" rx="3"
                    fill={themeColor(TH.accentHSL, 0.03 + t * 0.02, 10)} />
                  {/* Eye */}
                  <circle cx={74} cy="52" r="2"
                    fill={themeColor(TH.accentHSL, 0.15, 20)} />
                </motion.g>

                {/* Right figure — "shadow self" (mirrored, darker) */}
                <motion.g
                  animate={{ x: -separation }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}>
                  {/* Head */}
                  <ellipse cx={150} cy="55" rx="14" ry="16"
                    fill={themeColor(TH.primaryHSL, 0.08 + t * 0.02, 3)}
                    stroke={themeColor(TH.primaryHSL, 0.1, 8)} strokeWidth="0.5" />
                  {/* Body */}
                  <rect x={140} y="73" width="20" height="40" rx="6"
                    fill={themeColor(TH.primaryHSL, 0.06 + t * 0.02, 3)} />
                  {/* Legs */}
                  <rect x={138} y="113" width="9" height="35" rx="3"
                    fill={themeColor(TH.primaryHSL, 0.05 + t * 0.02, 3)} />
                  <rect x={153} y="113" width="9" height="35" rx="3"
                    fill={themeColor(TH.primaryHSL, 0.05 + t * 0.02, 3)} />
                  {/* Eye */}
                  <circle cx={146} cy="52" r="2"
                    fill={themeColor(TH.primaryHSL, 0.12, 12)} />
                </motion.g>

                {/* Merge glow — appears when overlapping */}
                {merged && (
                  <motion.ellipse cx="110" cy="90" rx="30" ry="55"
                    fill={themeColor(TH.accentHSL, 0.06, 15)}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5 }} />
                )}

                {/* Connection lines — appear progressively */}
                {taps >= 2 && !merged && (
                  <motion.line
                    x1={70 + separation} y1="55" x2={150 - separation} y2="55"
                    stroke={themeColor(TH.accentHSL, 0.04, 10)} strokeWidth="0.3"
                    strokeDasharray="3 3"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}
                {taps >= 3 && !merged && (
                  <motion.line
                    x1={70 + separation} y1="90" x2={150 - separation} y2="90"
                    stroke={themeColor(TH.accentHSL, 0.04, 10)} strokeWidth="0.3"
                    strokeDasharray="3 3"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}
              </svg>
            </div>

            {/* Labels */}
            {!merged && (
              <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.12, 12), letterSpacing: '0.1em' }}>LIGHT</div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.primaryHSL, 0.1, 8), letterSpacing: '0.1em' }}>SHADOW</div>
              </div>
            )}
            {merged && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.2, 15), letterSpacing: '0.12em' }}>
                INTEGRATED
              </motion.div>
            )}

            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: STEPS }, (_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.2, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              They merged. The exiled parts returned. You are not half a person pretending to be whole. You are the whole thing.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>shadow integration doubles your power</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The whole thing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}