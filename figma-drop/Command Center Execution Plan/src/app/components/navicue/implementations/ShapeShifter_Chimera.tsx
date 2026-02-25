/**
 * SHAPESHIFTER #7 — The Chimera
 * "You are the integration of opposites."
 * ARCHETYPE: Pattern A (Tap ×5) — Floating trait-word pairs that seem
 * contradictory. Each tap connects a pair, showing they coexist.
 * Dialectical Self — holding paradox.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PAIRS = [
  { a: 'gentle', b: 'fierce', ax: 35, ay: 40, bx: 185, by: 50 },
  { a: 'planned', b: 'spontaneous', ax: 30, ay: 80, bx: 175, by: 90 },
  { a: 'logical', b: 'intuitive', ax: 40, ay: 120, bx: 180, by: 125 },
  { a: 'serious', b: 'playful', ax: 35, ay: 155, bx: 185, by: 160 },
  { a: 'independent', b: 'devoted', ax: 25, ay: 190, bx: 175, by: 195 },
];

export default function ShapeShifter_Chimera({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const connect = () => {
    if (stage !== 'active' || taps >= PAIRS.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= PAIRS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = taps / PAIRS.length;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Opposites stir...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Gentle AND fierce. Planned AND spontaneous. These are not contradictions. They are your range. You are the chimera, the integration of opposites.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to connect each pair</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={connect}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= PAIRS.length ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '220px', height: '230px' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 230">
                {/* Central spine — the self */}
                <line x1="110" y1="25" x2="110" y2="210"
                  stroke={themeColor(TH.primaryHSL, 0.04, 5)} strokeWidth="0.5" />

                {PAIRS.map((pair, i) => {
                  const isConnected = i < taps;
                  const isCurrent = i === taps;
                  const alpha = isConnected ? 0.25 : isCurrent ? 0.12 : 0.06;
                  const lineAlpha = isConnected ? 0.08 : 0;

                  return (
                    <g key={i}>
                      {/* Connection line */}
                      {isConnected && (
                        <motion.line
                          x1={pair.ax + 30} y1={pair.ay} x2={pair.bx - 30} y2={pair.by}
                          stroke={themeColor(TH.accentHSL, lineAlpha, 12)}
                          strokeWidth="0.5"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6 }} />
                      )}

                      {/* Center merge dot */}
                      {isConnected && (
                        <motion.circle cx="110" cy={(pair.ay + pair.by) / 2} r="3"
                          fill={themeColor(TH.accentHSL, 0.1, 15)}
                          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.4 }} />
                      )}

                      {/* Left word */}
                      <text x={pair.ax} y={pair.ay} textAnchor="start"
                        fontSize="11" fontFamily="serif" fontStyle="italic"
                        fill={themeColor(TH.accentHSL, alpha, isConnected ? 18 : 8)}>
                        {pair.a}
                      </text>

                      {/* Right word */}
                      <text x={pair.bx} y={pair.by} textAnchor="end"
                        fontSize="11" fontFamily="serif" fontStyle="italic"
                        fill={themeColor(TH.accentHSL, alpha, isConnected ? 18 : 8)}>
                        {pair.b}
                      </text>

                      {/* "AND" label on connection */}
                      {isConnected && (
                        <motion.text x="110" y={(pair.ay + pair.by) / 2 - 6} textAnchor="middle"
                          fontSize="11" fontFamily="monospace" letterSpacing="0.15em"
                          fill={themeColor(TH.accentHSL, 0.15, 12)}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                          AND
                        </motion.text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {PAIRS.map((_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.2, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Five pairs of opposites. All true. All you. The chimera is not confused, it is complete. Hold the contradiction.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>dialectical self: both, not either</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Hold the contradiction.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}