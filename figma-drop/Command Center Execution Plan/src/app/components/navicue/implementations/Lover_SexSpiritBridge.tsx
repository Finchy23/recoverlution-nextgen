/**
 * LOVER #8 — The Sex/Spirit Bridge
 * "Lovers don't finally meet somewhere. They're in each other all along."
 * INTERACTION: Two electric currents arc from opposite edges. Each tap
 * extends the arcs further. At connection: a bright fusion point at
 * center. Not friction. Fusion. Self-expansion.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ARC_STEPS = 5;

export default function Lover_SexSpiritBridge({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [arcs, setArcs] = useState(0);
  const [sparkPhase, setSparkPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setSparkPhase(p => p + 0.06); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const extend = () => {
    if (stage !== 'active' || arcs >= ARC_STEPS) return;
    const next = arcs + 1;
    setArcs(next);
    if (next >= ARC_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = arcs / ARC_STEPS;
  const fused = t >= 1;
  // Arc endpoints: left arc reaches from x=15 toward center, right from x=185
  const leftEnd = 15 + t * 80;   // 15 → 95
  const rightEnd = 185 - t * 80; // 185 → 105

  // Arc path with jagged electric segments
  const buildArc = (startX: number, endX: number, yBase: number, seed: number) => {
    const segments = 12;
    const points: string[] = [`${startX},${yBase}`];
    const dx = (endX - startX) / segments;
    for (let i = 1; i < segments; i++) {
      const x = startX + dx * i;
      const jag = Math.sin(sparkPhase * 3 + i * seed * 0.7) * (6 + t * 4);
      points.push(`${x},${yBase + jag}`);
    }
    points.push(`${endX},${yBase}`);
    return `M ${points.join(' L ')}`;
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two currents stir...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>It is not friction. It is fusion. Lovers don't finally meet somewhere. They're in each other all along.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to extend the arc</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={extend}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: arcs >= ARC_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(280, ${8 + t * 8}%, ${7 + t * 3}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Left arc — rose/crimson */}
                {t > 0 && (
                  <path d={buildArc(15, leftEnd, 80, 1)}
                    fill="none"
                    stroke={`hsla(350, ${25 + t * 15}%, ${40 + t * 12}%, ${0.12 + t * 0.12})`}
                    strokeWidth={0.8 + t * 0.5} strokeLinecap="round" />
                )}
                {/* Right arc — amber/gold */}
                {t > 0 && (
                  <path d={buildArc(185, rightEnd, 80, 2.3)}
                    fill="none"
                    stroke={`hsla(30, ${25 + t * 15}%, ${40 + t * 12}%, ${0.12 + t * 0.12})`}
                    strokeWidth={0.8 + t * 0.5} strokeLinecap="round" />
                )}

                {/* Source nodes */}
                <circle cx="15" cy="80" r={3 + t * 1.5}
                  fill={`hsla(350, 25%, 45%, ${0.1 + t * 0.08})`} />
                <circle cx="185" cy="80" r={3 + t * 1.5}
                  fill={`hsla(30, 25%, 48%, ${0.1 + t * 0.08})`} />

                {/* Spark particles along arcs */}
                {t > 0.3 && Array.from({ length: Math.floor(t * 8) }, (_, i) => {
                  const prog = ((sparkPhase * 0.5 + i * 0.4) % 1);
                  const isLeft = i % 2 === 0;
                  const sx = isLeft ? 15 : 185;
                  const ex = isLeft ? leftEnd : rightEnd;
                  const x = sx + (ex - sx) * prog;
                  const y = 80 + Math.sin(sparkPhase * 3 + i * 1.3) * (4 + t * 3);
                  return (
                    <circle key={i} cx={x} cy={y} r={0.6 + Math.abs(Math.sin(sparkPhase + i)) * 0.4}
                      fill={`hsla(${isLeft ? 350 : 30}, 30%, 55%, ${0.08 * Math.abs(Math.sin(sparkPhase * 2 + i))})`} />
                  );
                })}

                {/* Fusion point — at connection */}
                {fused && (
                  <motion.g initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, type: 'spring' }}
                    style={{ transformOrigin: '100px 80px' }}>
                    <circle cx="100" cy="80" r="8"
                      fill="hsla(310, 30%, 50%, 0.08)" />
                    <circle cx="100" cy="80" r="4"
                      fill="hsla(310, 35%, 55%, 0.12)" />
                    <circle cx="100" cy="80" r="1.5"
                      fill="hsla(310, 40%, 60%, 0.2)" />
                    {/* Fusion rays */}
                    {Array.from({ length: 6 }, (_, i) => {
                      const a = (i / 6) * Math.PI * 2 + sparkPhase * 0.3;
                      return (
                        <line key={i} x1={100 + Math.cos(a) * 10} y1={80 + Math.sin(a) * 10}
                          x2={100 + Math.cos(a) * (16 + Math.sin(sparkPhase + i) * 3)}
                          y2={80 + Math.sin(a) * (16 + Math.sin(sparkPhase + i) * 3)}
                          stroke={`hsla(310, 25%, 50%, ${0.06 + Math.abs(Math.sin(sparkPhase + i)) * 0.04})`}
                          strokeWidth="0.4" strokeLinecap="round" />
                      );
                    })}
                  </motion.g>
                )}

                {/* Label */}
                {fused && (
                  <motion.text x="100" y="145" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(310, 20%, 50%, 0.2)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.5, duration: 1.5 }}>
                    FUSION
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={arcs} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {arcs === 0 ? 'Two currents. Separate edges.' : arcs < ARC_STEPS ? `Arcing closer... gap closing.` : 'Connected. Fusion. Not friction.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ARC_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < arcs ? 'hsla(310, 25%, 50%, 0.5)' : palette.primaryFaint,
                  opacity: i < arcs ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Two currents. One fusion. Not friction, but union. Lovers don't finally meet. They're in each other all along.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Self-expansion theory. Intimacy lets you include the other in the self. Cognitive resources expand. Identity grows. The arc was always reaching.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Arc. Arc. Fusion.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}