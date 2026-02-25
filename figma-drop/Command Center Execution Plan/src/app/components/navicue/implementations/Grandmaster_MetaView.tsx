/**
 * GRANDMASTER #1 — The Meta-View (The Drone)
 * "Stop running. Look up. The solution is only visible from above."
 * ARCHETYPE: Pattern B (Drag) — Drag slider to zoom from 1st-person to top-down
 * ENTRY: Scene-first — trapped in maze floor view
 * STEALTH KBE: Maintaining top-down view = Systems Thinking (K)
 * WEB ADAPTATION: Drag slider replaces pinch gesture
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Circuit');
type Stage = 'arriving' | 'active' | 'above' | 'resonant' | 'afterglow';

export default function Grandmaster_MetaView({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onComplete: () => {
      console.log(`[KBE:K] MetaView zoomRetained=true systemsThinking=confirmed`);
      setStage('above');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const altitude = drag.progress;
  const wallH = Math.max(2, 20 - altitude * 18);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '80px', height: '20px', background: themeColor(TH.primaryHSL, 0.06 + i * 0.02, 3),
                borderRadius: '2px' }} />
            ))}
            <span style={{ ...navicueType.hint, color: palette.textFaint }}>1st person, trapped</span>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Disengage to see the path. Rise above.
            </div>
            <div style={{ width: '100px', height: '100px', borderRadius: radius.xs, overflow: 'hidden',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`, position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px', padding: '4px',
                transform: `scale(${0.5 + altitude * 0.5})`, transformOrigin: 'center', transition: 'transform 0.1s' }}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} style={{ height: `${wallH}px`,
                    background: [3, 7, 8, 11, 13, 16, 18, 21, 23].includes(i)
                      ? themeColor(TH.primaryHSL, 0.12 - altitude * 0.06, 6) : 'transparent',
                    borderRadius: '1px' }} />
                ))}
              </div>
              {altitude > 0.6 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                  style={{ position: 'absolute', bottom: '8px', right: '8px', width: '6px', height: '6px',
                    borderRadius: '50%', background: themeColor(TH.accentHSL, 0.4, 12) }} />
              )}
            </div>
            <div ref={drag.containerRef} style={{ width: '40px', height: '120px', touchAction: 'none',
              background: themeColor(TH.primaryHSL, 0.03, 2), borderRadius: radius.xl,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`, position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '28px', height: '28px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.12, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.18, 10)}`,
                  position: 'absolute', left: '5px', bottom: '5px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              altitude: {Math.round(altitude * 100)}%
            </div>
          </motion.div>
        )}
        {stage === 'above' && (
          <motion.div key="ab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: radius.xs,
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.35, 12) }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The exit was always there. You just needed altitude.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Systems thinking. You are exhausted because you solve from inside the system. The meta-view, disengaging to see the whole board, reveals paths invisible at ground level. Stop running. Look up.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Above.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}