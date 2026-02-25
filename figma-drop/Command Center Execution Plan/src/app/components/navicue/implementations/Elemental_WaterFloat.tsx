/**
 * ELEMENTAL #2 — The Water Float
 * "Let the water carry the weight. You don't have to hold yourself up."
 * INTERACTION: View from underwater looking up. Light refracts through
 * the surface. Gentle ripple animation. Hold still — the deeper you
 * sink into stillness, the more the light clarifies above.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Somatic Regulation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FLOAT_DURATION = 10000;

export default function Elemental_WaterFloat({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [floating, setFloating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Ambient ripple animation
  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => {
      setPhase(p => p + 0.02);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const startFloat = () => {
    if (floating || stage !== 'active') return;
    setFloating(true);
    startRef.current = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - startRef.current) / FLOAT_DURATION);
      setProgress(p);
      if (p >= 1) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const depth = floating ? progress : 0;
  const lightClarity = 0.08 + depth * 0.25;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Submerging...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Let the water carry the weight. You don't have to hold yourself up.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to float</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startFloat}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: floating ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Underwater view */}
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `linear-gradient(180deg, hsla(200, 40%, ${35 + depth * 15}%, ${0.3 + depth * 0.2}), hsla(210, 50%, 15%, 0.5))` }}>
              {/* Surface ripples — viewed from below */}
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Light rays from surface */}
                {[40, 80, 110, 150, 180].map((x, i) => (
                  <motion.line key={i}
                    x1={x + Math.sin(phase + i * 1.3) * 8}
                    y1="0"
                    x2={x + Math.sin(phase + i * 1.3) * 15 + (i % 2 ? 10 : -10)}
                    y2={80 + depth * 40}
                    stroke={`hsla(190, 40%, 70%, ${lightClarity * 0.5})`}
                    strokeWidth="1"
                    opacity={0.3 + depth * 0.3}
                  />
                ))}
                {/* Surface ripple lines */}
                {[0, 1, 2].map(i => (
                  <motion.path key={`r${i}`}
                    d={`M 0 ${10 + i * 8} Q ${55 + Math.sin(phase + i) * 15} ${5 + i * 8 + Math.cos(phase * 0.7 + i) * 4}, 110 ${10 + i * 8} Q ${165 + Math.sin(phase + i + 1) * 15} ${15 + i * 8 + Math.cos(phase * 0.7 + i + 1) * 4}, 220 ${10 + i * 8}`}
                    fill="none"
                    stroke={`hsla(195, 35%, 60%, ${0.08 + depth * 0.1})`}
                    strokeWidth="0.8"
                  />
                ))}
                {/* Bubbles */}
                {floating && [1, 2, 3, 4, 5].map(i => {
                  const bx = 80 + Math.sin(phase * 0.5 + i * 2) * 30;
                  const by = 160 - ((phase * 20 + i * 30) % 160);
                  return <circle key={`b${i}`} cx={bx} cy={by} r={1 + Math.random()} fill="hsla(190, 30%, 70%, 0.15)" />;
                })}
              </svg>
              {/* Refraction glow */}
              <motion.div
                animate={{ opacity: lightClarity }}
                style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '40%', background: 'radial-gradient(ellipse at top, hsla(190, 40%, 70%, 0.2), transparent)', borderRadius: '0 0 50% 50%' }}
              />
              {/* Depth text */}
              {floating && progress > 0.3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                  style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', ...navicueType.texture, color: 'hsla(190, 30%, 70%, 0.5)', fontSize: '11px', fontStyle: 'italic' }}>
                  weightless...
                </motion.div>
              )}
            </div>
            {/* Progress */}
            {floating && (
              <div style={{ width: '100%', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${progress * 100}%` }} style={{ height: '100%', background: 'hsla(200, 40%, 50%, 0.4)' }} />
              </div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>
              {floating ? 'the water holds you...' : 'tap to let go'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The water carried you. You never had to hold yourself up.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cortical arousal lowered. Weightless. Safe.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Floating. Held. Released.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}