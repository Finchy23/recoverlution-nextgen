/**
 * MYTHMAKER #5 — The Plot Twist
 * "This isn't the end. It's the twist."
 * ARCHETYPE: Pattern A (Tap ×5) — A path dead-ends at a wall.
 * Each tap cracks the wall more. On final tap it collapses
 * revealing a vast golden vista. Cognitive Reappraisal.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYTHMAKER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MYTHMAKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STEPS = 5;
const CRACKS = [
  'M 120 0 L 115 30 L 122 55 L 118 80',
  'M 100 20 L 108 45 L 95 70 L 102 90',
  'M 140 10 L 135 40 L 142 65',
  'M 110 50 L 130 60 L 125 85',
  'M 90 5 L 100 30 L 95 55 L 105 75',
];

export default function MythMaker_PlotTwist({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const crack = () => {
    if (stage !== 'active' || taps >= STEPS) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = taps / STEPS;
  const collapsed = taps >= STEPS;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The path narrows...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              A story without a problem is boring. The disaster is just the plot point that forces the character to grow. Turn the page.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the wall to find what{'\u2019'}s beyond</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div onClick={crack}
              style={{ position: 'relative', width: '240px', height: '160px', borderRadius: radius.sm, overflow: 'hidden',
                cursor: collapsed ? 'default' : 'pointer', background: themeColor(TH.voidHSL, 0.95, 1) }}>

              {/* The vista behind — golden landscape */}
              <motion.div
                animate={{ opacity: collapsed ? 1 : t * 0.3 }}
                transition={{ duration: collapsed ? 1.5 : 0.3 }}
                style={{ position: 'absolute', inset: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 240 160">
                  {/* Sky gradient */}
                  <defs>
                    <linearGradient id={`${svgId}-vistaGrad`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={themeColor(TH.accentHSL, 0.08, 25)} />
                      <stop offset="100%" stopColor={themeColor(TH.accentHSL, 0.03, 10)} />
                    </linearGradient>
                  </defs>
                  <rect width="240" height="160" fill={`url(#${svgId}-vistaGrad)`} />
                  {/* Distant mountains */}
                  <path d="M 0 120 L 40 70 L 80 95 L 120 55 L 160 80 L 200 60 L 240 90 L 240 160 L 0 160 Z"
                    fill={themeColor(TH.accentHSL, 0.04, 8)} />
                  {/* Sun */}
                  <circle cx="120" cy="50" r="15" fill={themeColor(TH.accentHSL, 0.1, 30)} />
                  {/* Light rays */}
                  {[0, 30, 60, 90, 120, 150].map(angle => (
                    <line key={angle} x1="120" y1="50"
                      x2={120 + Math.cos(angle * Math.PI / 180) * 60}
                      y2={50 + Math.sin(angle * Math.PI / 180) * 60}
                      stroke={themeColor(TH.accentHSL, 0.03, 20)} strokeWidth="0.3" />
                  ))}
                </svg>
              </motion.div>

              {/* The wall — cracks and collapses */}
              <motion.div
                animate={collapsed ? { opacity: 0, scale: 0.3, y: 80 } : {}}
                transition={{ duration: 1.2, ease: 'easeIn' }}
                style={{ position: 'absolute', inset: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 240 160">
                  {/* Brick pattern */}
                  {Array.from({ length: 8 }, (_, row) =>
                    Array.from({ length: 6 }, (_, col) => (
                      <rect key={`${row}-${col}`}
                        x={col * 40 + (row % 2) * 20}
                        y={row * 20}
                        width="38" height="18" rx="1"
                        fill={themeColor(TH.primaryHSL, 0.08, 3)}
                        stroke={themeColor(TH.primaryHSL, 0.04, 1)}
                        strokeWidth="0.5" />
                    ))
                  ).flat()}
                  {/* Cracks — appear progressively */}
                  {CRACKS.slice(0, taps).map((d, i) => (
                    <motion.path key={i} d={d} fill="none"
                      stroke={themeColor(TH.accentHSL, 0.15, 15)}
                      strokeWidth="1"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }} />
                  ))}
                  {/* "DEAD END" label — fades with cracks */}
                  <text x="120" y="85" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.primaryHSL, 0.08 * (1 - t), 10)} letterSpacing="0.2em">
                    DEAD END
                  </text>
                </svg>
              </motion.div>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: STEPS }, (_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.25, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              This isn{'\u2019'}t the end. It{'\u2019'}s the twist. The wall was never permanent. The vista was always waiting.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>reappraisal recruits the prefrontal cortex</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Turn the page.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}