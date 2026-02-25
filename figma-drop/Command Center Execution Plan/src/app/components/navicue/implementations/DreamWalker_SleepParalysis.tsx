/**
 * DREAMWALKER #4 — The Sleep Paralysis
 * "The body is still. The mind is awake. Observe."
 * ARCHETYPE: Pattern E (Hold) — Hold through the paralysis.
 * Cannot move but can watch. Shadows shift. Then clarity arrives.
 * Mindful Awareness — observation without reaction.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function DreamWalker_SleepParalysis({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const hold = useHoldInteraction({
    maxDuration: 7000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = hold.tension;
  // Phases: terror → confusion → observation → clarity → peace
  const phase = t < 0.2 ? 'PARALYZED' : t < 0.4 ? 'SHADOWS' : t < 0.6 ? 'OBSERVING' : t < 0.8 ? 'CLARITY' : 'PEACE';
  const shadowCount = Math.max(0, Math.min(4, Math.floor((0.5 - t) * 8)));

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            You cannot move...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The body is frozen. The mind is awake. There are shapes in the dark. Don{'\u2019'}t fight. Don{'\u2019'}t flee. Just watch. This is the space between.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to stay still and observe</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 200, 180, 'sm').base }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180">
                {/* Ceiling — what you see lying down */}
                <rect width="200" height="180" fill={themeColor(TH.voidHSL, 0.98, 0)} />

                {/* Shadow figures — fade away as observation grows */}
                {Array.from({ length: 4 }, (_, i) => {
                  const visible = i < shadowCount;
                  const sx = 30 + i * 45;
                  return visible ? (
                    <motion.g key={i}
                      initial={{ x: 0, opacity: 0.08 }}
                      animate={{
                        x: [0, (i % 2 ? 3 : -3), 0],
                        opacity: Math.max(0, 0.08 - t * 0.12),
                      }}
                      transition={{ duration: 2 + i * 0.5, repeat: Infinity }}>
                      <ellipse cx={sx} cy="60" rx="8" ry="12"
                        fill={themeColor(TH.primaryHSL, 0.06, 3)} />
                      <rect x={sx - 6} y="72" width="12" height="30" rx="4"
                        fill={themeColor(TH.primaryHSL, 0.05, 2)} />
                    </motion.g>
                  ) : null;
                })}

                {/* Your body outline — paralyzed, supine */}
                <g>
                  <ellipse cx="100" cy="140" rx="30" ry="15"
                    fill="none" stroke={themeColor(TH.accentHSL, 0.04 + t * 0.04, 12)}
                    strokeWidth="0.5" strokeDasharray="3 2" />
                  <ellipse cx="100" cy="155" rx="14" ry="10"
                    fill="none" stroke={themeColor(TH.accentHSL, 0.04 + t * 0.03, 12)}
                    strokeWidth="0.4" strokeDasharray="3 2" />
                </g>

                {/* Observation eye — grows with awareness */}
                {t > 0.3 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: t - 0.3 }} transition={{ duration: 1 }}>
                    <ellipse cx="100" cy="80" rx={8 + t * 10} ry={4 + t * 5}
                      fill="none" stroke={themeColor(TH.accentHSL, 0.1 + t * 0.05, 20)}
                      strokeWidth="0.5" />
                    <circle cx="100" cy="80" r={2 + t * 3}
                      fill={themeColor(TH.accentHSL, 0.08 + t * 0.06, 22)} />
                  </motion.g>
                )}

                {/* Light rays — emerge with clarity */}
                {t > 0.6 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: t - 0.6 }}>
                    {Array.from({ length: 6 }, (_, i) => {
                      const a = (i / 6) * Math.PI * 2;
                      return (
                        <line key={i}
                          x1="100" y1="80"
                          x2={100 + Math.cos(a) * 40} y2={80 + Math.sin(a) * 25}
                          stroke={themeColor(TH.accentHSL, 0.03, 18)}
                          strokeWidth={safeSvgStroke(0.3)} />
                      );
                    })}
                  </motion.g>
                )}

                {/* Phase label */}
                <text x="100" y="25" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.1 + t * 0.08, 12)} letterSpacing="0.1em">
                  {phase}
                </text>
              </svg>
            </div>

            {/* Tension bar */}
            <div style={{ width: '140px', height: '3px', borderRadius: '2px', background: themeColor(TH.voidHSL, 0.4, 3) }}>
              <motion.div animate={{ width: `${t * 100}%` }}
                style={{ height: '100%', borderRadius: '2px',
                  background: themeColor(TH.accentHSL, 0.12 + t * 0.1, 12) }} />
            </div>

            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.5 }}>
                {hold.isHolding ? 'just observe...' : 'press and hold'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The shadows dissolved. Not because you fought them, but because you watched. Observation without reaction is the deepest form of courage.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the witness dissolves the shadow</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Just watch.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}