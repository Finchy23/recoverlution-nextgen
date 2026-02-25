/**
 * MYTHMAKER #6 — The Mentor Summon
 * "You have a council of elders in your head. Ask the Mentor."
 * ARCHETYPE: Pattern A (Tap ×5) — An empty chair. Each tap builds
 * a holographic presence until a wise figure fully materializes.
 * Solomon's Paradox — third-person wisdom access.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYTHMAKER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MYTHMAKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STEPS = 5;
const SCAN_LINES = Array.from({ length: 12 }, (_, i) => ({
  y: 20 + i * 8, delay: i * 0.08,
}));

export default function MythMaker_MentorSummon({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const summon = () => {
    if (stage !== 'active' || taps >= STEPS) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = taps / STEPS;
  const materialized = taps >= STEPS;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            An empty seat awaits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You have a council of elders in your head. Stop asking yourself. Ask the Mentor.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to summon the guide</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div onClick={summon}
              style={{ position: 'relative', width: '200px', height: '200px', borderRadius: radius.md, overflow: 'hidden',
                cursor: materialized ? 'default' : 'pointer', background: themeColor(TH.voidHSL, 0.95, 1) }}>

              {/* The chair */}
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Chair back */}
                <rect x="65" y="90" width="70" height="5" rx="2" fill={themeColor(TH.primaryHSL, 0.08, 5)} />
                <rect x="70" y="90" width="3" height="50" fill={themeColor(TH.primaryHSL, 0.06, 4)} />
                <rect x="127" y="90" width="3" height="50" fill={themeColor(TH.primaryHSL, 0.06, 4)} />
                {/* Chair seat */}
                <rect x="65" y="140" width="70" height="5" rx="2" fill={themeColor(TH.primaryHSL, 0.08, 5)} />
                {/* Chair legs */}
                <rect x="68" y="145" width="3" height="35" fill={themeColor(TH.primaryHSL, 0.06, 4)} />
                <rect x="129" y="145" width="3" height="35" fill={themeColor(TH.primaryHSL, 0.06, 4)} />
                {/* Floor */}
                <line x1="30" y1="180" x2="170" y2="180" stroke={themeColor(TH.primaryHSL, 0.04, 3)} strokeWidth="0.5" />
              </svg>

              {/* Holographic figure — builds with taps */}
              <motion.div
                animate={{ opacity: t }}
                style={{ position: 'absolute', inset: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 200 200">
                  {/* Scan lines — holographic effect */}
                  {SCAN_LINES.map((line, i) => (
                    <motion.line key={i}
                      x1="75" y1={line.y} x2="125" y2={line.y}
                      stroke={themeColor(TH.accentHSL, 0.03 + t * 0.04, 15)}
                      strokeWidth="0.3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: t > 0.2 ? 0.5 : 0 }}
                      transition={{ delay: line.delay }} />
                  ))}

                  {/* Head — appears at tap 1+ */}
                  {taps >= 1 && (
                    <motion.circle cx="100" cy="50" r="15"
                      fill="none" stroke={themeColor(TH.accentHSL, 0.08 + t * 0.06, 18)}
                      strokeWidth="0.5" strokeDasharray={materialized ? 'none' : '2 2'}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  )}

                  {/* Shoulders — appears at tap 2+ */}
                  {taps >= 2 && (
                    <motion.path d="M 75 75 Q 100 65 125 75"
                      fill="none" stroke={themeColor(TH.accentHSL, 0.06 + t * 0.05, 15)}
                      strokeWidth="0.5" strokeDasharray={materialized ? 'none' : '2 2'}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  )}

                  {/* Torso — appears at tap 3+ */}
                  {taps >= 3 && (
                    <motion.rect x="82" y="75" width="36" height="55" rx="4"
                      fill="none" stroke={themeColor(TH.accentHSL, 0.05 + t * 0.04, 12)}
                      strokeWidth="0.5" strokeDasharray={materialized ? 'none' : '3 2'}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  )}

                  {/* Hands resting — appears at tap 4+ */}
                  {taps >= 4 && (
                    <>
                      <motion.ellipse cx="78" cy="125" rx="6" ry="4"
                        fill={themeColor(TH.accentHSL, 0.04, 10)} stroke="none"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                      <motion.ellipse cx="122" cy="125" rx="6" ry="4"
                        fill={themeColor(TH.accentHSL, 0.04, 10)} stroke="none"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                    </>
                  )}

                  {/* Eyes — wise, gentle (materialized) */}
                  {materialized && (
                    <>
                      <motion.circle cx="94" cy="48" r="1.5"
                        fill={themeColor(TH.accentHSL, 0.25, 25)}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
                      <motion.circle cx="106" cy="48" r="1.5"
                        fill={themeColor(TH.accentHSL, 0.25, 25)}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />
                    </>
                  )}

                  {/* Aura glow */}
                  <motion.ellipse cx="100" cy="90" rx={30 + t * 10} ry={50 + t * 15}
                    fill={themeColor(TH.accentHSL, t * 0.02, 15)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [t * 0.02, t * 0.04, t * 0.02] }}
                    transition={{ duration: 3, repeat: Infinity }} />
                </svg>
              </motion.div>
            </div>

            {/* Summon status */}
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
              color: themeColor(TH.accentHSL, materialized ? 0.3 : 0.12, 12) }}>
              {materialized ? 'THE MENTOR HAS ARRIVED' : `MATERIALIZING ${Math.round(t * 100)}%`}
            </div>

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
              What would they say? You already know. You always knew. The mentor is your own wisdom viewed from a distance.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Solomon{'\u2019'}s Paradox: we see clearly for others</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The council is always in session.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}