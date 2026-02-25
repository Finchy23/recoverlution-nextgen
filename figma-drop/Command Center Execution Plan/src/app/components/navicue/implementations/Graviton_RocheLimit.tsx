/**
 * GRAVITON #8 — The Roche Limit
 * "Back up. You are crushing them."
 * ARCHETYPE: Pattern B (Drag) — Drag to approach, then wisely retreat
 * ENTRY: Instruction as Poetry — the warning IS the teaching
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'present' | 'active' | 'resonant' | 'afterglow';

export default function Graviton_RocheLimit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('present');
  const [shattered, setShattered] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const drag = useDragInteraction({
    axis: 'x', sticky: true, snapPoints: [0.65],
    onThreshold: (p) => { if (p > 0.85 && !shattered) setShattered(true); },
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const d = drag.progress;
  const moonX = 160 - d * 100;
  const tooClose = d > 0.75;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Intimacy is good. Fusion is destruction. If you get too close, the tidal forces will tear them apart. Maintain the gap.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, width: '220px', height: '120px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 120">
                {/* Planet */}
                <circle cx="50" cy="60" r="25" fill={themeColor(TH.accentHSL, 0.15, 8)} />
                {/* Roche limit line */}
                <line x1="90" y1="10" x2="90" y2="110" stroke={`hsla(0, 40%, 35%, ${0.06 + d * 0.08})`}
                  strokeWidth="0.5" strokeDasharray="3 3" />
                <text x="90" y="118" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(0, 30%, 35%, ${0.08 + d * 0.05})`}>ROCHE LIMIT</text>
                {/* Moon — shatters if too close */}
                {!shattered ? (
                  <motion.circle cx={moonX} cy="60" r="12"
                    fill={themeColor(TH.primaryHSL, 0.15, 15)}
                    stroke={tooClose ? `hsla(0, 40%, 35%, 0.2)` : themeColor(TH.primaryHSL, 0.08, 18)}
                    strokeWidth="0.5"
                    initial={{ cx: moonX }}
                    animate={{ cx: moonX }} transition={{ type: 'spring', stiffness: 50 }} />
                ) : (
                  /* Shattered fragments */
                  Array.from({ length: 8 }, (_, i) => {
                    const a = (i / 8) * Math.PI * 2;
                    return (
                      <motion.circle key={i} r="3"
                        initial={{ cx: moonX, cy: 60 }}
                        animate={{ cx: moonX + Math.cos(a) * 20, cy: 60 + Math.sin(a) * 20, opacity: [0.2, 0.05] }}
                        transition={{ duration: 2 }}
                        fill={themeColor(TH.primaryHSL, 0.1, 12)} />
                    );
                  })
                )}
              </svg>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
              color: tooClose ? `hsla(0, 35%, 40%, 0.5)` : themeColor(TH.accentHSL, 0.12, 12) }}>
              {shattered ? 'SHATTERED' : tooClose ? 'TOO CLOSE' : d > 0.5 ? 'APPROACHING' : 'SAFE DISTANCE'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Differentiation of self. The ability to be close without losing identity — or overwhelming the other. Crossing the Roche limit leads to enmeshment and breakdown. Maintain the gap.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Maintain the gap.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}