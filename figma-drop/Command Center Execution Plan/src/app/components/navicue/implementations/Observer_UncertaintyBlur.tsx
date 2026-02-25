/**
 * OBSERVER #5 — The Uncertainty Blur
 * "Precision is a trap."
 * ARCHETYPE: Pattern B (Drag) — Drag to choose: position OR momentum
 * ENTRY: Instruction as Poetry — "Embrace the blur. It is freedom."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'present' | 'active' | 'resonant' | 'afterglow';

export default function Observer_UncertaintyBlur({ onComplete }: { data?: any; onComplete?: () => void }) {
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
  const posBlur = d * 8;           // position blurs
  const momSharp = 0.3 + d * 0.7;  // momentum sharpens

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            If you focus too hard on the Now, you lose the Future. You cannot know where it is AND where it is going. Embrace the blur. It is freedom.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, width: '220px', height: '120px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 120">
                {/* Position — blurs as you drag right */}
                <g style={{ filter: `blur(${posBlur}px)` }}>
                  <circle cx="70" cy="60" r="15"
                    fill={themeColor(TH.accentHSL, 0.15, 12)} />
                </g>
                <text x="70" y="95" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.1, 10)} letterSpacing="0.06em">POSITION</text>
                {/* Momentum — sharpens as you drag right */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: momSharp }}>
                  <line x1="135" y1="60" x2="175" y2="60"
                    stroke={themeColor(TH.accentHSL, 0.15 + d * 0.15, 15)} strokeWidth="1.5" markerEnd="url(#momArrow)" />
                  <defs><marker id="momArrow" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
                    <path d="M 0 0 L 5 2 L 0 4 Z" fill={themeColor(TH.accentHSL, 0.2, 15)} />
                  </marker></defs>
                </motion.g>
                <text x="155" y="95" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.1, 10)} letterSpacing="0.06em">MOMENTUM</text>
                {/* ≤ symbol */}
                <text x="110" y="64" textAnchor="middle" fontSize="11" fontFamily="serif"
                  fill={themeColor(TH.primaryHSL, 0.08, 10)}>{"<"}</text>
              </svg>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.12, 12), letterSpacing: '0.1em' }}>
              {d > 0.9 ? 'UNCERTAIN & FREE' : 'Δx · Δp ≥ ℏ/2'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Heisenberg{'\u2019'}s uncertainty principle. Accepting uncertainty reduces the cognitive load of trying to control every variable. Precision is a trap. The blur is freedom.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Embrace the blur.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}