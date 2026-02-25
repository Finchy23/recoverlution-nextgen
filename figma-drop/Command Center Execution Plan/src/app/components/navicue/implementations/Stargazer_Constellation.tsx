/**
 * STARGAZER #5 — The Constellation
 * "The stars do not know they are a bear or a hunter. You drew the picture."
 * ARCHETYPE: Pattern A (Tap × 5) — Random dots on black.
 * Each tap draws a line between two dots, forming a shape. You are the meaning-maker.
 * Gestalt perception. Meaning creation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DRAW_STEPS = 5;
const STARS = [
  { x: 55, y: 40 },
  { x: 130, y: 35 },
  { x: 165, y: 70 },
  { x: 145, y: 115 },
  { x: 80, y: 120 },
  { x: 40, y: 80 },
];
const LINES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
];

export default function Stargazer_Constellation({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [drawn, setDrawn] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const draw = () => {
    if (stage !== 'active' || drawn >= DRAW_STEPS) return;
    const next = drawn + 1;
    setDrawn(next);
    if (next >= DRAW_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = drawn / DRAW_STEPS;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Random dots in the dark...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The stars do not know they are a bear or a hunter. You drew the picture. You are the meaning-maker. The pattern is yours to create.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to draw each connection between stars</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={draw}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: drawn >= DRAW_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.97, t * 2) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Background stars (noise) */}
                {Array.from({ length: 25 }, (_, i) => (
                  <circle key={`bg-${i}`}
                    cx={5 + (i * 43) % 190} cy={5 + (i * 29) % 150}
                    r={0.3 + (i % 4) * 0.1}
                    fill={themeColor(TH.primaryHSL, 0.02 - t * 0.005, 12 + (i % 5))} />
                ))}

                {/* Connection lines — drawn with each tap */}
                {LINES.slice(0, drawn).map(([a, b], i) => (
                  <motion.line key={`line-${i}`}
                    x1={STARS[a].x} y1={STARS[a].y}
                    x2={STARS[b].x} y2={STARS[b].y}
                    stroke={themeColor(TH.accentHSL, 0.06 + i * 0.008, 18 + i * 2)}
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ))}

                {/* Close the shape at completion */}
                {drawn >= DRAW_STEPS && (
                  <motion.line
                    x1={STARS[5].x} y1={STARS[5].y}
                    x2={STARS[0].x} y2={STARS[0].y}
                    stroke={themeColor(TH.accentHSL, 0.05, 18)}
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                )}

                {/* Constellation stars (signal) */}
                {STARS.map((star, i) => {
                  const isConnected = LINES.slice(0, drawn).some(([a, b]) => a === i || b === i);
                  return (
                    <motion.g key={`star-${i}`}>
                      <circle cx={star.x} cy={star.y} r={isConnected ? 2.5 + t : 1.5}
                        fill={themeColor(isConnected ? TH.accentHSL : TH.primaryHSL, isConnected ? 0.1 + t * 0.05 : 0.04, isConnected ? 22 + t * 8 : 14)}
                      />
                      {isConnected && (
                        <circle cx={star.x} cy={star.y} r={5 + t * 3}
                          fill={themeColor(TH.accentHSL, 0.02, 15)} />
                      )}
                    </motion.g>
                  );
                })}

                {/* Shape fill at completion */}
                {drawn >= DRAW_STEPS && (
                  <motion.polygon
                    points={STARS.map(s => `${s.x},${s.y}`).join(' ')}
                    fill={themeColor(TH.accentHSL, 0.015, 10)}
                    stroke="none"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.015 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="100" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {t >= 1 ? 'YOUR CONSTELLATION. you drew the meaning' : `lines: ${drawn}/${DRAW_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {drawn === 0 ? 'Six bright dots among dozens of dim ones. Random. Meaningless.' : drawn < DRAW_STEPS ? `Line ${drawn} drawn. A shape is emerging.` : 'A constellation. The stars did not change. You connected them.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: DRAW_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < drawn ? themeColor(TH.accentHSL, 0.5, 18) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five lines. Six dots. Before: random noise. After: a shape. A constellation. You drew it. The stars do not know they are a bear or a hunter. You drew the picture. You are the meaning-maker. The data of your life is the same. The pattern is yours to create.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Gestalt perception. The brain organizes chaotic stimuli into meaningful wholes. We literally create our reality by how we connect the data points of our lives.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dots. Lines. Meaning.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}