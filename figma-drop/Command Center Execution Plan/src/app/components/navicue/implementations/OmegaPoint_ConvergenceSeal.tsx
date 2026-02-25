/**
 * OMEGA POINT #10 — The Convergence Seal (The Proof)
 * "Many paths. One destination. You have arrived."
 * INTERACTION: Many threads float — each a different color, a different
 * angle. Each tap twists them tighter. They braid into one
 * unbreakable rope. Coherence. Integrity. Integration complete.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TWIST_STEPS = 5;
const THREADS = [
  { hue: 0, label: 'feeling' },
  { hue: 45, label: 'thinking' },
  { hue: 120, label: 'acting' },
  { hue: 200, label: 'relating' },
  { hue: 270, label: 'becoming' },
  { hue: 330, label: 'being' },
];

export default function OmegaPoint_ConvergenceSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [twisted, setTwisted] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const twist = () => {
    if (stage !== 'active' || twisted >= TWIST_STEPS) return;
    const next = twisted + 1;
    setTwisted(next);
    if (next >= TWIST_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = twisted / TWIST_STEPS;
  // Thread spread: starts wide, converges to tight braid
  const spread = (1 - t) * 30;
  const twistFreq = t * 3; // how many twists visible

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Many threads drift...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Many paths. One destination. You have arrived.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to twist the threads</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={twist}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: twisted >= TWIST_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(260, 10%, 7%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Threads — each a sinusoidal path from top to bottom */}
                {THREADS.map((thread, i) => {
                  const offset = (i - (THREADS.length - 1) / 2) * (spread / THREADS.length * 2);
                  const pts: string[] = [];
                  for (let y = 10; y <= 170; y += 2) {
                    const progress = (y - 10) / 160;
                    const xBase = 100 + offset * (1 - progress * t);
                    const twist_x = Math.sin(progress * Math.PI * 2 * twistFreq + (i / THREADS.length) * Math.PI * 2) * spread * (1 - t * 0.7);
                    pts.push(`${xBase + twist_x},${y}`);
                  }
                  return (
                    <motion.polyline key={i}
                      points={pts.join(' ')}
                      fill="none"
                      stroke={`hsla(${thread.hue}, ${30 + t * 15}%, ${40 + t * 10}%, ${0.2 + t * 0.15})`}
                      strokeWidth={1 + t * 0.5}
                      strokeLinecap="round"
                    />
                  );
                })}
                {/* Rope glow when fully twisted */}
                {t >= 1 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: 2 }}>
                    <line x1="100" y1="10" x2="100" y2="170"
                      stroke="hsla(45, 40%, 55%, 0.15)" strokeWidth="4" strokeLinecap="round" />
                    <line x1="100" y1="10" x2="100" y2="170"
                      stroke="hsla(45, 45%, 60%, 0.08)" strokeWidth="8" strokeLinecap="round" />
                  </motion.g>
                )}
                {/* Thread labels — at bottom, fading */}
                {t < 0.6 && THREADS.map((thread, i) => (
                  <text key={`l${i}`} x={100 + (i - 2.5) * 22} y="175" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(${thread.hue}, 20%, 45%, ${0.15 * (1 - t)})`}>
                    {thread.label}
                  </text>
                ))}
                {/* "ONE" label */}
                {t >= 1 && (
                  <motion.text x="100" y="175" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(45, 35%, 55%, 0.3)" fontWeight="500"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                    transition={{ delay: 0.8, duration: 1.5 }}>
                    ONE
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={twisted} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: twisted >= TWIST_STEPS ? 'normal' : 'italic', fontWeight: twisted >= TWIST_STEPS ? 500 : 400 }}>
                {twisted === 0 ? 'Six threads. Drifting apart.' : twisted < TWIST_STEPS ? `Twisting... ${Math.floor(t * 100)}% braided.` : 'One rope. Unbreakable.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: TWIST_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < twisted ? `hsla(${45 + i * 40}, 35%, 50%, 0.5)` : palette.primaryFaint, opacity: i < twisted ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Many threads. One rope. Feeling, thinking, acting, relating, becoming, being: all one. You have arrived.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Coherence. Thought, feeling, and action aligned. Integrity. Inter-grating. The convergence is complete.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Many. One. Arrived.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}