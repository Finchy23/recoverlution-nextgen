/**
 * BENDER #5 — The Narrative Override
 * "The story is not finished. You hold the pen. Rewrite the ending."
 * ARCHETYPE: Pattern A (Tap × 5) — Red pen strikes through limiting words.
 * Each tap crosses out one word and replaces it. Cognitive restructuring.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const OVERRIDES = [
  { old: 'Impossible', next: 'Inevitable', y: 35 },
  { old: 'Too late', next: 'Right on time', y: 58 },
  { old: 'Not enough', next: 'More than enough', y: 81 },
  { old: 'They won\'t let me', next: 'I don\'t need permission', y: 104 },
  { old: 'I can\'t', next: 'I will', y: 127 },
];

export default function Bender_NarrativeOverride({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [overridden, setOverridden] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const override = () => {
    if (stage !== 'active' || overridden >= OVERRIDES.length) return;
    const next = overridden + 1;
    setOverridden(next);
    if (next >= OVERRIDES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = overridden / OVERRIDES.length;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Reading the old story...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>They said "Impossible." Cross it out. Write "Inevitable." The story is not finished. You hold the pen. Rewrite the ending.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to strike through and rewrite</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={override}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: overridden >= OVERRIDES.length ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '240px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Paper texture lines */}
                {Array.from({ length: 7 }, (_, i) => (
                  <line key={i} x1="20" y1={25 + i * 23} x2="220" y2={25 + i * 23}
                    stroke={themeColor(TH.primaryHSL, 0.02)} strokeWidth={safeSvgStroke(0.3)} />
                ))}

                {OVERRIDES.map((item, i) => {
                  const done = i < overridden;
                  return (
                    <g key={i}>
                      {/* Original text */}
                      <text x="30" y={item.y} fontSize="6" fontFamily="Georgia, serif"
                        fill={themeColor(TH.primaryHSL, done ? 0.04 : 0.08, done ? 5 : 15)}>
                        {item.old}
                      </text>
                      {/* Strikethrough — red pen */}
                      {done && (
                        <motion.line
                          x1="25" y1={item.y - 2} x2={30 + item.old.length * 5.5} y2={item.y - 2}
                          stroke="hsla(0, 30%, 35%, 0.15)"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                      )}
                      {/* Replacement text — appears after strike */}
                      {done && (
                        <motion.text x={35 + item.old.length * 5.5 + 8} y={item.y} fontSize="5.5"
                          fontFamily="Georgia, serif" fontWeight="600" fontStyle="italic"
                          fill={themeColor(TH.accentHSL, 0.14, 15)}
                          initial={{ opacity: 0, x: -5 }} animate={{ opacity: 0.14, x: 0 }}
                          transition={{ delay: 0.3, duration: 0.6 }}>
                          {item.next}
                        </motion.text>
                      )}
                    </g>
                  );
                })}

                {/* Red pen icon — current position */}
                {overridden < OVERRIDES.length && (
                  <motion.g initial={{ y: 0 }} animate={{ y: OVERRIDES[overridden].y - 15 }}>
                    <circle cx="18" cy="15" r="3"
                      fill="hsla(0, 25%, 30%, 0.08)" />
                    <line x1="18" y1="12" x2="18" y2="8"
                      stroke="hsla(0, 20%, 30%, 0.06)" strokeWidth="1" strokeLinecap="round" />
                  </motion.g>
                )}

                <text x="120" y="155" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'narrative rewritten' : `overrides: ${overridden}/${OVERRIDES.length}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {overridden === 0 ? 'Five limiting sentences. The old narrative.' : overridden < OVERRIDES.length ? `"${OVERRIDES[overridden - 1].old}" → "${OVERRIDES[overridden - 1].next}"` : 'Every sentence rewritten. The pen is yours.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {OVERRIDES.map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < overridden ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five overrides. "Impossible" → "Inevitable." "Too late" → "Right on time." "Not enough" → "More than enough." "They won't let me" → "I don't need permission." "I can't" → "I will." The red pen struck through every limiting sentence. The story is not finished. You hold the pen.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cognitive restructuring. Actively challenging and replacing maladaptive schemas with high-agency ones. The narrative is yours to rewrite.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Strike. Rewrite. Inevitable.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}