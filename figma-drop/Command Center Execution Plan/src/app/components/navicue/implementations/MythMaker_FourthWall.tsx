/**
 * MYTHMAKER #8 — The Fourth Wall
 * "You are the actor. Step off the stage and watch the play."
 * ARCHETYPE: Pattern A (Tap ×5) — The screen progressively pulls back
 * to reveal a theater audience watching you. Each tap zooms out further.
 * Meta-Cognitive Detachment — observing one's own performance.
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
const AUDIENCE_ROWS = [
  { y: 155, seats: 5, size: 3 },
  { y: 163, seats: 7, size: 2.5 },
  { y: 170, seats: 9, size: 2 },
];

export default function MythMaker_FourthWall({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const pullBack = () => {
    if (stage !== 'active' || taps >= STEPS) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = taps / STEPS;
  const broken = taps >= STEPS;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The stage lights flicker...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Do not get lost in the drama. You are the one watching the drama. Break the fourth wall. Wink at the camera.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to step back from the stage</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={pullBack}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: broken ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '240px', height: '180px', borderRadius: radius.sm, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, 1) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 180">
                {/* Theater frame — expands with each tap */}
                <motion.rect
                  x={10 + t * 15} y={5 + t * 5}
                  width={220 - t * 30} height={140 - t * 20}
                  rx="4" fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.08 + t * 0.04, 8)}
                  strokeWidth="0.5"
                  transition={{ duration: 0.5 }}
                />

                {/* Curtains — appear as we zoom out */}
                {taps >= 2 && (
                  <>
                    <motion.path
                      d={`M ${10 + t * 15} ${5 + t * 5} Q ${30 + t * 10} ${40 + t * 5} ${10 + t * 15} ${80 + t * 5}`}
                      fill={themeColor(TH.primaryHSL, 0.06, 5)} stroke="none"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                    <motion.path
                      d={`M ${230 - t * 15} ${5 + t * 5} Q ${210 - t * 10} ${40 + t * 5} ${230 - t * 15} ${80 + t * 5}`}
                      fill={themeColor(TH.primaryHSL, 0.06, 5)} stroke="none"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  </>
                )}

                {/* The figure on stage — "you" */}
                <motion.g
                  animate={{ scale: 1 - t * 0.3, y: t * 10 }}
                  style={{ transformOrigin: '120px 80px' }}>
                  {/* Spotlight cone */}
                  <motion.path
                    d={`M 120 ${20 - t * 5} L ${100 - t * 5} ${130 - t * 10} L ${140 + t * 5} ${130 - t * 10} Z`}
                    fill={themeColor(TH.accentHSL, 0.02 + t * 0.01, 15)}
                    animate={{ opacity: [0.02, 0.04, 0.02] }}
                    transition={{ duration: 3, repeat: Infinity }} />
                  {/* Head */}
                  <circle cx="120" cy="60" r="6" fill={themeColor(TH.accentHSL, 0.08, 12)} />
                  {/* Body */}
                  <rect x="115" y="68" width="10" height="18" rx="3" fill={themeColor(TH.accentHSL, 0.06, 8)} />
                  {/* Stage floor */}
                  <line x1="80" y1="90" x2="160" y2="90"
                    stroke={themeColor(TH.primaryHSL, 0.06, 5)} strokeWidth="0.5" />
                </motion.g>

                {/* Audience — progressively revealed */}
                {AUDIENCE_ROWS.map((row, ri) => (
                  taps >= ri + 2 && (
                    <motion.g key={ri} initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.2 }}>
                      {Array.from({ length: row.seats }, (_, si) => {
                        const x = 120 + (si - (row.seats - 1) / 2) * (row.size * 4);
                        return (
                          <circle key={si} cx={x} cy={row.y} r={row.size}
                            fill={themeColor(TH.primaryHSL, 0.06, 8)} />
                        );
                      })}
                    </motion.g>
                  )
                ))}

                {/* "BREAKING THE FOURTH WALL" text */}
                {broken && (
                  <motion.text x="120" y="100" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.2, 15)} letterSpacing="0.15em"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    THE AUDIENCE WAS ALWAYS THERE
                  </motion.text>
                )}
              </svg>
            </div>

            {/* Progress dots */}
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
              You are not the actor lost in the play. You are the audience watching the play. This distance is freedom.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>meta-cognition: the watcher behind the watched</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Wink at the camera.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}