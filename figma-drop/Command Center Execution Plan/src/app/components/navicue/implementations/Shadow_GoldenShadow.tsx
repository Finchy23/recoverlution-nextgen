/**
 * SHADOW WORKER #2 — The Golden Shadow (The Envy)
 * "You only envy what you are capable of. Reclaim the gold."
 * ARCHETYPE: Pattern B (Drag) — Drag the "Gift" from statue to inventory
 * ENTRY: Scene-first — golden pedestal
 * STEALTH KBE: Smooth drag = Self-Efficacy (B); hesitation = doubt
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'arriving' | 'active' | 'reclaimed' | 'resonant' | 'afterglow';

export default function Shadow_GoldenShadow({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const dragStart = useRef(0);

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      const elapsed = Date.now() - dragStart.current;
      console.log(`[KBE:B] GoldenShadow dragMs=${elapsed} selfEfficacy=${elapsed < 4000}`);
      setStage('reclaimed');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'active') dragStart.current = Date.now();
  }, [stage]);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '30px', borderRadius: '4px 4px 0 0',
              background: themeColor(TH.accentHSL, 0.08, 4) }} />
            <div style={{ width: '30px', height: '6px', borderRadius: '0 0 4px 4px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are jealous. Good. The gold belongs to you. Drag it back.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '24px', height: '36px', borderRadius: '4px 4px 0 0',
                background: themeColor(TH.accentHSL, 0.1 + drag.progress * 0.05, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 7)}`,
                opacity: 1 - drag.progress * 0.6 }} />
              <div style={{ width: '34px', height: '8px', borderRadius: '0 0 4px 4px',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            </div>
            <div ref={drag.containerRef} style={{ width: '200px', height: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.15, 8),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.2, 10)}`,
                  position: 'absolute', top: '-6px', left: '3px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              reclaiming: {Math.round(drag.progress * 100)}%
            </div>
          </motion.div>
        )}
        {stage === 'reclaimed' && (
          <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}
              style={{ width: '16px', height: '16px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.2, 10),
                boxShadow: `0 0 10px ${themeColor(TH.accentHSL, 0.08, 8)}` }} />
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Reclaimed. The envy was a map. The gold was always yours.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The golden shadow. You only envy what you are capable of becoming. Jealousy is a map to your unrealized potential. The statue holds your name inside. Reclaim the gold. It belongs to you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Reclaimed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}