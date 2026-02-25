/**
 * INFINITE PLAYER #9 — The Laugh Track
 * "Pop the ego. It is just hot air. Take yourself lightly."
 * INTERACTION: A balloon inflating. Each tap inflates more — 5 taps.
 * The balloon stretches, changes color, gets wobblier. At tap 5:
 * POP! Confetti explodes everywhere. Ego-deflation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const INFLATE_STEPS = 5;

// Confetti particles
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  x: 100 + (Math.random() - 0.5) * 160,
  y: 60 + (Math.random() - 0.5) * 100,
  endX: 100 + (Math.random() - 0.5) * 200,
  endY: -20 + Math.random() * 180,
  rot: Math.random() * 360,
  hue: Math.floor(Math.random() * 360),
  w: 2 + Math.random() * 4,
  h: 1.5 + Math.random() * 2,
  delay: Math.random() * 0.3,
}));

export default function Infinite_LaughTrack({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [inflated, setInflated] = useState(0);
  const [popped, setPopped] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const inflate = () => {
    if (stage !== 'active' || inflated >= INFLATE_STEPS || popped) return;
    const next = inflated + 1;
    setInflated(next);
    if (next >= INFLATE_STEPS) {
      addTimer(() => {
        setPopped(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
      }, 800);
    }
  };

  const t = inflated / INFLATE_STEPS;
  const rx = 20 + t * 30; // 20→50
  const ry = 25 + t * 35; // 25→60
  const wobble = t * 3;
  const hue = 0 + t * 280; // red→purple as it stretches

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something is inflating...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Pop the ego. It is just hot air. Take yourself lightly.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to inflate the balloon</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={inflate}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: inflated >= INFLATE_STEPS || popped ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(${hue}, ${3 + t * 4}%, ${4 + t * 3}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Balloon — before pop */}
                {!popped && (
                  <motion.g
                    animate={{ rotate: wobble > 0 ? [0, -wobble, wobble, -wobble * 0.5, 0] : 0 }}
                    transition={{ duration: 0.6, repeat: t >= 0.8 ? Infinity : 0 }}
                    style={{ transformOrigin: '100px 70px' }}>
                    {/* Balloon body */}
                    <motion.ellipse cx="100" cy={70 - t * 8} rx={rx} ry={ry}
                      fill={`hsla(${hue}, ${15 + t * 15}%, ${22 + t * 10}%, ${0.06 + t * 0.06})`}
                      stroke={`hsla(${hue}, ${12 + t * 12}%, ${25 + t * 12}%, ${0.05 + t * 0.05})`}
                      strokeWidth={0.4 + t * 0.3}
                      animate={{ rx, ry, cy: 70 - t * 8 }}
                      transition={{ type: 'spring', stiffness: 80 }}
                    />
                    {/* Highlight */}
                    <ellipse cx={85 - t * 5} cy={55 - t * 6} rx={rx * 0.25} ry={ry * 0.2}
                      fill={`hsla(${hue}, ${18 + t * 10}%, ${35 + t * 12}%, ${0.03 + t * 0.02})`} />
                    {/* Knot */}
                    <polygon points={`${100 - 3},${70 - t * 8 + ry} ${100 + 3},${70 - t * 8 + ry} ${100},${70 - t * 8 + ry + 5}`}
                      fill={`hsla(${hue}, ${12 + t * 10}%, ${22 + t * 8}%, ${0.06 + t * 0.04})`} />
                    {/* String */}
                    <line x1="100" y1={70 - t * 8 + ry + 5} x2="100" y2="145"
                      stroke={`hsla(0, 0%, 22%, 0.04)`} strokeWidth="0.3" />
                    {/* "EGO" on balloon */}
                    <text x="100" y={73 - t * 8} textAnchor="middle"
                      fontSize={5 + t * 3} fontFamily="monospace" fontWeight="bold"
                      fill={`hsla(${hue}, ${10 + t * 8}%, ${30 + t * 10}%, ${0.06 + t * 0.04})`}>
                      EGO
                    </text>
                  </motion.g>
                )}

                {/* POP — confetti explosion */}
                {popped && (
                  <>
                    {/* POP text */}
                    <motion.text x="100" y="70" textAnchor="middle" fontSize="18"
                      fontFamily="Impact, sans-serif" fontWeight="bold"
                      fill="hsla(45, 25%, 45%, 0.2)"
                      initial={{ scale: 3, opacity: 0.3 }} animate={{ scale: 1, opacity: 0.15 }}
                      transition={{ duration: 0.3 }}>
                      POP!
                    </motion.text>

                    {/* Confetti */}
                    {CONFETTI.map((c, i) => (
                      <motion.rect key={i}
                        x={100} y={60}
                        width={c.w} height={c.h} rx="0.5"
                        fill={`hsla(${c.hue}, ${20 + i % 10}%, ${35 + i % 15}%, ${0.08 + (i % 5) * 0.02})`}
                        initial={{ x: 100, y: 60, rotate: 0, opacity: 0.12 }}
                        animate={{ x: c.endX, y: c.endY, rotate: c.rot, opacity: 0 }}
                        transition={{ duration: 2.5, delay: c.delay, ease: 'easeOut' }}
                      />
                    ))}

                    {/* Deflated string */}
                    <motion.line x1="100" y1="80" x2="100" y2="145"
                      stroke="hsla(0, 0%, 22%, 0.03)" strokeWidth="0.3"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    />
                  </>
                )}

                {/* Pressure gauge */}
                {!popped && (
                  <text x="15" y="150" fontSize="3.5" fontFamily="monospace"
                    fill={`hsla(${hue}, ${6 + t * 8}%, ${20 + t * 8}%, ${0.04 + t * 0.03})`}>
                    pressure: {Math.round(t * 100)}%
                  </text>
                )}
              </svg>
            </div>
            <motion.div key={`${inflated}-${popped}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {inflated === 0 ? 'A small balloon. "EGO" written on it.' : !popped ? `Inflate ${inflated}. Stretching. Wobbling. ${inflated >= 4 ? 'About to...' : ''}` : 'POP! Confetti everywhere. The ego was just hot air.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: INFLATE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < inflated ? `hsla(${i * 55}, 20%, 45%, 0.5)` : palette.primaryFaint, opacity: i < inflated ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five inflations. The balloon grew, wobbling, stretching, changing color. "EGO" written across it. Then: POP! Confetti everywhere. The ego was just hot air. Take yourself lightly.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Ego-deflation. Reducing self-importance lowers the stakes of daily interactions, significantly reducing social anxiety. Pop.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Balloon. Inflate. Pop!
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}