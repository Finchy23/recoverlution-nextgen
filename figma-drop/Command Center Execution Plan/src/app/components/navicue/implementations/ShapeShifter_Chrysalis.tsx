/**
 * SHAPESHIFTER #9 — The Chrysalis
 * "You cannot rush emergence. Darkness is not failure — it is incubation."
 * ARCHETYPE: Pattern E (Hold) — Total darkness. Hold to stay with it.
 * Slowly, hairline cracks of light appear. Then a wing-edge.
 * Frustration Tolerance — embracing the liminal dark.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CRACK_PATHS = [
  'M 90 30 L 88 50 L 92 70',
  'M 70 60 L 75 80 L 72 95',
  'M 110 55 L 108 75 L 112 90',
  'M 82 85 L 85 105 L 80 120',
  'M 98 80 L 102 100 L 96 115',
  'M 75 100 L 80 118 L 78 130',
];

export default function ShapeShifter_Chrysalis({ onComplete }: Props) {
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
  const cracksVisible = Math.floor(t * CRACK_PATHS.length);
  const wingVisible = t > 0.7;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Darkness...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You cannot rush emergence. The butterfly that is helped from the cocoon dies — it needs the struggle. Darkness is not failure. It is incubation.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to stay in the dark</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 180, 200).base }}>

              <svg width="100%" height="100%" viewBox="0 0 180 200">
                {/* The chrysalis shell — dark, organic */}
                <path d="M 65 25 Q 55 60 58 100 Q 55 140 70 170 Q 90 185 110 170 Q 125 140 122 100 Q 125 60 115 25 Q 90 10 65 25"
                  fill={themeColor(TH.primaryHSL, 0.06, 2)}
                  stroke={themeColor(TH.primaryHSL, 0.04, 5)} strokeWidth="0.5" />

                {/* Texture ridges */}
                {Array.from({ length: 6 }, (_, i) => (
                  <path key={i}
                    d={`M ${65 + i * 2} ${40 + i * 22} Q 90 ${35 + i * 22} ${115 - i * 2} ${40 + i * 22}`}
                    fill="none" stroke={themeColor(TH.primaryHSL, 0.03, 3)} strokeWidth="0.3" />
                ))}

                {/* Light cracks — appear progressively */}
                {CRACK_PATHS.slice(0, cracksVisible).map((d, i) => (
                  <motion.path key={i} d={d}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.08 + t * 0.06, 18)}
                    strokeWidth={0.3 + t * 0.3}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }} />
                ))}

                {/* Light bleeding through cracks */}
                {t > 0.3 && (
                  <motion.ellipse cx="90" cy="85" rx={10 + t * 15} ry={15 + t * 20}
                    fill={themeColor(TH.accentHSL, t * 0.03, 15)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 1 }} />
                )}

                {/* Wing edge — appears late */}
                {wingVisible && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 2 }}>
                    {/* Left wing hint */}
                    <path d="M 75 70 Q 55 85 60 105 Q 65 115 78 105"
                      fill="none" stroke={themeColor(TH.accentHSL, 0.12, 20)}
                      strokeWidth="0.5" />
                    {/* Right wing hint */}
                    <path d="M 105 70 Q 125 85 120 105 Q 115 115 102 105"
                      fill="none" stroke={themeColor(TH.accentHSL, 0.12, 20)}
                      strokeWidth="0.5" />
                    {/* Wing veins */}
                    <line x1="75" y1="70" x2="60" y2="90"
                      stroke={themeColor(TH.accentHSL, 0.06, 15)} strokeWidth="0.3" />
                    <line x1="105" y1="70" x2="120" y2="90"
                      stroke={themeColor(TH.accentHSL, 0.06, 15)} strokeWidth="0.3" />
                  </motion.g>
                )}

                {/* Phase label */}
                <text x="90" y="190" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.1, 10)} letterSpacing="0.1em">
                  {t < 0.2 ? 'DARKNESS' : t < 0.4 ? 'STIRRING' : t < 0.6 ? 'CRACKING' : t < 0.8 ? 'LIGHT' : 'EMERGING'}
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
                {hold.isHolding ? 'stay with it...' : 'press and hold'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You stayed. The light emerged. Not despite the darkness, but because of it. The chrysalis was never the prison. It was the preparation.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>emergence requires the dark</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Incubation, not failure.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}