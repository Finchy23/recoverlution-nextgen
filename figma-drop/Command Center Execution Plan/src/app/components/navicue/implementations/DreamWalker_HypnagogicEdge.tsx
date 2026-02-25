/**
 * DREAMWALKER #8 — The Hypnagogic Edge
 * "The most creative place in your mind is the border."
 * ARCHETYPE: Pattern E (Hold) — The threshold between waking and sleep.
 * Hold to stay on the edge. Geometric forms flicker and dissolve.
 * Hypnagogia — the creative twilight state.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function DreamWalker_HypnagogicEdge({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [flickerSeed, setFlickerSeed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Flicker hypnagogic forms
  useEffect(() => {
    if (stage === 'active' && hold.isHolding) {
      const id = setInterval(() => setFlickerSeed(s => s + 1), 800);
      return () => clearInterval(id);
    }
  }, [stage, hold.isHolding]);

  const t = hold.tension;

  // Hypnagogic shapes — geometric hallucinations
  const shapes = Array.from({ length: 4 }, (_, i) => {
    const seed = (flickerSeed + i * 7) % 20;
    const cx = 40 + (seed * 13) % 120;
    const cy = 30 + (seed * 11) % 100;
    const type = seed % 4;
    return { cx, cy, type, alpha: 0.04 + t * 0.04 + Math.sin(seed) * 0.02 };
  });

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The edge between...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Edison, Dalí, and Tesla all used the same trick: fall asleep holding something, and when it drops — catch the idea. The hypnagogic edge is where logic meets hallucination. Stay on the border.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to stay on the edge</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 200, 160, 'sm').base }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160">
                {/* Gradient border: awake (left) ↔ asleep (right) */}
                <defs>
                  <linearGradient id={`${svgId}-edgeGrad`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={themeColor(TH.accentHSL, 0.03, 15)} />
                    <stop offset="50%" stopColor={themeColor(TH.accentHSL, 0.06, 20)} />
                    <stop offset="100%" stopColor={themeColor(TH.primaryHSL, 0.02, 5)} />
                  </linearGradient>
                </defs>
                <rect width="200" height="160" fill={`url(#${svgId}-edgeGrad)`} />

                {/* Border line — the edge */}
                <line x1="100" y1="0" x2="100" y2="160"
                  stroke={themeColor(TH.accentHSL, 0.06 + t * 0.04, 18)}
                  strokeWidth="0.5" strokeDasharray="4 3" />

                {/* Labels */}
                <text x="30" y="15" fontSize="4" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.06, 12)} letterSpacing="0.1em">AWAKE</text>
                <text x="150" y="15" fontSize="4" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.06, 8)} letterSpacing="0.1em">ASLEEP</text>

                {/* Hypnagogic hallucination shapes — flicker during hold */}
                {hold.isHolding && shapes.map((s, i) => (
                  <motion.g key={`${flickerSeed}-${i}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: s.alpha, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}>
                    {s.type === 0 && (
                      <circle cx={s.cx} cy={s.cy} r={8 + t * 4}
                        fill="none" stroke={themeColor(TH.accentHSL, s.alpha, 18)} strokeWidth="0.5" />
                    )}
                    {s.type === 1 && (
                      <polygon points={`${s.cx},${s.cy - 8} ${s.cx + 7},${s.cy + 5} ${s.cx - 7},${s.cy + 5}`}
                        fill="none" stroke={themeColor(TH.accentHSL, s.alpha, 15)} strokeWidth="0.4" />
                    )}
                    {s.type === 2 && (
                      <rect x={s.cx - 6} y={s.cy - 6} width="12" height="12" rx="1"
                        fill="none" stroke={themeColor(TH.accentHSL, s.alpha, 16)} strokeWidth="0.4" />
                    )}
                    {s.type === 3 && (
                      <line x1={s.cx - 8} y1={s.cy} x2={s.cx + 8} y2={s.cy}
                        stroke={themeColor(TH.accentHSL, s.alpha, 14)} strokeWidth="0.5" />
                    )}
                  </motion.g>
                ))}

                {/* Resting state without hold */}
                {!hold.isHolding && !hold.completed && (
                  <motion.text x="100" y="85" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic"
                    fill={themeColor(TH.accentHSL, 0.06, 10)}
                    animate={{ opacity: [0.04, 0.08, 0.04] }}
                    transition={{ duration: 2.5, repeat: Infinity }}>
                    the edge awaits
                  </motion.text>
                )}

                {/* Phase */}
                <text x="100" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.08, 12)} letterSpacing="0.1em">
                  {t < 0.2 ? 'DRIFTING' : t < 0.4 ? 'PHOSPHENES' : t < 0.6 ? 'FACES' : t < 0.8 ? 'GEOMETRIES' : 'TWILIGHT'}
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
                {hold.isHolding ? 'stay on the edge...' : 'press and hold'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You lingered on the border. That{'\u2019'}s where the best ideas live — not in waking logic or sleeping chaos, but in the liminal space between. The edge is the studio.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>genius lives on the border</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The edge is the studio.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}