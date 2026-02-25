/**
 * SOURCE #4 — The Unity
 * "The drop does not die. It becomes the ocean."
 * INTERACTION: A single luminous drop at top of screen. Each tap
 * moves it downward toward a vast dark ocean surface. Final tap —
 * the drop touches the surface and dissolves outward in concentric
 * ripples. The drop disappears. The ocean remains.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Self-Compassion', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FALL_STEPS = 5;

export default function Source_Unity({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [fallen, setFallen] = useState(0);
  const [ripplePhase, setRipplePhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (fallen < FALL_STEPS) return;
    const tick = () => { setRipplePhase(p => p + 0.03); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [fallen]);

  const fall = () => {
    if (stage !== 'active' || fallen >= FALL_STEPS) return;
    const next = fallen + 1;
    setFallen(next);
    if (next >= FALL_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = fallen / FALL_STEPS;
  const merged = t >= 1;
  const dropY = 25 + t * 85; // falls from 25 to 110 (ocean surface)
  const oceanSurface = 110;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Compassion" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A single drop...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The drop does not die. It becomes the ocean. You are not separate.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to let the drop fall</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={fall}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: fallen >= FALL_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '210px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 15%, 6%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 210 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Ocean body — deep dark below surface */}
                <rect x="0" y={oceanSurface} width="210" height={160 - oceanSurface}
                  fill="hsla(220, 20%, 10%, 0.4)" />
                {/* Ocean surface line */}
                <line x1="0" y1={oceanSurface} x2="210" y2={oceanSurface}
                  stroke={`hsla(220, 20%, 30%, ${0.12 + t * 0.08})`} strokeWidth="0.5" />
                {/* Subtle waves */}
                {Array.from({ length: 5 }, (_, i) => (
                  <line key={i}
                    x1={10 + i * 40} y1={oceanSurface + 3 + Math.sin((ripplePhase || 0) + i) * 1.5}
                    x2={40 + i * 40} y2={oceanSurface + 3 + Math.sin((ripplePhase || 0) + i + 1) * 1.5}
                    stroke={`hsla(220, 15%, 25%, ${0.06 + t * 0.03})`} strokeWidth="0.3" strokeLinecap="round" />
                ))}
                {!merged ? (
                  /* The drop — falling */
                  <motion.g initial={{ y: 0 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 60 }}>
                    {/* Drop glow */}
                    <circle cx="105" cy={dropY} r="12"
                      fill={`hsla(200, 25%, 50%, ${0.04 + t * 0.03})`} />
                    {/* Drop */}
                    <circle cx="105" cy={dropY} r={5 - t * 0.5}
                      fill={`hsla(200, 30%, ${45 + t * 10}%, ${0.3 + t * 0.1})`} />
                    {/* Drop highlight */}
                    <circle cx="103.5" cy={dropY - 1.5} r="1.5"
                      fill={`hsla(200, 20%, 65%, ${0.15 + t * 0.05})`} />
                  </motion.g>
                ) : (
                  /* Ripples — the drop has merged */
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 1.5 }}>
                    {[8, 18, 30, 44, 60].map((r, i) => (
                      <motion.ellipse key={i}
                        cx="105" cy={oceanSurface}
                        rx={r + (ripplePhase ? ripplePhase * 2 : 0)} ry={r * 0.25}
                        fill="none"
                        stroke={`hsla(200, 25%, ${40 + i * 5}%, ${0.15 / (i + 1)})`}
                        strokeWidth="0.6"
                        initial={{ rx: 0, ry: 0, opacity: 0 }}
                        animate={{ rx: r + 5, ry: r * 0.25 + 1, opacity: 0.12 / (i + 1) }}
                        transition={{ delay: i * 0.3, duration: 2 }}
                      />
                    ))}
                    {/* Impact point glow */}
                    <circle cx="105" cy={oceanSurface} r="3"
                      fill="hsla(200, 35%, 55%, 0.2)" />
                  </motion.g>
                )}
                {/* Deep ocean hint */}
                <text x="105" y="148" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(220, 15%, 30%, ${0.1 + t * 0.08})`}>
                  {merged ? 'ocean' : ''}
                </text>
              </svg>
            </div>
            <motion.div key={fallen} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {fallen === 0 ? 'A drop. Suspended.' : fallen < FALL_STEPS ? 'Falling toward the surface...' : 'Dissolved. The ocean remains.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: FALL_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < fallen ? 'hsla(200, 30%, 50%, 0.5)' : palette.primaryFaint, opacity: i < fallen ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The drop touched the ocean. Ripples. No more drop. Only ocean. You are not separate.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Non-dual awareness. The subject-object wall dissolves. No separate self to maintain. Cognitive load released.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Drop. Ripple. Ocean.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}