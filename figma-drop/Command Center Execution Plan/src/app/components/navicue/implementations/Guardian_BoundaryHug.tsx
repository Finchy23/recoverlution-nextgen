/**
 * GUARDIAN #6 — The Boundary Hug
 * "A boundary is not a wall. It is a container."
 * INTERACTION: A glowing fence — 5 posts, each dim. Each tap
 * lights one post — warm gold. The fence is firm but the glow
 * is soft. At full illumination: the boundary radiates warmth
 * inward. Containment achieved.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const POST_COUNT = 5;
const POSTS = [
  { x: 35, h: 55 },
  { x: 70, h: 60 },
  { x: 110, h: 62 },
  { x: 150, h: 60 },
  { x: 185, h: 55 },
];

export default function Guardian_BoundaryHug({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lit, setLit] = useState(0);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };
  const svgId = useId();

  useEffect(() => {
    safeTimeout(() => setStage('present'), 1200);
    safeTimeout(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const light = () => {
    if (stage !== 'active' || lit >= POST_COUNT) return;
    const next = lit + 1;
    setLit(next);
    if (next >= POST_COUNT) {
      safeTimeout(() => { setStage('resonant'); safeTimeout(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = lit / POST_COUNT;
  const full = t >= 1;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A line in the earth...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>A boundary is not a wall. It is a container. I love you too much to let you do that. Hold the line with love.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to light each post</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={light}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: lit >= POST_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(30, ${4 + t * 5}%, ${6 + t * 3}%, 0.85)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Ground line */}
                <line x1="15" y1="130" x2="205" y2="130"
                  stroke={`hsla(30, 6%, 18%, ${0.04 + t * 0.02})`} strokeWidth="0.4" />

                {/* Fence posts + rails */}
                {POSTS.map((p, i) => {
                  const isLit = i < lit;
                  const postTop = 130 - p.h;
                  return (
                    <g key={i}>
                      {/* Post */}
                      <motion.rect x={p.x - 2} y={postTop} width="4" height={p.h} rx="1"
                        fill={isLit
                          ? `hsla(42, ${18 + i * 2}%, ${35 + i * 3}%, ${0.08 + i * 0.01})`
                          : `hsla(30, 6%, 15%, ${0.04})`
                        }
                        animate={{ fill: isLit
                          ? `hsla(42, ${18 + i * 2}%, ${35 + i * 3}%, ${0.08 + i * 0.01})`
                          : `hsla(30, 6%, 15%, 0.04)`
                        }}
                        transition={{ duration: 0.8 }}
                      />
                      {/* Post cap — glows when lit */}
                      <motion.circle cx={p.x} cy={postTop - 2} r="3"
                        fill={isLit
                          ? `hsla(42, ${20 + i * 2}%, ${40 + i * 3}%, ${0.1 + i * 0.01})`
                          : 'hsla(30, 4%, 14%, 0.03)'
                        }
                        animate={{ fill: isLit
                          ? `hsla(42, ${20 + i * 2}%, ${40 + i * 3}%, ${0.1 + i * 0.01})`
                          : 'hsla(30, 4%, 14%, 0.03)'
                        }}
                        transition={{ duration: 0.8 }}
                      />
                      {/* Glow halo */}
                      {isLit && (
                        <motion.circle cx={p.x} cy={postTop - 2} r="10"
                          fill={`hsla(42, ${15 + i * 2}%, ${38 + i * 2}%, ${0.04 + i * 0.005})`}
                          initial={{ opacity: 0, r: 5 }} animate={{ opacity: 0.05, r: 10 }}
                          transition={{ duration: 1 }}
                        />
                      )}
                    </g>
                  );
                })}

                {/* Rails between posts */}
                {POSTS.slice(0, -1).map((p, i) => {
                  const next = POSTS[i + 1];
                  const y1Top = 130 - p.h + 15;
                  const y2Top = 130 - next.h + 15;
                  const y1Mid = 130 - p.h + 30;
                  const y2Mid = 130 - next.h + 30;
                  const isLit = i < lit && (i + 1) < lit;
                  return (
                    <g key={`rail-${i}`}>
                      <line x1={p.x} y1={y1Top} x2={next.x} y2={y2Top}
                        stroke={isLit
                          ? `hsla(42, 14%, 35%, 0.07)`
                          : 'hsla(30, 5%, 16%, 0.03)'}
                        strokeWidth="0.6" />
                      <line x1={p.x} y1={y1Mid} x2={next.x} y2={y2Mid}
                        stroke={isLit
                          ? `hsla(42, 12%, 33%, 0.06)`
                          : 'hsla(30, 5%, 16%, 0.025)'}
                        strokeWidth="0.6" />
                    </g>
                  );
                })}

                {/* Inner warmth — radiates inward when full */}
                {full && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ duration: 2.5 }}>
                    <defs>
                      <radialGradient id={`${svgId}-boundaryWarmth`} cx="50%" cy="60%">
                        <stop offset="0%" stopColor="hsla(42, 20%, 45%, 0.06)" />
                        <stop offset="70%" stopColor="transparent" />
                      </radialGradient>
                    </defs>
                    <rect x="35" y="65" width="150" height="65" rx="4" fill={`url(#${svgId}-boundaryWarmth)`} />
                  </motion.g>
                )}

                {/* Heart in center — protected by the boundary */}
                <motion.g opacity={0.03 + t * 0.05}>
                  <text x="110" y="105" textAnchor="middle" fontSize="10"
                    fill={`hsla(340, ${10 + t * 10}%, ${30 + t * 12}%, ${0.04 + t * 0.04})`}>
                    ♡
                  </text>
                </motion.g>

                {/* Label */}
                <text x="110" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${full ? 42 : 30}, ${8 + t * 8}%, ${25 + t * 10}%, ${0.06 + t * 0.04})`}>
                  {full ? 'contained. with love.' : `${lit}/${POST_COUNT} posts lit`}
                </text>
              </svg>
            </div>
            <motion.div key={lit} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {lit === 0 ? 'Five posts in the dark. A fence, unlit.' : lit < POST_COUNT ? `Post ${lit} glowing warm. Firm but soft.` : 'All posts lit. Warmth radiates inward. The boundary holds.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: POST_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < lit ? 'hsla(42, 20%, 48%, 0.5)' : palette.primaryFaint, opacity: i < lit ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five posts lit with warm gold. Not a wall. A container. Firm enough to hold. Soft enough to love. The boundary did not shut out. It held in. The heart inside was safe to feel everything.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Containment. Providing a sturdy psychological container allows the child, or the inner child, to feel big emotions without fear of destroying the relationship. Hold the line with love.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Fence. Glow. Held.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}