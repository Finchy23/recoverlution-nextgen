/**
 * LOOP BREAKER #7 — The Spiral Check
 * "It looks like a circle. But are you higher or lower than last time?"
 * ARCHETYPE: Pattern A (Tap) — Tap to reveal each floor of the spiral
 * ENTRY: Reverse Reveal — "You're higher" → then the spiral reveals
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function LoopBreaker_SpiralCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const [floors, setFloors] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tap = () => {
    if (stage !== 'active' || floors >= 3) return;
    const n = floors + 1;
    setFloors(n);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, fontSize: '16px' }}>
              You{'\u2019'}re higher.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>
              it only looks like a circle
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={tap}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: floors >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              It looks like a circle. You{'\u2019'}re back in the same place. But look closer. It{'\u2019'}s a spiral staircase. Are you higher or lower than the last loop? Tap to check each floor.
            </div>
            <svg width="160" height="180" viewBox="0 0 160 180">
              {[0, 1, 2].map(i => {
                const y = 150 - i * 50;
                const visible = i < floors;
                return (
                  <motion.g key={i}>
                    <motion.ellipse cx="80" cy={y} rx="50" ry="12"
                      fill="none" stroke={themeColor(TH.accentHSL, visible ? 0.15 : 0.04, 5 + i * 3)}
                      strokeWidth={visible ? 1.5 : 0.5} />
                    {visible && (
                      <motion.text x="80" y={y + 4} fontSize="11" fontFamily="monospace" textAnchor="middle"
                        fill={palette.textFaint} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
                        floor {i + 1}
                      </motion.text>
                    )}
                    {/* Connecting arc */}
                    {visible && i > 0 && (
                      <motion.line x1="130" y1={y + 50} x2="130" y2={y + 12}
                        stroke={themeColor(TH.accentHSL, 0.08, 8)} strokeWidth="0.5" strokeDasharray="3 2"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                    )}
                  </motion.g>
                );
              })}
              {/* You-are-here dot */}
              <motion.circle cx="80" cy={150 - floors * 50} r="4"
                fill={themeColor(TH.accentHSL, 0.3, 10)}
                animate={{ y: 150 - floors * 50 }} />
            </svg>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} style={{ width: '24px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < floors ? themeColor(TH.accentHSL, 0.4, 10) : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
            {floors < 3 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>check the floor</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Three floors up. You are not in the same place. You have more data, more scar tissue, more skill. The same dragon keeps appearing because you keep leveling up enough to face it again. It is a spiral, not a circle.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ascending.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}