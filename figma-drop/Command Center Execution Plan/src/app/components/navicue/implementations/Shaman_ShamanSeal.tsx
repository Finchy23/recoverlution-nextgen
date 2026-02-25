/**
 * SHAMAN #10 — The Shaman Seal (The Proof)
 * "I walk between worlds. I speak to what others cannot see."
 * ARCHETYPE: Pattern A (Tap × 5) — A medicine wheel divided into four quadrants.
 * Each tap: an element enters (earth, fire, water, air). Fifth: the center glows — all converge.
 * Medicine wheel integration. Elemental wholeness.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

const ELEMENT_STEPS = 5;
const ELEMENTS = [
  { label: 'earth', quadrant: 'S', color: [28, 25, 20] as [number, number, number], symbol: 'M 100,115 L 95,125 L 105,125 Z' },
  { label: 'fire', quadrant: 'E', color: [15, 28, 25] as [number, number, number], symbol: 'M 130,80 Q 135,70 130,60 Q 125,70 130,80 Z' },
  { label: 'water', quadrant: 'W', color: [200, 12, 22] as [number, number, number], symbol: 'M 70,80 Q 65,72 70,65 Q 75,72 70,80 Z' },
  { label: 'air', quadrant: 'N', color: [0, 0, 30] as [number, number, number], symbol: 'M 100,55 Q 95,48 100,42 Q 105,48 100,55 Z' },
  { label: 'spirit', quadrant: 'C', color: [120, 6, 30] as [number, number, number], symbol: '' },
];

export default function Shaman_ShamanSeal({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [elements, setElements] = useState(0);

  const invoke = () => {
    if (stage !== 'active' || elements >= ELEMENT_STEPS) return;
    const next = elements + 1;
    setElements(next);
    if (next >= ELEMENT_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = elements / ELEMENT_STEPS;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The wheel turns...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>I walk between worlds. I speak to what others cannot see. Earth, fire, water, air, and at the center: spirit.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to invoke each element</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={invoke}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: elements >= ELEMENT_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: '50%', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Medicine wheel — outer ring */}
                <circle cx="100" cy="85" r="55"
                  fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.05 + t * 0.02, 10)}
                  strokeWidth="1" />
                {/* Inner ring */}
                <circle cx="100" cy="85" r="30"
                  fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.03 + t * 0.01, 8)}
                  strokeWidth="0.5" />

                {/* Cross lines — four directions */}
                <line x1="100" y1="30" x2="100" y2="140"
                  stroke={themeColor(TH.primaryHSL, 0.04, 8)} strokeWidth="0.4" />
                <line x1="45" y1="85" x2="155" y2="85"
                  stroke={themeColor(TH.primaryHSL, 0.04, 8)} strokeWidth="0.4" />

                {/* Element symbols — appear as invoked */}
                {ELEMENTS.slice(0, elements).map((el, i) => {
                  if (i === 4) return null; // spirit handled separately
                  return (
                    <motion.g key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 50 }}>
                      <motion.path d={el.symbol}
                        fill={`hsla(${el.color[0]}, ${el.color[1]}%, ${el.color[2]}%, ${0.08 + i * 0.01})`}
                        stroke={`hsla(${el.color[0]}, ${el.color[1]}%, ${el.color[2] + 10}%, ${0.06})`}
                        strokeWidth="0.3"
                      />
                      {/* Quadrant glow */}
                      <circle
                        cx={i === 0 ? 100 : i === 1 ? 135 : i === 2 ? 65 : 100}
                        cy={i === 0 ? 120 : i === 1 ? 85 : i === 2 ? 85 : 50}
                        r="18"
                        fill={`hsla(${el.color[0]}, ${el.color[1]}%, ${el.color[2]}%, 0.02)`}
                      />
                      {/* Label */}
                      <text
                        x={i === 0 ? 100 : i === 1 ? 145 : i === 2 ? 55 : 100}
                        y={i === 0 ? 138 : i === 1 ? 88 : i === 2 ? 88 : 40}
                        textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={`hsla(${el.color[0]}, ${el.color[1]}%, ${el.color[2] + 15}%, 0.06)`}>
                        {el.label}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Spirit center — fifth element */}
                {elements >= ELEMENT_STEPS && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 30, duration: 2 }}>
                    <motion.circle cx="100" cy="85" r="12"
                      fill={themeColor(TH.accentHSL, 0.06, 15)}
                      animate={{ r: [12, 14, 12] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <circle cx="100" cy="85" r="6"
                      fill={themeColor(TH.accentHSL, 0.1, 20)} />
                    <text x="100" y="88" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold"
                      fill={themeColor(TH.accentHSL, 0.15, 22)}>
                      spirit
                    </text>
                    {/* Convergence lines from all four elements to center */}
                    {[[100, 120], [135, 85], [65, 85], [100, 50]].map(([ex, ey], i) => (
                      <motion.line key={`conv-${i}`}
                        x1={ex} y1={ey} x2="100" y2="85"
                        stroke={themeColor(TH.accentHSL, 0.04, 12)}
                        strokeWidth="0.5"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: i * 0.2 }}
                      />
                    ))}
                  </motion.g>
                )}

                <text x="100" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'MEDICINE WHEEL COMPLETE. all worlds connected' : `elements: ${elements}/${ELEMENT_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {elements === 0 ? 'An empty medicine wheel. Four directions. One center.' : elements < ELEMENT_STEPS ? `${ELEMENTS[elements - 1].label} invoked. The wheel turns.` : 'All five elements. Earth, fire, water, air, spirit. The wheel is complete.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: ELEMENT_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < elements ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Five invocations. Earth in the south, grounding. Fire in the east, transformation. Water in the west, flow. Air in the north, vision. And at the center: spirit, the convergence of all four. The medicine wheel is complete. I walk between worlds. I speak to what others cannot see. All elements live in you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Medicine wheel integration. The four-directional framework maps to emotional, physical, mental, and spiritual domains, creating a holistic container for identity integration.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Earth. Fire. Water. Air. Spirit.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}