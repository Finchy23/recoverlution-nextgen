/**
 * ORACLE #1 — The Pattern Before the Pattern
 * "The amateur sees events. The expert sees the invisible thread between them."
 * ARCHETYPE: Pattern A (Tap × 5) — A noise field. Each tap reveals one hidden
 * connecting line. At 5: a constellation emerges from chaos. Thin-slicing.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ORACLE_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = ORACLE_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const REVEAL_STEPS = 5;

function sr(seed: number) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }

export default function Oracle_PatternBeforePattern({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [revealed, setRevealed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const nodes = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    x: 30 + sr(i * 11 + 1) * 160,
    y: 25 + sr(i * 11 + 2) * 100,
  })), []);

  const connections = useMemo(() => [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  ], []);

  const noise = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    x: sr(i * 3 + 7) * 220, y: sr(i * 3 + 8) * 140,
    w: 1 + sr(i * 3 + 9) * 4, h: 0.5 + sr(i * 3 + 10) * 2,
    a: sr(i * 3 + 11) * 360,
  })), []);

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
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Noise. Or is it?
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The amateur sees events. The expert sees the invisible thread between them. Look again. The pattern was always there.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to reveal each hidden connection</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={reveal}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: revealed >= REVEAL_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Noise — fades as pattern emerges */}
                {noise.map((n, i) => (
                  <rect key={i} x={n.x} y={n.y} width={n.w} height={n.h} rx="0.3"
                    fill={themeColor(TH.primaryHSL, 0.025 * (1 - t * 0.6), 6)}
                    transform={`rotate(${n.a}, ${n.x}, ${n.y})`} />
                ))}

                {/* Constellation nodes */}
                {nodes.map((node, i) => (
                  <motion.circle key={i} cx={node.x} cy={node.y}
                    r={i <= revealed ? 3 + t * 1.5 : 1.5}
                    fill={i <= revealed
                      ? themeColor(TH.accentHSL, 0.1 + t * 0.06, 15)
                      : themeColor(TH.primaryHSL, 0.03, 8)
                    }
                    animate={{ r: i <= revealed ? 3 + t * 1.5 : 1.5 }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                ))}

                {/* Connection lines — revealed one at a time */}
                {connections.slice(0, revealed).map(([a, b], i) => (
                  <motion.line key={`c-${i}`}
                    x1={nodes[a].x} y1={nodes[a].y}
                    x2={nodes[b].x} y2={nodes[b].y}
                    stroke={themeColor(TH.accentHSL, 0.08 + i * 0.015, 12 + i * 2)}
                    strokeWidth={0.5 + i * 0.1}
                    strokeDasharray="2 1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: safeOpacity(0.08 + i * 0.015) }}
                    transition={{ duration: 0.8 }}
                  />
                ))}

                {/* Full constellation glow */}
                {t >= 1 && (
                  <motion.polygon
                    points={nodes.slice(0, 6).map(n => `${n.x},${n.y}`).join(' ')}
                    fill={themeColor(TH.accentHSL, 0.02, 10)}
                    stroke={themeColor(TH.accentHSL, 0.04, 15)}
                    strokeWidth="0.3"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="110" y="144" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'CONSTELLATION. it was always there' : `threads revealed: ${revealed}/${REVEAL_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {revealed === 0 ? 'Noise. Random dots. Or are they?' : revealed < REVEAL_STEPS ? `Thread ${revealed}. The constellation is forming.` : 'All threads visible. The pattern was always there.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: REVEAL_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < revealed ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five taps. Five invisible threads revealed. Random dots became nodes. Noise became constellation. The pattern was always there, hidden in plain sight. The amateur sees events. The expert sees the thread between them. Train your eyes.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Thin-slicing. Expert pattern recognition operates on unconscious statistical models built from thousands of prior observations. The pattern is always there before you see it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Noise. Thread. Constellation.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}