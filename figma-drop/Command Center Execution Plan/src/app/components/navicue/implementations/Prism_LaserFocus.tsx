/**
 * PRISM #3 — Laser Focus
 * "Align the photons."
 * ARCHETYPE: Pattern B (Drag) — Drag to align scattered light into coherence
 * ENTRY: Instruction as Poetry — no hint, the prompt IS the action
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'present' | 'active' | 'resonant' | 'afterglow';

export default function Prism_LaserFocus({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('present');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const d = drag.progress;
  const scatter = 1 - d; // photon scatter decreases

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            A light bulb illuminates a room. A laser cuts steel. The difference is not energy; it is coherence. Align your attention to a single point.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, width: '220px', height: '140px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140">
                {/* Source */}
                <circle cx="20" cy="70" r={8 - d * 4}
                  fill={`hsla(0, 0%, ${50 + d * 30}%, ${0.08 + d * 0.12})`} />
                {/* Scattered / coherent rays */}
                {Array.from({ length: 8 }, (_, i) => {
                  const baseY = 70;
                  const spread = (i - 3.5) * 12 * scatter;
                  return (
                    <motion.line key={i} x1="30" y1={baseY + spread * 0.3}
                      x2="210" y2={baseY + spread}
                      stroke={d > 0.9 ? `hsla(0, 60%, 45%, ${0.3})` : `hsla(0, 0%, ${40 + d * 30}%, ${0.05 + d * 0.04})`}
                      strokeWidth={d > 0.8 ? 1.5 : 0.5 + d * 0.5}
                      animate={{ y2: baseY + spread }}
                      transition={{ type: 'spring', stiffness: 40 }} />
                  );
                })}
                {/* Target dot at high coherence */}
                {d > 0.7 && (
                  <motion.circle cx="210" cy="70" r={2 + (d - 0.7) * 6}
                    fill={`hsla(0, 50%, 45%, ${(d - 0.7) * 0.5})`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}
                <text x="110" y="130" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.1 + d * 0.1, 10)} letterSpacing="0.1em">
                  {d > 0.9 ? 'COHERENT' : d > 0.5 ? 'ALIGNING' : 'SCATTERED'}
                </text>
              </svg>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Coherent light. Same energy, single direction. When cognitive resources synchronize toward one target instead of task-switching, your cutting power increases exponentially. Align the photons.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Coherence.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}