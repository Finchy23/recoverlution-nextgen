/**
 * GRAVITON #5 — The Tidal Force
 * "Your mood pulls on their water."
 * ARCHETYPE: Pattern B (Drag) — Drag moon to pull the tides
 * ENTRY: Instruction as Poetry — "Respect your gravity" IS the instruction
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'present' | 'active' | 'resonant' | 'afterglow';

export default function Graviton_TidalForce({ onComplete }: { data?: any; onComplete?: () => void }) {
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
  const tideHeight = d * 20;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            You are not separate. Your mood pulls on their water. If you are stormy, they drown. If you are calm, they float. Respect your gravity.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, width: '240px', height: '120px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 120">
                {/* Ocean surface — rises near moon */}
                <motion.path
                  d={`M 0 ${80 - tideHeight * 0.2} Q ${60 + d * 120} ${60 - tideHeight} ${120 + d * 60} ${80 - tideHeight * 0.8} Q ${180 + d * 30} ${90} 240 ${85}`}
                  fill={themeColor(TH.accentHSL, 0.08 + d * 0.06, 8)} stroke={themeColor(TH.accentHSL, 0.1, 12)} strokeWidth="0.5" />
                {/* Ocean body */}
                <motion.rect x="0" y="85" width="240" height="35" fill={themeColor(TH.accentHSL, 0.04, 5)} />
                {/* Moon */}
                <motion.circle cx={30 + d * 180} cy="25" r="10"
                  fill={themeColor(TH.primaryHSL, 0.15, 18)}
                  stroke={themeColor(TH.primaryHSL, 0.08, 22)} strokeWidth="0.4"
                  initial={{ cx: 30 + d * 180 }}
                  animate={{ cx: 30 + d * 180 }} transition={{ type: 'spring', stiffness: 40 }} />
                {/* Pull lines */}
                {d > 0.2 && Array.from({ length: 3 }, (_, i) => (
                  <motion.line key={i} x1={30 + d * 180} y1="35"
                    x2={30 + d * 180 + (i - 1) * 10} y2={60 - tideHeight * 0.5}
                    stroke={themeColor(TH.accentHSL, d * 0.06, 10)} strokeWidth="0.3" strokeDasharray="2 2"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                ))}
              </svg>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.1 + d * 0.1, 12), letterSpacing: '0.1em' }}>
              {d > 0.9 ? 'FULL TIDE' : 'PULL'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Emotional contagion. Leaders are emotional thermostats — their affective state disproportionately influences the group. You moved the tides. Respect the gravity.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Respect your gravity.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}