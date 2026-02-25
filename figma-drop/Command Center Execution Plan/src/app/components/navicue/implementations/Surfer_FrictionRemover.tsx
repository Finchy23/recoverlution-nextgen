/**
 * SURFER #4 — The Friction Remover
 * "Flow is just physics without friction. Smooth the track."
 * ARCHETYPE: Pattern B (Drag) — Drag to polish surface, ball accelerates
 * ENTRY: Scene-first — ball on gritty surface
 * STEALTH KBE: Identifying friction point = Systems Awareness (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'polishing' | 'smooth' | 'resonant' | 'afterglow';

const FRICTIONS = ['Your phone', 'Your chair', 'Your notifications', 'Your environment', 'Your routine'];

export default function Surfer_FrictionRemover({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selected, setSelected] = useState<string | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:K] FrictionRemover frictionPoint="${selected}" systemsAwareness=confirmed`);
      setStage('smooth');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('polishing'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const grit = 1 - drag.progress;
  const ballSpeed = 0.5 + drag.progress * 2;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '4px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
        )}
        {stage === 'polishing' && (
          <motion.div key="po" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {!selected ? (
              <>
                <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
                  What{"'"}s creating friction in your flow?
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                  {FRICTIONS.map(f => (
                    <motion.div key={f} whileTap={{ scale: 0.95 }} onClick={() => setSelected(f)}
                      style={{ padding: '6px 12px', borderRadius: radius.md, cursor: 'pointer',
                        background: themeColor(TH.primaryHSL, 0.03, 1),
                        border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                      <span style={{ fontSize: '11px', color: palette.textFaint }}>{f}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.25, 8) }}>
                  friction: {selected}
                </div>
                {/* Track visualization */}
                <div style={{ width: '180px', height: '30px', position: 'relative', borderRadius: radius.xs,
                  overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0,
                    background: grit > 0.3
                      ? `repeating-linear-gradient(90deg, ${themeColor(TH.primaryHSL, 0.03, 2)} 0px, ${themeColor(TH.primaryHSL, 0.05, 3)} ${2 + grit * 3}px)`
                      : themeColor(TH.accentHSL, 0.03, 2),
                    transition: 'all 0.3s' }} />
                  {/* Ball */}
                  <motion.div
                    animate={{ x: [0, 170, 0] }}
                    transition={{ duration: 3 / ballSpeed, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', top: '10px', width: '10px', height: '10px',
                      borderRadius: '50%',
                      background: themeColor(TH.accentHSL, 0.15 + drag.progress * 0.1, 8),
                      border: `1px solid ${themeColor(TH.accentHSL, 0.2, 10)}` }} />
                </div>
                <div style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic' }}>
                  drag to polish the surface
                </div>
                <div ref={drag.containerRef} style={{ width: '160px', height: '12px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                  touchAction: 'none', position: 'relative' }}>
                  <motion.div {...drag.dragProps}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                      background: themeColor(TH.accentHSL, 0.1, 5),
                      border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                      position: 'absolute', top: '-6px', left: '2px' }} />
                </div>
              </>
            )}
          </motion.div>
        )}
        {stage === 'smooth' && (
          <motion.div key="sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Ice. The ball flies now. You removed "{selected}": the grit is gone. Flow is just physics without friction. Smooth the track, and the ball accelerates on its own.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Systems awareness. Flow isn{"'"}t about trying harder; it{"'"}s about removing friction. Identify the constraint (the grit), eliminate it, and the system accelerates naturally. Most productivity problems aren{"'"}t motivation problems; they{"'"}re friction problems. Where is the grit? Smooth the track.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Smooth.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}