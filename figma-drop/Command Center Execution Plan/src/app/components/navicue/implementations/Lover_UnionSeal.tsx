/**
 * LOVER #10 — The Union Seal (The Proof)
 * "One plus one is not two. It is one, but larger."
 * INTERACTION: Two water drops hover, distinct. Each tap moves them
 * closer. Final tap: they merge with a liquid surface-tension
 * animation into a single larger drop. It does not separate again.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const MERGE_STEPS = 5;

export default function Lover_UnionSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [merged, setMerged] = useState(0);
  const [ripplePhase, setRipplePhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setRipplePhase(p => p + 0.03); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const closer = () => {
    if (stage !== 'active' || merged >= MERGE_STEPS) return;
    const next = merged + 1;
    setMerged(next);
    if (next >= MERGE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
    }
  };

  const t = merged / MERGE_STEPS;
  const fused = t >= 1;
  // Drop positions — converging
  const separation = 40 * (1 - t); // 40 → 0
  const dropR = 18;
  const mergedR = 28; // larger drop
  // Surface tension wobble for merged drop
  const wobbleX = fused ? Math.sin(ripplePhase * 1.5) * 1.5 : 0;
  const wobbleY = fused ? Math.cos(ripplePhase * 1.2) * 1 : 0;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two drops hover...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>One plus one is not two. It is one, but larger.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to bring them closer</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closer}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: merged >= MERGE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(210, ${8 + t * 8}%, ${7 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <radialGradient id={`${svgId}-dropGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(210, 25%, 45%, ${t * 0.08})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                  {/* Drop highlight */}
                  <radialGradient id={`${svgId}-dropHighlight`} cx="35%" cy="30%">
                    <stop offset="0%" stopColor="hsla(210, 20%, 60%, 0.12)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="95" fill={`url(#${svgId}-dropGlow)`} />

                {!fused ? (
                  <>
                    {/* Drop A — left */}
                    <motion.g initial={{ x: 0 }} animate={{ x: -separation / 2 }} transition={{ type: 'spring', stiffness: 60 }}>
                      <circle cx="100" cy="100" r={dropR}
                        fill={`hsla(210, 20%, 35%, ${0.08 + t * 0.04})`}
                        stroke={`hsla(210, 18%, 40%, ${0.08 + t * 0.04})`} strokeWidth="0.5" />
                      <circle cx="100" cy="100" r={dropR} fill={`url(#${svgId}-dropHighlight)`} />
                      {/* Surface tension bridge — appears when close */}
                      {t > 0.5 && (
                        <ellipse cx={100 + dropR - 2} cy="100" rx={3 * (t - 0.5) * 2} ry={dropR * 0.6}
                          fill={`hsla(210, 18%, 38%, ${(t - 0.5) * 0.04})`} />
                      )}
                    </motion.g>
                    {/* Drop B — right */}
                    <motion.g initial={{ x: 0 }} animate={{ x: separation / 2 }} transition={{ type: 'spring', stiffness: 60 }}>
                      <circle cx="100" cy="100" r={dropR}
                        fill={`hsla(350, 18%, 35%, ${0.08 + t * 0.04})`}
                        stroke={`hsla(350, 16%, 40%, ${0.08 + t * 0.04})`} strokeWidth="0.5" />
                      <circle cx="100" cy="100" r={dropR} fill={`url(#${svgId}-dropHighlight)`} />
                    </motion.g>
                  </>
                ) : (
                  /* Merged drop — larger, with surface tension wobble */
                  <motion.g
                    initial={{ scale: 0.7, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 50, damping: 8 }}
                    style={{ transformOrigin: '100px 100px' }}>
                    <ellipse cx={100 + wobbleX} cy={100 + wobbleY}
                      rx={mergedR + wobbleX * 0.3} ry={mergedR - wobbleX * 0.2}
                      fill="hsla(280, 18%, 35%, 0.1)"
                      stroke="hsla(280, 15%, 42%, 0.1)" strokeWidth="0.5" />
                    <ellipse cx={100 + wobbleX} cy={100 + wobbleY}
                      rx={mergedR + wobbleX * 0.3} ry={mergedR - wobbleX * 0.2}
                      fill={`url(#${svgId}-dropHighlight)`} />
                    {/* Inner highlight — the "one" */}
                    <circle cx={93 + wobbleX * 0.5} cy={93 + wobbleY * 0.5} r={mergedR * 0.25}
                      fill="hsla(280, 15%, 55%, 0.04)" />
                  </motion.g>
                )}

                {/* Merge ripples */}
                {fused && (
                  <motion.circle cx="100" cy="100"
                    initial={{ r: mergedR, opacity: 0.1, strokeWidth: 1 }}
                    animate={{ r: 70, opacity: 0, strokeWidth: 1 }}
                    transition={{ duration: 3, ease: 'easeOut' }}
                    fill="none" stroke="hsla(280, 15%, 45%, 0.08)"
                  />
                )}

                {/* Label */}
                {fused && (
                  <motion.text x="100" y="160" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(280, 18%, 48%, 0.2)" letterSpacing="2" fontWeight="500"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1, duration: 2 }}>
                    WE
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={merged} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {merged === 0 ? 'Two drops. Distinct. Hovering.' : merged < MERGE_STEPS ? `Closer... surface tension bridges.` : 'Merged. One drop. Larger. Inseparable.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: MERGE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < merged ? 'hsla(280, 18%, 48%, 0.5)' : palette.primaryFaint,
                  opacity: i < merged ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Two drops became one. Larger. Inseparable. One plus one is not two. It is one, but larger. It does not separate again.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Interdependence. The shift from "me vs you" to "we." The strongest buffer against life stress. Social baseline theory: together is the default state.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Two. One. Larger.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}