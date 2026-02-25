/**
 * BROADCAST #4 — The Color Bath
 * "Soak in the pink. It drains the aggression."
 * ARCHETYPE: Pattern B (Drag) — Drag to fill the screen with Baker-Miller Pink
 * ENTRY: Ambient Fade — a soft pink edge-glow creeps in
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart(
  'sensory_cinema',
  'Metacognition',
  'believing',
  'Practice'
);
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Broadcast_ColorBath({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
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
    t(() => setStage('active'), 2600);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const progress = drag.progress;
  // Baker-Miller Pink: roughly hsla(350, 50%, 75%, ...)
  const pinkAlpha = progress * 0.15;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ opacity: [0.02, 0.05, 0.02] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ width: '200px', height: '140px', borderRadius: radius.md,
                background: 'radial-gradient(circle, hsla(350, 45%, 72%, 0.04), transparent)' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a blush at the edges</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Soak in the pink. It drains the aggression. Just let the light hit your retinas. Drag the color until it fills the frame.
            </div>
            <div style={{
              width: '200px', height: '130px', borderRadius: radius.md, position: 'relative', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, 2),
            }}>
              {/* Pink fill rising from center */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: radius.md,
                background: `radial-gradient(circle, hsla(350, 50%, 75%, ${pinkAlpha}), hsla(350, 40%, 68%, ${pinkAlpha * 0.6}), transparent)`,
                transition: 'background 0.2s',
              }} />
              {/* Inner glow at high progress */}
              {progress > 0.5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: (progress - 0.5) * 0.1 }}
                  style={{ position: 'absolute', inset: '20px', borderRadius: radius.sm,
                    background: 'hsla(350, 45%, 72%, 0.06)' }} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>empty</div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>flooded</div>
            </div>
            <div {...drag.dragProps} style={{ ...drag.dragProps.style, width: '200px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3) }}>
              <motion.div
                style={{
                  position: 'absolute', top: '3px', left: `${5 + progress * 155}px`,
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: `hsla(350, 45%, ${65 + progress * 10}%, ${0.1 + progress * 0.15})`,
                  pointerEvents: 'none',
                }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Chromotherapy. Baker-Miller Pink (P-618) has been observed to lower heart rate and reduce aggression in subjects within minutes. The color doesn{'\u2019'}t ask for your attention {'\u2014'} it acts on the retina directly. You just bathed your nervous system in the gentlest frequency visible.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Bathed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}