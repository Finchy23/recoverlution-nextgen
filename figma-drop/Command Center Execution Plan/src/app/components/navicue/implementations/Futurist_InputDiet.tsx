/**
 * FUTURIST #2 — The Input Diet
 * "Garbage in, anxiety out. Curate your feed like you curate your meal."
 * INTERACTION: Left plate — junk info icons. Right plate — quality icons.
 * Each tap moves one junk item off the left plate and replaces it with
 * a quality item on the right. 5 swaps. The left plate empties.
 * The right plate glows. Information diet curated.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SWAP_COUNT = 5;
const JUNK = ['clickbait', 'outrage', 'gossip', 'doom', 'noise'];
const QUALITY = ['depth', 'craft', 'silence', 'wonder', 'truth'];

export default function Futurist_InputDiet({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [swapped, setSwapped] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const swap = () => {
    if (stage !== 'active' || swapped >= SWAP_COUNT) return;
    const next = swapped + 1;
    setSwapped(next);
    if (next >= SWAP_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = swapped / SWAP_COUNT;
  const full = t >= 1;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            What did you eat today...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Garbage in, anxiety out. Curate your feed like you curate your meal. What information did you eat today?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to swap junk for substance</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={swap}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: swapped >= SWAP_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '260px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(200, ${4 + t * 5}%, ${5 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 260 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Left plate — JUNK */}
                <ellipse cx="75" cy="95" rx="50" ry="12"
                  fill="none" stroke={`hsla(0, ${10 + (1 - t) * 8}%, ${20 + (1 - t) * 6}%, ${0.06 + (1 - t) * 0.03})`}
                  strokeWidth="0.6" />
                <text x="75" y="30" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(0, ${8 + (1 - t) * 6}%, ${28 + (1 - t) * 8}%, ${0.06 + (1 - t) * 0.04})`}>
                  JUNK
                </text>
                {/* Junk items */}
                {JUNK.map((item, i) => {
                  const alive = i >= swapped;
                  const y = 55 + i * 11;
                  return (
                    <motion.g key={`j-${i}`}
                      initial={{ opacity: 0.5, x: 0 }}
                      animate={{ opacity: alive ? 0.5 : 0, x: alive ? 0 : -30 }}
                      transition={{ duration: 0.5 }}>
                      <rect x="42" y={y - 5} width="66" height="8" rx="2"
                        fill={`hsla(0, ${12 + i * 2}%, ${18 + i}%, ${alive ? 0.06 : 0})`} />
                      <text x="75" y={y + 1} textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                        fill={`hsla(0, ${10 + i * 3}%, ${30 + i * 2}%, ${alive ? 0.12 : 0})`}>
                        {item}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Arrow between plates */}
                <motion.g initial={{ opacity: 0.12 }} animate={{ opacity: 0.12 + t * 0.04 }}>
                  <line x1="128" y1="95" x2="138" y2="95"
                    stroke={`hsla(200, 10%, 30%, ${0.04 + t * 0.04})`} strokeWidth="0.5"
                    markerEnd="url(#arrowFuturist)" />
                  <defs>
                    <marker id="arrowFuturist" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                      <path d="M 0,0 L 4,2 L 0,4" fill={`hsla(200, 10%, 30%, ${0.06 + t * 0.04})`} />
                    </marker>
                  </defs>
                </motion.g>

                {/* Right plate — QUALITY */}
                <ellipse cx="190" cy="95" rx="50" ry="12"
                  fill="none" stroke={`hsla(160, ${8 + t * 12}%, ${20 + t * 10}%, ${0.04 + t * 0.05})`}
                  strokeWidth="0.6" />
                <text x="190" y="30" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(160, ${8 + t * 10}%, ${28 + t * 10}%, ${0.04 + t * 0.06})`}>
                  QUALITY
                </text>
                {/* Quality items */}
                {QUALITY.map((item, i) => {
                  const alive = i < swapped;
                  const y = 55 + i * 11;
                  return (
                    <motion.g key={`q-${i}`}
                      initial={{ opacity: 0.08, x: 0 }}
                      animate={{ opacity: alive ? 0.6 : 0.08, x: alive ? 0 : 15 }}
                      transition={{ duration: 0.5, delay: 0.1 }}>
                      <rect x="155" y={y - 5} width="70" height="8" rx="2"
                        fill={`hsla(160, ${10 + i * 2}%, ${18 + i * 2}%, ${alive ? 0.06 : 0.01})`} />
                      <text x="190" y={y + 1} textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                        fill={`hsla(160, ${10 + i * 3}%, ${30 + i * 3}%, ${alive ? 0.14 : 0.03})`}>
                        {item}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Full glow — right plate radiates */}
                {full && (
                  <motion.ellipse cx="190" cy="95" rx="55" ry="40"
                    fill="hsla(160, 15%, 35%, 0.04)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.04 }}
                    transition={{ duration: 2 }}
                  />
                )}

                {/* Status */}
                <text x="130" y="170" textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                  fill={`hsla(${full ? 160 : 200}, ${8 + t * 8}%, ${25 + t * 10}%, ${0.06 + t * 0.04})`}>
                  {full ? 'diet curated' : `swap ${swapped}/${SWAP_COUNT}`}
                </text>
              </svg>
            </div>
            <motion.div key={swapped} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {swapped === 0 ? 'Two plates. One is junk. One waits to be filled.' : swapped < SWAP_COUNT ? `"${JUNK[swapped - 1]}" removed. "${QUALITY[swapped - 1]}" added.` : 'All junk cleared. The quality plate glows. You are what you consume.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SWAP_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < swapped ? 'hsla(160, 18%, 45%, 0.5)' : palette.primaryFaint, opacity: i < swapped ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five swaps. Clickbait for depth. Outrage for craft. Gossip for silence. Doom for wonder. Noise for truth. The junk plate is empty. The quality plate radiates. You are what you consume.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Information processing theory. The brain has limited capacity. Low-quality inputs displace high-quality thought. Curate your feed like you curate your meal.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Junk. Swap. Nourished.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}