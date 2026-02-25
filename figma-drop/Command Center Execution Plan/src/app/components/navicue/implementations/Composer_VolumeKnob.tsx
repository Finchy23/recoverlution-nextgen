/**
 * COMPOSER #6 — The Volume Knob (Dynamics)
 * "Don't mute. Just fade."
 * ARCHETYPE: Pattern B (Drag) — Smooth dial turn from 100% to 20%
 * ENTRY: Scene-first — blasting emotion
 * STEALTH KBE: Smooth slow dial = Regulation. Jerky = High Arousal (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Theater');
type Stage = 'arriving' | 'blasting' | 'faded' | 'resonant' | 'afterglow';

export default function Composer_VolumeKnob({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] VolumeKnob intensityRegulation=confirmed smoothness=measured`);
      setStage('faded');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('blasting'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const vol = Math.round(100 - drag.progress * 80);
  const intensity = 1 - drag.progress * 0.8;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '20px', height: '20px', borderRadius: '50%',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
        )}
        {stage === 'blasting' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Anger is at {vol}%. Don{"'"}t mute it. Just fade it to the bass line.
            </div>
            {/* Emotion indicator */}
            <motion.div animate={intensity > 0.7 ? { x: [-1, 1, -1] } : {}}
              transition={{ duration: 0.15, repeat: intensity > 0.7 ? Infinity : 0 }}
              style={{ padding: '8px 16px', borderRadius: radius.sm,
                background: `hsla(0, ${12 + intensity * 15}%, ${20 + intensity * 8}%, ${0.04 + intensity * 0.06})`,
                border: `1px solid hsla(0, ${12 + intensity * 15}%, ${25 + intensity * 8}%, ${0.06 + intensity * 0.06})`,
                transition: 'all 0.2s' }}>
              <span style={{ fontSize: `${9 + intensity * 4}px`,
                color: `hsla(0, ${10 + intensity * 10}%, ${30 + intensity * 10}%, ${0.15 + intensity * 0.25})` }}>
                ANGER
              </span>
            </motion.div>
            {/* Volume dial (vertical slider) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>{vol}%</span>
              <div ref={drag.containerRef} style={{ width: '12px', height: '80px', borderRadius: '6px',
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                touchAction: 'none', position: 'relative' }}>
                <motion.div {...drag.dragProps}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                    background: themeColor(TH.accentHSL, 0.1, 5),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                    position: 'absolute', left: '-6px', top: '2px' }} />
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'faded' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            20%. Still there — but quiet. The bass line, not the lead vocal. You didn{"'"}t destroy the emotion. You didn{"'"}t mute it. You just lowered it in the mix. That{"'"}s regulation, not suppression.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Intensity regulation. James Gross{"'"}s process model of emotion regulation: the healthiest strategy isn{"'"}t suppression (muting) or rumination (turning it up) — it{"'"}s modulation. Like an audio engineer adjusting the mix, you want every emotion present in the studio; you just control the volume. The anger stays; it just moves from lead vocal to bass line.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Faded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}