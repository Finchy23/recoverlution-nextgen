/**
 * OPTICIAN #2 — The Frame Crop (Zooming Out)
 * "The tragedy is just a matter of cropping. Pull back. See the rest of the picture."
 * ARCHETYPE: Pattern B (Drag) — Drag slider to zoom out from disaster to landscape
 * ENTRY: Scene-first — zoomed-in disaster image appears before instruction
 * STEALTH KBE: Dwell time in "wide" view = Belief shift (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'wide' | 'resonant' | 'afterglow';

export default function Optician_FrameCrop({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const kbe = useRef({ wideEnteredAt: 0 });

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      kbe.current.wideEnteredAt = Date.now();
      setStage('wide');
      t(() => {
        const dwellMs = Date.now() - kbe.current.wideEnteredAt;
        console.log(`[KBE:B] FrameCrop wideDwellMs=${dwellMs}`);
        setStage('resonant');
      }, 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Visual: circle crop that expands as you drag
  const cropSize = 40 + drag.progress * 160; // 40px → 200px
  const cropRadius = cropSize / 2;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '200px', height: '140px', borderRadius: radius.sm, overflow: 'hidden', position: 'relative',
              background: themeColor(TH.primaryHSL, 0.06, 4) }}>
              {/* "Zoomed in" disaster: a red/dark cluster in center */}
              <div style={{ position: 'absolute', top: '30%', left: '30%', width: '40%', height: '40%',
                borderRadius: '50%', background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.15, -10)}, transparent)` }} />
              <div style={{ position: 'absolute', top: '35%', left: '38%', width: '24%', height: '30%',
                borderRadius: radius.xs, background: themeColor(TH.primaryHSL, 0.12, -5) }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a problem</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The tragedy is just a matter of cropping. You are too close. Pull back. See the rest of the picture.
            </div>
            <div {...drag.dragProps}
              style={{ width: '200px', height: '140px', borderRadius: radius.sm, overflow: 'hidden', position: 'relative',
                background: themeColor(TH.primaryHSL, 0.04, 2), touchAction: 'none', cursor: 'grab' }}>
              {/* Beautiful landscape that reveals as you zoom out */}
              <div style={{ position: 'absolute', inset: 0,
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.03 + drag.progress * 0.08, 8)} 20%, ${themeColor(TH.primaryHSL, 0.04 + drag.progress * 0.06, 4)} 60%, transparent)` }} />
              {/* Stars/details that appear */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i}
                  animate={{ opacity: drag.progress > (i + 1) * 0.12 ? 0.3 : 0 }}
                  style={{ position: 'absolute',
                    top: `${10 + (i * 37) % 90}%`, left: `${5 + (i * 53) % 90}%`,
                    width: '3px', height: '3px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.4, 20) }} />
              ))}
              {/* The "problem" cluster shrinks */}
              <motion.div
                animate={{ scale: 1 - drag.progress * 0.7, opacity: 1 - drag.progress * 0.5 }}
                style={{ position: 'absolute', top: '30%', left: '30%', width: '40%', height: '40%',
                  borderRadius: '50%', background: `radial-gradient(circle, ${themeColor(TH.primaryHSL, 0.12, -5)}, transparent)` }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to zoom out</div>
          </motion.div>
        )}
        {stage === 'wide' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '200px', height: '140px', borderRadius: radius.sm, overflow: 'hidden', position: 'relative',
              background: themeColor(TH.primaryHSL, 0.06, 4) }}>
              {/* Full landscape visible */}
              <div style={{ position: 'absolute', inset: 0,
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.1, 8)} 30%, ${themeColor(TH.primaryHSL, 0.06, 4)} 70%)` }} />
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ position: 'absolute',
                  top: `${10 + (i * 37) % 90}%`, left: `${5 + (i * 53) % 90}%`,
                  width: '3px', height: '3px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.3, 20) }} />
              ))}
              <div style={{ position: 'absolute', top: '42%', left: '42%', width: '16%', height: '16%',
                borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.06, -3) }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the problem was always small</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Attentional bias narrows the frame. Cognitive defusion widens it. The disaster was always a detail in a landscape. Stay wide.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Full frame.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}