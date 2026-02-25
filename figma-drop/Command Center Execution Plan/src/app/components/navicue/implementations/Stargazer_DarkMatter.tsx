/**
 * STARGAZER #8 — The Dark Matter
 * "95% of the universe is invisible. Trust what you cannot see."
 * ARCHETYPE: Pattern A (Tap × 5) — Empty space. Each tap reveals invisible structure:
 * gravitational lensing, dark matter filaments, hidden connections.
 * Implicit trust. Invisible support networks.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const REVEAL_STEPS = 5;
const FILAMENTS = [
  { x1: 30, y1: 25, x2: 90, y2: 70, label: 'invisible gravity' },
  { x1: 170, y1: 30, x2: 120, y2: 75, label: 'hidden connections' },
  { x1: 90, y1: 70, x2: 120, y2: 75, label: 'dark web' },
  { x1: 50, y1: 110, x2: 90, y2: 70, label: 'silent support' },
  { x1: 160, y1: 115, x2: 120, y2: 75, label: 'unseen scaffolding' },
];

export default function Stargazer_DarkMatter({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [revealed, setRevealed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const reveal = () => {
    if (stage !== 'active' || revealed >= REVEAL_STEPS) return;
    const next = revealed + 1;
    setRevealed(next);
    if (next >= REVEAL_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = revealed / REVEAL_STEPS;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Empty space. Or is it?
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>95% of the universe is invisible. Just because you cannot measure it does not mean it is not holding you together. Trust what you cannot see. Trust the invisible support.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to reveal the invisible structure</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={reveal}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: revealed >= REVEAL_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.97, t * 2) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Visible galaxies (the 5%) — always present */}
                {[
                  { x: 30, y: 25, r: 3 }, { x: 170, y: 30, r: 4 },
                  { x: 50, y: 110, r: 3.5 }, { x: 160, y: 115, r: 3 },
                  { x: 100, y: 70, r: 5 }, { x: 80, y: 45, r: 2 },
                  { x: 140, y: 95, r: 2.5 },
                ].map((g, i) => (
                  <g key={i}>
                    <circle cx={g.x} cy={g.y} r={g.r}
                      fill={themeColor(TH.primaryHSL, 0.03 + t * 0.01, 14 + (i % 4))} />
                    <circle cx={g.x} cy={g.y} r={g.r * 0.4}
                      fill={themeColor(TH.accentHSL, 0.04 + t * 0.02, 18)} />
                  </g>
                ))}

                {/* Dark matter filaments — revealed step by step */}
                {FILAMENTS.slice(0, revealed).map((fil, i) => (
                  <motion.g key={`fil-${i}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}>
                    {/* Filament line (thick, ghostly) */}
                    <motion.line x1={fil.x1} y1={fil.y1} x2={fil.x2} y2={fil.y2}
                      stroke={themeColor(TH.accentHSL, 0.03 + i * 0.005, 15)}
                      strokeWidth={2 + i * 0.3}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                    {/* Halo around filament */}
                    <line x1={fil.x1} y1={fil.y1} x2={fil.x2} y2={fil.y2}
                      stroke={themeColor(TH.accentHSL, 0.01, 10)}
                      strokeWidth={6 + i}
                      strokeLinecap="round" />
                    {/* Node at midpoint */}
                    <circle cx={(fil.x1 + fil.x2) / 2} cy={(fil.y1 + fil.y2) / 2} r={2 + i * 0.3}
                      fill={themeColor(TH.accentHSL, 0.04, 15)} />
                    {/* Label */}
                    <text x={(fil.x1 + fil.x2) / 2} y={(fil.y1 + fil.y2) / 2 + 8}
                      textAnchor="middle" fontSize="2.8" fontFamily="monospace" fontStyle="italic"
                      fill={themeColor(TH.accentHSL, 0.04, 15)}>
                      {fil.label}
                    </text>
                  </motion.g>
                ))}

                {/* Full network glow */}
                {revealed >= REVEAL_STEPS && (
                  <motion.rect x="0" y="0" width="200" height="160"
                    fill={themeColor(TH.accentHSL, 0.015, 10)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.015 }}
                    transition={{ duration: 2 }}
                  />
                )}

                {/* 95% label */}
                <text x="100" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {t >= 1 ? 'THE INVISIBLE HOLDS. 95% revealed' : `dark matter: ${revealed}/${REVEAL_STEPS} structures`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {revealed === 0 ? 'Empty space. A few scattered galaxies. 5% of reality.' : revealed < REVEAL_STEPS ? `"${FILAMENTS[revealed - 1].label}", another invisible thread revealed.` : 'The full web. 95% was always there. Holding everything together.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: REVEAL_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < revealed ? themeColor(TH.accentHSL, 0.5, 18) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five taps. The empty space filled with invisible structure: gravitational filaments, dark web connections, silent support scaffolding. It was always there. 95% of the universe is invisible. Just because you cannot measure it does not mean it is not holding you together. Trust the invisible support. It is stronger than what you can see.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Implicit trust. Relying on subconscious processing and invisible social support networks. The scaffolding that holds your life together is mostly invisible, and that is exactly what makes it strong.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Empty. Tap. Scaffolding.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}