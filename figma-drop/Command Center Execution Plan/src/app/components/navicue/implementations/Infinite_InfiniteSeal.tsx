/**
 * INFINITE PLAYER #10 — The Infinite Seal (The Master Proof)
 * "You have won. Not because you finished, but because you are playing."
 * INTERACTION: An infinity symbol (∞) at center. You trace it continuously.
 * Each loop changes its color — 5 loops. "The game never ends. Keep playing."
 * Infinite Game Theory.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LOOP_STEPS = 5;
const LOOP_HUES = [0, 60, 140, 220, 300]; // red→yellow→green→blue→magenta

export default function Infinite_InfiniteSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [loops, setLoops] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const loop = () => {
    if (stage !== 'active' || loops >= LOOP_STEPS) return;
    const next = loops + 1;
    setLoops(next);
    if (next >= LOOP_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = loops / LOOP_STEPS;
  const hue = loops > 0 ? LOOP_HUES[loops - 1] : 0;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The game continues...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>The game never ends. Keep playing. You have won, not because you finished, but because you are playing.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to trace each loop; color shifts with every cycle</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={loop}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: loops >= LOOP_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(${hue}, ${3 + t * 4}%, ${4 + t * 3}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Ghost trails of previous loops */}
                {Array.from({ length: loops }, (_, i) => (
                  <motion.path key={`trail-${i}`}
                    d="M 55,70 C 55,40 85,40 110,70 C 135,100 165,100 165,70 C 165,40 135,40 110,70 C 85,100 55,100 55,70"
                    fill="none"
                    stroke={`hsla(${LOOP_HUES[i]}, ${15 + i * 3}%, ${30 + i * 5}%, ${0.03 + i * 0.008})`}
                    strokeWidth={0.4 + i * 0.08}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.12 + i * 0.01 }}
                    transition={{ duration: 1.5, delay: 0.1 }}
                  />
                ))}

                {/* Current infinity symbol */}
                <motion.path
                  d="M 55,70 C 55,40 85,40 110,70 C 135,100 165,100 165,70 C 165,40 135,40 110,70 C 85,100 55,100 55,70"
                  fill="none"
                  stroke={`hsla(${hue}, ${15 + t * 18}%, ${28 + t * 18}%, ${0.08 + t * 0.08})`}
                  strokeWidth={0.6 + t * 0.5}
                  strokeLinecap="round"
                  key={loops}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />

                {/* Center crossing point glow */}
                <motion.circle cx="110" cy="70" r={3 + t * 5}
                  fill={`hsla(${hue}, ${12 + t * 12}%, ${22 + t * 12}%, ${0.03 + t * 0.03})`}
                  initial={{ r: 3 }}
                  animate={{ r: 3 + t * 5 }}
                />

                {/* Radiant glow at full loops */}
                {t >= 1 && (
                  <motion.ellipse cx="110" cy="70" rx="65" ry="35"
                    fill={`hsla(${hue}, 15%, 30%, 0.03)`}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    transition={{ duration: 2 }}
                  />
                )}

                {/* ∞ symbol overlay at completion */}
                {t >= 1 && (
                  <motion.text x="110" y="78" textAnchor="middle" fontSize="18"
                    fontFamily="Georgia, serif"
                    fill={`hsla(${hue}, 18%, 45%, 0.15)`}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                    transition={{ delay: 0.5, duration: 2 }}>
                    ∞
                  </motion.text>
                )}

                <text x="110" y="130" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(${hue}, ${6 + t * 8}%, ${20 + t * 10}%, ${0.04 + t * 0.03})`}>
                  {t >= 1 ? 'infinite. keep playing.' : `loop ${loops}/${LOOP_STEPS}`}
                </text>
              </svg>
            </div>
            <motion.div key={loops} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {loops === 0 ? 'An infinity symbol. Waiting for the first loop.' : loops < LOOP_STEPS ? `Loop ${loops}. Color shifted to ${['red','gold','green','blue','violet'][loops - 1]}.` : 'Five loops. Five colors. The symbol glows. Keep playing.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: LOOP_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < loops ? `hsla(${LOOP_HUES[i]}, 22%, 48%, 0.5)` : palette.primaryFaint, opacity: i < loops ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Five loops. Red, gold, green, blue, violet: each cycle a different color, the same shape. The infinity symbol never closes. It never finishes. You have won. Not because you finished, but because you are playing. The game never ends. Keep going.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Infinite game theory. Shifting from finite games, playing to win, to infinite games, playing to continue the play, creates sustainable, lifelong motivation.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Loop. Color. ∞.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}