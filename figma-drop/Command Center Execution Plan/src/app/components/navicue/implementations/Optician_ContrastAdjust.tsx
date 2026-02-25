/**
 * OPTICIAN #6 — The Contrast Adjust (Curiosity Amplifier)
 * "Nothing is boring. You just aren't looking hard enough. Crank up the curiosity."
 * ARCHETYPE: Pattern B (Drag) — Drag to boost contrast, hidden details pop
 * ENTRY: Ambient fade — grey flat image fades in slowly
 * STEALTH KBE: Engagement depth with detailed view = Curiosity state (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Practice');
type Stage = 'flat' | 'active' | 'detailed' | 'resonant' | 'afterglow';

export default function Optician_ContrastAdjust({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('flat');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const kbe = useRef({ detailEntered: 0 });

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      kbe.current.detailEntered = Date.now();
      setStage('detailed');
      t(() => {
        const engagementMs = Date.now() - kbe.current.detailEntered;
        console.log(`[KBE:E] ContrastAdjust engagementMs=${engagementMs}`);
        setStage('resonant');
      }, 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2600);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const contrast = drag.progress;
  const details = [
    { x: 15, y: 20, label: 'patience' },
    { x: 70, y: 15, label: 'growth' },
    { x: 25, y: 70, label: 'kindness' },
    { x: 80, y: 65, label: 'humor' },
    { x: 50, y: 45, label: 'beauty' },
  ];

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'flat' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '200px', height: '140px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 3) }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>boring</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Nothing is boring. You just aren{'\u2019'}t looking hard enough. Crank up the curiosity. Find the detail.
            </div>
            <div style={{ width: '200px', height: '140px', borderRadius: radius.sm, position: 'relative', overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.04 + contrast * 0.08, 3 + contrast * 6) }}>
              {details.map((d, i) => (
                <motion.div key={i}
                  animate={{ opacity: contrast > (i + 1) * 0.18 ? 0.15 + contrast * 0.4 : 0, scale: contrast > (i + 1) * 0.18 ? 1 : 0.5 }}
                  transition={{ duration: 0.4 }}
                  style={{ position: 'absolute', top: `${d.y}%`, left: `${d.x}%`, transform: 'translate(-50%, -50%)',
                    ...navicueType.hint, fontSize: '11px',
                    color: themeColor(TH.accentHSL, 0.3 + contrast * 0.4, 10 + contrast * 10) }}>
                  {d.label}
                </motion.div>
              ))}
            </div>
            <div {...drag.dragProps}
              style={{ width: '180px', height: '28px', borderRadius: radius.full, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.06, 4), touchAction: 'none', cursor: 'grab' }}>
              <motion.div animate={{ width: `${contrast * 100}%` }}
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: radius.full,
                  background: themeColor(TH.accentHSL, 0.12, 8) }} />
              <motion.div animate={{ left: `${contrast * 100}%` }}
                style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.3, 10) }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to boost contrast</div>
          </motion.div>
        )}
        {stage === 'detailed' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '200px', height: '140px', borderRadius: radius.sm, position: 'relative', overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.12, 9) }}>
              {details.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                  transition={{ delay: i * 0.2 }}
                  style={{ position: 'absolute', top: `${d.y}%`, left: `${d.x}%`, transform: 'translate(-50%, -50%)',
                    ...navicueType.hint, fontSize: '11px',
                    color: themeColor(TH.accentHSL, 0.5, 15) }}>
                  {d.label}
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>it was never boring</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Curiosity is a perceptual amplifier. Boredom signals low contrast, not absence of detail. The prefrontal cortex, when engaged by curiosity, literally enhances visual processing acuity.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>High contrast.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}