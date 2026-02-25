/**
 * BROADCAST #1 — The Circadian Tint
 * "The sun has set. Why is your screen still noon?"
 * ARCHETYPE: Pattern B (Drag) — Drag the sun below the horizon, screen shifts blue→amber
 * ENTRY: Ambient Fade — screen slowly warms from cold blue
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Broadcast_CircadianTint({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'y',
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
  const hue = 210 - progress * 180; // blue → amber
  const sat = 15 + progress * 20;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ opacity: [0.03, 0.06, 0.03] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ width: '200px', height: '100px', borderRadius: radius.sm, background: 'hsla(210, 15%, 20%, 0.08)' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>still noon</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The sun has set. Why is your screen still noon? I am bringing the fire. Your eyes need the dusk. Drag the sun down below the horizon.
            </div>
            <div style={{
              width: '200px', height: '120px', borderRadius: radius.sm, position: 'relative', overflow: 'hidden',
              background: `linear-gradient(to bottom, hsla(${hue}, ${sat}%, ${18 + progress * 8}%, 0.12), hsla(${hue - 20}, ${sat + 5}%, ${12 + progress * 6}%, 0.06))`,
              transition: 'background 0.3s',
            }}>
              {/* Horizon line */}
              <div style={{
                position: 'absolute', bottom: '30px', left: 0, width: '100%', height: '1px',
                background: `hsla(${hue}, ${sat}%, 40%, ${0.08 + progress * 0.1})`,
              }} />
              {/* Sun */}
              <motion.div
                style={{
                  position: 'absolute', left: '85px',
                  top: `${20 + progress * 80}px`,
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: `radial-gradient(circle, hsla(${hue + 20}, ${sat + 10}%, ${50 - progress * 15}%, ${0.2 - progress * 0.1}), transparent)`,
                  transition: 'top 0.3s',
                }} />
            </div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '60px', height: '100px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3),
            }}>
              <motion.div
                style={{
                  position: 'absolute', left: '12px', top: `${10 + progress * 50}px`,
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `hsla(${hue + 20}, ${sat + 10}%, 35%, ${0.1 + progress * 0.12})`,
                  pointerEvents: 'none',
                }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Melatonin Suppression. Blue light at 460nm suppresses melatonin production. Shifting the display spectrum to long-wavelength light allows the natural onset of sleep hormones without requiring you to stop using the device. The dusk has arrived on your screen.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Dusk.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}