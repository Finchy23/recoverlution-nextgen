/**
 * ALCHEMIST II #7 -- The Regret Compost
 * "Your mistakes are nutrient-dense. Mulch them. Feed the future."
 * INTERACTION: Leaves appear, named with regrets. Each tap composts
 * them -- they decay, darken, crumble into rich soil. From the soil,
 * a green shoot emerges. Nothing is wasted.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LEAVES = [
  { label: 'should have', x: 40, y: 35, rot: -15 },
  { label: 'too late', x: 120, y: 25, rot: 10 },
  { label: 'wrong choice', x: 75, y: 55, rot: -5 },
  { label: 'wasted time', x: 160, y: 45, rot: 20 },
  { label: 'if only', x: 100, y: 70, rot: -10 },
];

export default function AlchemistII_RegretCompost({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [composted, setComposted] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const compost = (idx: number) => {
    if (stage !== 'active' || composted.includes(idx)) return;
    const next = [...composted, idx];
    setComposted(next);
    if (next.length >= LEAVES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const soilRichness = composted.length / LEAVES.length;
  const allDone = composted.length >= LEAVES.length;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Leaves falling...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your mistakes are nutrient-dense. Mulch them. Feed the future.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each leaf to compost it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(25, 10%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Ground soil -- richens as composting progresses */}
                <rect x="0" y="100" width="220" height="60"
                  fill={`hsla(${25 + soilRichness * 10}, ${8 + soilRichness * 12}%, ${10 + soilRichness * 6}%, ${0.4 + soilRichness * 0.2})`}
                />
                {/* Soil texture */}
                {soilRichness > 0 && Array.from({ length: Math.floor(soilRichness * 10) }, (_, i) => (
                  <circle key={`s${i}`}
                    cx={15 + i * 20 + Math.sin(i) * 5}
                    cy={110 + Math.cos(i * 2) * 8}
                    r={1 + soilRichness}
                    fill={`hsla(25, 15%, 18%, ${soilRichness * 0.2})`}
                  />
                ))}
                {/* Leaves */}
                {LEAVES.map((leaf, i) => {
                  const isDead = composted.includes(i);
                  return (
                    <g key={i} onClick={() => compost(i)} style={{ cursor: isDead ? 'default' : 'pointer' }}>
                      {isDead ? (
                        <motion.g
                          initial={{ y: 0, opacity: 0.5 }}
                          animate={{ y: 100 - leaf.y + 10, opacity: 0.08 }}
                          transition={{ duration: 1.5, ease: 'easeIn' }}>
                          <ellipse cx={leaf.x} cy={leaf.y} rx="14" ry="8"
                            fill="hsla(25, 15%, 15%, 0.3)"
                            transform={`rotate(${leaf.rot}, ${leaf.x}, ${leaf.y})`} />
                        </motion.g>
                      ) : (
                        <motion.g whileHover={{ scale: 1.1 }}>
                          <ellipse cx={leaf.x} cy={leaf.y} rx="18" ry="9"
                            fill="hsla(35, 30%, 30%, 0.3)"
                            transform={`rotate(${leaf.rot}, ${leaf.x}, ${leaf.y})`} />
                          <line x1={leaf.x - 8} y1={leaf.y} x2={leaf.x + 8} y2={leaf.y}
                            stroke="hsla(35, 20%, 25%, 0.15)" strokeWidth="0.5"
                            transform={`rotate(${leaf.rot}, ${leaf.x}, ${leaf.y})`} />
                          <text x={leaf.x} y={leaf.y + 3} textAnchor="middle"
                            fontSize="6" fontFamily="monospace"
                            fill="hsla(35, 20%, 45%, 0.3)"
                            transform={`rotate(${leaf.rot}, ${leaf.x}, ${leaf.y})`}>
                            {leaf.label}
                          </text>
                        </motion.g>
                      )}
                    </g>
                  );
                })}
                {/* Green shoot -- grows from rich soil */}
                {allDone && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 2 }}>
                    <motion.line x1="110" y1="102" x2="110" y2="70"
                      stroke="hsla(120, 35%, 40%, 0.4)" strokeWidth="1.5" strokeLinecap="round"
                      initial={{ y2: 102 }} animate={{ y2: 70 }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                    <motion.ellipse cx="104" cy="78" rx="5" ry="3"
                      fill="hsla(120, 35%, 35%, 0.3)"
                      transform="rotate(-30, 104, 78)"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                      transition={{ delay: 1 }}
                    />
                    <motion.ellipse cx="116" cy="74" rx="5" ry="3"
                      fill="hsla(120, 35%, 35%, 0.3)"
                      transform="rotate(30, 116, 74)"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                      transition={{ delay: 1.3 }}
                    />
                  </motion.g>
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>
              {composted.length}/{LEAVES.length} composted • nothing wasted
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Nothing was wasted. Every mistake became nutrient. The future feeds on the past.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Counterfactual thinking converted. Regret mulched into learning. Growth from decay.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Mulched. Composted. Growing.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}