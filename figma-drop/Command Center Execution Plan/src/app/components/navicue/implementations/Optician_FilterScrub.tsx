/**
 * OPTICIAN #3 — The Filter Scrub (Emotional Decoloring)
 * "The situation isn't red. Your eyes are. Scrub the emotion off the lens."
 * ARCHETYPE: Pattern B (Drag) — Drag slider to scrub red tint to neutral
 * ENTRY: Instruction-as-poetry — voice line appears as the red fades
 * STEALTH KBE: Smoothness of drag (no releases) = Emotional Regulation (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Practice');
type Stage = 'tinted' | 'active' | 'clear' | 'resonant' | 'afterglow';

export default function Optician_FilterScrub({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('tinted');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const kbe = useRef({ releases: 0, dragStarted: false });

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      console.log(`[KBE:E] FilterScrub releases=${kbe.current.releases} smoothness=${kbe.current.releases === 0 ? 'perfect' : 'interrupted'}`);
      setStage('clear');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  // Track releases mid-drag for smoothness KBE
  useEffect(() => {
    if (drag.isDragging && !kbe.current.dragStarted) {
      kbe.current.dragStarted = true;
    }
    if (!drag.isDragging && kbe.current.dragStarted && !drag.completed) {
      kbe.current.releases++;
    }
  }, [drag.isDragging, drag.completed]);

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const redIntensity = 1 - drag.progress;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'tinted' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '220px', height: '100px', borderRadius: radius.md,
              background: 'hsla(0, 40%, 25%, 0.3)',
            }}>
              <div style={{ ...navicueType.texture, color: 'hsla(0, 50%, 60%, 0.5)' }}>everything is red</div>
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The situation isn{'\u2019'}t red. Your eyes are. Scrub the emotion off the lens. Look at the raw data.
            </div>
            {/* Red overlay that fades with progress */}
            <div style={{ position: 'relative', width: '220px', height: '100px', borderRadius: radius.md, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0,
                background: themeColor(TH.primaryHSL, 0.08, 6),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 8)}`,
                borderRadius: radius.md }} />
              <motion.div
                animate={{ opacity: redIntensity * 0.35 }}
                style={{ position: 'absolute', inset: 0, borderRadius: radius.md,
                  background: 'hsla(0, 50%, 30%, 1)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ opacity: 0.3 + drag.progress * 0.4 }}
                  style={{ ...navicueType.texture,
                    color: drag.progress > 0.5 ? themeColor(TH.accentHSL, 0.5, 15) : 'hsla(0, 40%, 50%, 0.4)' }}>
                  {drag.progress < 0.3 ? 'anger' : drag.progress < 0.7 ? 'frustration' : 'data'}
                </motion.div>
              </div>
            </div>
            {/* Drag slider */}
            <div {...drag.dragProps}
              style={{ width: '200px', height: '32px', borderRadius: radius.lg, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.06, 4), touchAction: 'none', cursor: 'grab' }}>
              <motion.div
                animate={{ width: `${drag.progress * 100}%` }}
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: radius.lg,
                  background: `linear-gradient(90deg, hsla(0, 30%, 30%, 0.2), ${themeColor(TH.accentHSL, 0.15, 8)})` }} />
              <motion.div
                animate={{ left: `${drag.progress * 100}%` }}
                style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.3, 10),
                  border: `2px solid ${themeColor(TH.accentHSL, 0.2, 15)}` }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>scrub to neutral</div>
          </motion.div>
        )}
        {stage === 'clear' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '220px', height: '100px', borderRadius: radius.md,
              background: themeColor(TH.primaryHSL, 0.08, 6),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.4, 15) }}>clear</div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the lens is clean</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Emotional decoloring. The amygdala tints perception. Scrubbing the filter is an act of prefrontal override {'\u2014'} choosing observation over reaction. The data was always neutral.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Neutral.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}