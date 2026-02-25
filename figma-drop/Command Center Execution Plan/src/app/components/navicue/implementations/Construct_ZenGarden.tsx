/**
 * CONSTRUCT #4 — The Zen Garden / Maintenance (The Ikea Effect)
 * "The mind is a garden. If you do not rake it, weeds grow."
 * ARCHETYPE: Pattern B (Drag) — Drag to rake the sand smooth
 * ENTRY: Scene-first — messy sand garden appears before instruction
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'smooth' | 'resonant' | 'afterglow' | 'arriving';

export default function Construct_ZenGarden({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      setStage('smooth');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2600);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const lineCount = 7;
  const smoothness = drag.progress;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '200px', height: '140px', borderRadius: radius.sm, overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.1, 6), position: 'relative',
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: `${18 + i * 16}px`, left: '10px', right: '10px',
                  height: '1px', background: themeColor(TH.accentHSL, 0.06, 4),
                  transform: `rotate(${(Math.random() - 0.5) * 12}deg) translateY(${(Math.random() - 0.5) * 6}px)` }} />
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>messy</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The mind is a garden. If you do not rake it, weeds grow. The order does not happen by magic. It happens by hand.
            </div>
            <div ref={drag.containerRef} {...drag.dragProps}
              style={{ width: '200px', height: '140px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.primaryHSL, 0.1, 6), position: 'relative',
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}`,
                touchAction: 'none', cursor: 'grab' }}>
              {Array.from({ length: lineCount }).map((_, i) => {
                const chaos = 1 - smoothness;
                return (
                  <motion.div key={i}
                    animate={{ rotate: chaos * ((i % 2 ? 1 : -1) * 6), y: chaos * ((i % 2 ? 1 : -1) * 4) }}
                    transition={{ duration: 0.3 }}
                    style={{ position: 'absolute', top: `${18 + i * 16}px`, left: '10px', right: '10px',
                      height: '1px', background: themeColor(TH.accentHSL, 0.06 + smoothness * 0.06, 4 + smoothness * 4) }} />
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to rake</div>
          </motion.div>
        )}
        {stage === 'smooth' && (
          <motion.div key="sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '200px', height: '140px', borderRadius: radius.sm, overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.12, 8), position: 'relative',
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: `${18 + i * 16}px`, left: '10px', right: '10px',
                  height: '1px', background: themeColor(TH.accentHSL, 0.12, 8) }} />
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>smooth until you return</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Ikea Effect. We value things we actively help create or maintain. Daily maintenance of a digital construct builds self-efficacy. Rake.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Raked.</div>
          </motion.div>
        )}
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}>
            <div style={{ width: '200px', height: '140px', borderRadius: radius.sm, overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.12, 8), position: 'relative',
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: `${18 + i * 16}px`, left: '10px', right: '10px',
                  height: '1px', background: themeColor(TH.accentHSL, 0.12, 8) }} />
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>smooth until you return</motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}