/**
 * THRESHOLD #3 — The Dawn Watch
 * "Find the exact second night becomes day."
 * ARCHETYPE: Pattern B (Drag) — Drag the horizon between night and day
 * ENTRY: Scene-first — a gradient sky appears, user discovers they can move it
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Threshold_DawnWatch({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const p = drag.progress;
  const skyHue = 240 - p * 200;
  const skyLight = 6 + p * 18;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '240px', height: '100px', borderRadius: radius.sm,
              background: 'linear-gradient(to bottom, hsla(240, 15%, 6%, 0.12), hsla(240, 10%, 4%, 0.06))' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>still dark</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '6px' }}>
              Find the exact second night becomes day. Drag the sky forward. When did it stop being dark?
            </div>
            <div style={{
              width: '240px', height: '120px', borderRadius: radius.sm, overflow: 'hidden', position: 'relative',
              background: `linear-gradient(to bottom, hsla(${skyHue}, ${12 + p * 10}%, ${skyLight}%, 0.15), hsla(${skyHue + 20}, ${8 + p * 8}%, ${skyLight - 3}%, 0.06))`,
              transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', bottom: '25px', left: 0, width: '100%', height: '1px',
                background: `hsla(${skyHue - 30}, 20%, ${30 + p * 20}%, ${0.05 + p * 0.1})`,
              }} />
              {p > 0.3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: p * 0.15 }}
                  style={{
                    position: 'absolute', left: '50%', bottom: `${20 + p * 30}px`, transform: 'translateX(-50%)',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: `radial-gradient(circle, hsla(40, 40%, 50%, ${p * 0.12}), transparent)`,
                  }} />
              )}
            </div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '200px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3),
            }}>
              <motion.div style={{
                position: 'absolute', left: `${p * 160}px`, top: '4px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08 + p * 0.08, 6),
                pointerEvents: 'none',
              }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              There is no exact second. Dawn is not a switch {';'} it{'\u2019'}s a gradient. Every threshold you{'\u2019'}ve ever crossed was like this: not a line but a zone. You were already becoming the next thing before you noticed.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Gradual.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}