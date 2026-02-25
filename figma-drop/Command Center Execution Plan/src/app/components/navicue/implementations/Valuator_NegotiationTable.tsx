/**
 * VALUATOR #7 — The Negotiation Table
 * "You get what you negotiate. Push to the full ask."
 * ARCHETYPE: Pattern B (Drag) — Slider from 50% to 100% with simulated friction
 * ENTRY: Scene-first — slider at 50%
 * STEALTH KBE: Stopping at 80% = compromise; reaching 100% = Entitlement Efficacy (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'active' | 'settled' | 'resonant' | 'afterglow';

export default function Valuator_NegotiationTable({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      const finalPct = Math.round(50 + drag.progress * 50);
      console.log(`[KBE:B] NegotiationTable settlement=${finalPct}% entitlementEfficacy=${finalPct >= 95}`);
      setStage('settled');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const pct = Math.round(50 + drag.progress * 50);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '160px', height: '6px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }}>
              <div style={{ width: '50%', height: '100%', borderRadius: '3px',
                background: themeColor(TH.accentHSL, 0.12, 6) }} />
            </div>
            <span style={{ ...navicueType.hint, color: palette.textFaint }}>50%</span>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Push to the full ask. The friction is just fear.
            </div>
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 12), fontSize: '20px' }}>{pct}%</div>
            <div ref={drag.containerRef} style={{ width: '220px', height: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.12 + drag.progress * 0.1, 6),
                transition: 'width 0.05s' }} />
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.15, 8),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.2, 12)}`,
                  position: 'absolute', top: '-6px', left: `calc(${pct}% - 12px)` }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {pct < 80 ? 'keep pushing' : pct < 95 ? 'almost there... push through' : 'full ask!'}
            </div>
          </motion.div>
        )}
        {stage === 'settled' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 15), fontSize: '24px' }}>100%</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              You pushed through the friction. The full ask is yours.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Entitlement efficacy. You do not get what you deserve; you get what you negotiate. The friction is internal fear, not external reality. Pushing to 100% reveals your belief in your own worth.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Negotiated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}