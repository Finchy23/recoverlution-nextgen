/**
 * OMEGA POINT #7 — The Pattern Match
 * "As above, so below. The micro reflects the macro."
 * INTERACTION: A seashell spiral on the left. A galaxy spiral on the
 * right. Each tap overlays them more — they align perfectly. Fractal
 * fluency. The same pattern at every scale.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const OVERLAY_STEPS = 5;

export default function OmegaPoint_PatternMatch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [overlaid, setOverlaid] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const overlay = () => {
    if (stage !== 'active' || overlaid >= OVERLAY_STEPS) return;
    const next = overlaid + 1;
    setOverlaid(next);
    if (next >= OVERLAY_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const t = overlaid / OVERLAY_STEPS;
  // Both spirals move toward center
  const shellX = 60 - t * 60 + 55; // toward 55 (center-ish)
  const galaxyX = 160 + t * 60 - 60 - 55; // toward 55

  const buildSpiral = (cx: number, cy: number, turns: number, maxR: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= turns * 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const r = (i / (turns * 60)) * maxR;
      pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
    }
    return pts.join(' ');
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two spirals appear...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>As above, so below. The micro reflects the macro.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to overlay the patterns</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={overlay}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: overlaid >= OVERLAY_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(240, 10%, 7%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Seashell spiral — warm, moving right */}
                <motion.g initial={{ x: 0 }} animate={{ x: t * 50 }} transition={{ type: 'spring', stiffness: 60 }}>
                  <polyline points={buildSpiral(60, 80, 3, 30)}
                    fill="none" stroke={`hsla(30, 35%, 50%, ${0.25 + t * 0.1})`} strokeWidth="1.2" strokeLinecap="round" />
                  {/* Shell texture lines */}
                  {[8, 15, 22].map((r, i) => (
                    <circle key={i} cx="60" cy="80" r={r} fill="none"
                      stroke={`hsla(30, 25%, 45%, ${(0.08 - t * 0.04)})`} strokeWidth="0.3" />
                  ))}
                  {t < 0.8 && (
                    <text x="60" y="120" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(30, 20%, 45%, ${0.2 * (1 - t)})`}>SHELL</text>
                  )}
                </motion.g>
                {/* Galaxy spiral — cool, moving left */}
                <motion.g initial={{ x: 0 }} animate={{ x: -t * 50 }} transition={{ type: 'spring', stiffness: 60 }}>
                  <polyline points={buildSpiral(160, 80, 3, 30)}
                    fill="none" stroke={`hsla(260, 35%, 50%, ${0.25 + t * 0.1})`} strokeWidth="1.2" strokeLinecap="round" />
                  {/* Galaxy stars */}
                  {Array.from({ length: 8 }, (_, i) => {
                    const a = (i / 8) * Math.PI * 2;
                    const r = 10 + (i % 3) * 8;
                    return (
                      <circle key={i} cx={160 + Math.cos(a) * r} cy={80 + Math.sin(a) * r} r="1"
                        fill={`hsla(260, 30%, 55%, ${0.15 - t * 0.08})`} />
                    );
                  })}
                  {t < 0.8 && (
                    <text x="160" y="120" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(260, 20%, 45%, ${0.2 * (1 - t)})`}>GALAXY</text>
                  )}
                </motion.g>
                {/* Alignment glow at center */}
                {t > 0.5 && (
                  <motion.circle cx="110" cy="80" r={20 + t * 15}
                    fill={`hsla(45, 35%, 55%, ${(t - 0.5) * 0.05})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.5) * 0.08 }}
                  />
                )}
                {/* "Same pattern" label */}
                {overlaid >= OVERLAY_STEPS && (
                  <motion.text x="110" y="145" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(45, 30%, 55%, 0.3)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                    transition={{ delay: 0.5, duration: 1.5 }}>
                    same pattern
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={overlaid} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {overlaid === 0 ? 'Shell. Galaxy. Separate scales.' : overlaid < OVERLAY_STEPS ? `Overlaying... ${Math.floor(t * 100)}%` : 'Perfect match. The same spiral.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: OVERLAY_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < overlaid ? 'hsla(45, 40%, 55%, 0.5)' : palette.primaryFaint, opacity: i < overlaid ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Shell and galaxy. The same spiral. Micro reflects macro. As above, so below.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Fractal fluency. Self-similar patterns across scales. Coherence found. Cognitive load released.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Shell. Galaxy. One.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}