/**
 * TRICKSTER #6 — The Mess Maker
 * "Perfectionism is paralysis. Make a mess. Joy is in the splash."
 * ARCHETYPE: Pattern E (Draw) — Scribble to cover the canvas
 * ENTRY: Scene-first — pristine white canvas
 * STEALTH KBE: Fast coverage = Flow (E); hesitation = Perfectionist Anxiety
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'active' | 'messy' | 'resonant' | 'afterglow';

export default function Trickster_MessMaker({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const startTime = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    strokeColor: themeColor(TH.accentHSL, 0.25, 10),
    strokeWidth: 12,
    onComplete: () => {
      const elapsed = Date.now() - startTime.current;
      console.log(`[KBE:E] MessMaker coverageMs=${elapsed} flow=${elapsed < 6000} inhibitionRelease=confirmed`);
      setStage('messy');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => { setStage('active'); startTime.current = Date.now(); }, 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '60px', borderRadius: radius.xs,
              background: 'hsla(0, 0%, 100%, 0.03)',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Pristine canvas. Cover it. Go fast. Make it ugly.
            </div>
            <div ref={draw.containerRef}
              style={{ width: '200px', height: '140px', borderRadius: radius.sm, position: 'relative', overflow: 'hidden',
                background: 'hsla(0, 0%, 100%, 0.02)',
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                cursor: 'crosshair', touchAction: 'none' }}>
              <canvas ref={draw.canvasRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {Math.round(draw.progress * 100)}% messy
              </div>
              <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 10) }}>
                go faster
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'messy' && (
          <motion.div key="m" initial={{ opacity: 0, rotate: 5 }} animate={{ opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.45, 14), textAlign: 'center', maxWidth: '260px' }}>
              Beautiful mess. The joy was in the splash, not the painting. Perfectionism just lost.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Inhibition release. Perfectionism is paralysis disguised as quality control. The blank canvas terrorizes because we fear ruining its purity. But creation requires destruction of the blank. Cover 80% in five seconds. The joy is in the splash, not the painting. Flow lives on the other side of mess.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Messy.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}