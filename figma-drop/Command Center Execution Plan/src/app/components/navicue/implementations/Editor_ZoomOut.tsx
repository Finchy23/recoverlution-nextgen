/**
 * EDITOR #5 — The Zoom Out (The Wide Shot)
 * "Get above the maze. The path is obvious."
 * ARCHETYPE: Pattern B (Drag) — Drag slider to zoom out of maze; trace exit
 * ENTRY: Scene-first — stuck in maze (zoomed in)
 * STEALTH KBE: Maintaining wide view = Solution Focus (B)
 * WEB ADAPTATION: Drag slider replaces pinch gesture
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'active' | 'wide' | 'resonant' | 'afterglow';

export default function Editor_ZoomOut({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] ZoomOut wideViewMaintained=true solutionFocus=confirmed`);
      setStage('wide');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const zoom = 1 + (1 - drag.progress) * 3; // 4x → 1x
  const mazeOpacity = 0.15 + drag.progress * 0.15;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', overflow: 'hidden', borderRadius: radius.xs,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <div style={{ width: '200%', height: '200%', transform: 'scale(2)', transformOrigin: 'center',
                display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px', padding: '4px' }}>
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} style={{ background: i % 3 === 0 ? themeColor(TH.primaryHSL, 0.08, 4) : 'transparent',
                    borderRadius: '1px' }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Get above the maze. Zoom out.
            </div>
            <div style={{ width: '100px', height: '100px', overflow: 'hidden', borderRadius: radius.xs,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <motion.div animate={{ scale: 1 / zoom }}
                style={{ width: '100%', height: '100%', transformOrigin: 'center',
                  display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px', padding: '4px' }}>
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} style={{
                    background: i % 3 === 0 ? themeColor(TH.primaryHSL, mazeOpacity, 4) : 'transparent',
                    borderRadius: '1px' }} />
                ))}
                {drag.progress > 0.7 && (
                  <div style={{ position: 'absolute', top: '80%', left: '85%',
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.3, 10) }} />
                )}
              </motion.div>
            </div>
            <div ref={drag.containerRef} style={{ width: '200px', height: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.12, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.18, 10)}`,
                  position: 'absolute', top: '-6px', left: '3px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              zoom: {Math.round(zoom * 10) / 10}x → 1x
            </div>
          </motion.div>
        )}
        {stage === 'wide' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: radius.xs,
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.3, 10) }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The maze is tiny. The exit is one turn away. You just needed altitude.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Perspective shift. You were stuck because you were on the ground. The wide shot reveals that most problems are small when seen from above. Maintain the altitude to find the path.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Wide.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}