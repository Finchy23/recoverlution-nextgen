/**
 * BENDER #6 — The Future Memory
 * "The brain cannot distinguish between a vivid memory and a vivid simulation."
 * ARCHETYPE: Pattern A (Tap × 5) — Each tap advances a grainy 8mm film frame.
 * Static → grain → shapes → scene → clarity. Prospective memory encoding.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Practice');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FRAME_STEPS = 5;
const FRAME_DESC = ['Static. Noise.', 'Shapes emerging from grain.', 'A figure. Movement.', 'A scene forming. Details.', 'Clear. The future you won.'];

export default function Bender_FutureMemory({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [frames, setFrames] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const advance = () => {
    if (stage !== 'active' || frames >= FRAME_STEPS) return;
    const next = frames + 1;
    setFrames(next);
    if (next >= FRAME_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = frames / FRAME_STEPS;
  const grain = (1 - t) * 6;

  const svgId = useId();

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Tuning the future...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Remember tomorrow. What did it feel like to win? The brain cannot distinguish between a vivid memory and a vivid simulation. Trick the brain. Feel it now.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to advance the film, future to present</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={advance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: frames >= FRAME_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.xs, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 5),
              border: `1px solid hsla(35, ${t * 15}%, ${12 + t * 8}%, ${0.04 + t * 0.03})` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <filter id={`${svgId}-filmGrain`}>
                    <feTurbulence type="fractalNoise" baseFrequency={0.5 + grain * 0.1} numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale={grain} />
                  </filter>
                </defs>

                <g filter={grain > 0.5 ? `url(#${svgId}-filmGrain)` : undefined}>
                  {/* Static noise at frame 0 */}
                  {frames === 0 && Array.from({ length: 60 }, (_, i) => (
                    <rect key={i} x={Math.random() * 220} y={Math.random() * 160}
                      width={2 + Math.random() * 6} height={1}
                      fill={`hsla(35, ${Math.random() * 8}%, ${10 + Math.random() * 15}%, ${0.02 + Math.random() * 0.03})`} />
                  ))}

                  {/* Emerging shapes — frame 1+ */}
                  {frames >= 1 && (
                    <motion.ellipse cx="110" cy="80" rx={20 + t * 15} ry={30 + t * 15}
                      fill={`hsla(35, ${t * 12}%, ${10 + t * 8}%, ${0.02 + t * 0.03})`}
                      initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.02 + t * 0.03) }}
                    />
                  )}

                  {/* Figure — frame 2+ */}
                  {frames >= 2 && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.06 + t * 0.04) }}>
                      <circle cx="110" cy="55" r={6 + t * 2}
                        fill={`hsla(35, ${t * 10}%, ${15 + t * 10}%, ${0.04 + t * 0.03})`} />
                      <rect x="104" y="63" width="12" height="20" rx="3"
                        fill={`hsla(35, ${t * 8}%, ${13 + t * 8}%, ${0.03 + t * 0.025})`} />
                    </motion.g>
                  )}

                  {/* Scene details — frame 3+ */}
                  {frames >= 3 && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.05 + t * 0.03) }}>
                      <rect x="40" y="100" width="50" height="30" rx="2"
                        fill={`hsla(35, ${t * 8}%, ${12 + t * 6}%, 0.03)`} />
                      <rect x="130" y="95" width="40" height="35" rx="2"
                        fill={`hsla(35, ${t * 8}%, ${12 + t * 6}%, 0.025)`} />
                      <line x1="30" y1="130" x2="190" y2="130"
                        stroke={`hsla(35, ${t * 6}%, ${15 + t * 6}%, 0.03)`} strokeWidth={safeSvgStroke(0.3)} />
                    </motion.g>
                  )}

                  {/* Victory moment — frame 4+ (clarity) */}
                  {frames >= 4 && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}>
                      {/* Arms raised */}
                      <line x1="104" y1="68" x2="92" y2="56"
                        stroke={`hsla(35, 12%, 25%, 0.07)`} strokeWidth="0.8" strokeLinecap="round" />
                      <line x1="116" y1="68" x2="128" y2="56"
                        stroke={`hsla(35, 12%, 25%, 0.07)`} strokeWidth="0.8" strokeLinecap="round" />
                    </motion.g>
                  )}

                  {/* Full clarity glow */}
                  {frames >= FRAME_STEPS && (
                    <motion.rect x="0" y="0" width="220" height="160"
                      fill="hsla(35, 15%, 25%, 0.02)"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                      transition={{ duration: 2 }}
                    />
                  )}
                </g>

                {/* Film sprocket holes */}
                {Array.from({ length: 8 }, (_, i) => (
                  <rect key={i} x="3" y={10 + i * 18} width="4" height="8" rx="1"
                    fill={`hsla(35, 6%, 14%, 0.04)`} />
                ))}
                {Array.from({ length: 8 }, (_, i) => (
                  <rect key={`r-${i}`} x="213" y={10 + i * 18} width="4" height="8" rx="1"
                    fill={`hsla(35, 6%, 14%, 0.04)`} />
                ))}

                {/* Frame counter */}
                <text x="110" y="152" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'MEMORY ENCODED. the future is now' : `frame ${frames}/${FRAME_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {frames === 0 ? 'Static. A grainy 8mm film. The future is noise.' : FRAME_DESC[frames - 1]}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: FRAME_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < frames ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five frames. Static became grain. Grain became shape. Shape became figure. Figure became scene. Scene became a victory, arms raised, golden light. You just watched a home movie from the future. The brain cannot tell the difference. It is now a memory. Feel it. It already happened.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Prospective memory encoding. Pre-experiencing future success activates the same neural networks as the actual event, priming the reticular activating system to find the path.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Static. Film. Memory.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}