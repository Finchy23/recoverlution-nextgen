/**
 * SOCIAL PHYSICS #9 — The Perspective Drone
 * "From here, the fight is invisible. Is this a hill to die on?"
 * ARCHETYPE: Pattern B (Drag) — Swipe up to fly camera 1,000 feet
 * ENTRY: Scene-first — first-person argument view
 * STEALTH KBE: Drop in importance rating = Perspective Shift (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'ground' | 'flying' | 'aerial' | 'resonant' | 'afterglow';

export default function SocialPhysics_PerspectiveDrone({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onComplete: () => {
      console.log(`[KBE:K] PerspectiveDrone altitudeReached=true perspectiveShift=confirmed`);
      setStage('aerial');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    },
  });

  useEffect(() => {
    t(() => setStage('ground'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const startFlight = () => { if (stage === 'ground') setStage('flying'); };

  const altitude = Math.round(drag.progress * 1000);
  const figureScale = Math.max(0.1, 1 - drag.progress * 0.9);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '30px' }}>
              <div style={{ width: '14px', height: '20px', borderRadius: radius.xs, background: 'hsla(0, 30%, 40%, 0.3)' }} />
              <div style={{ width: '14px', height: '20px', borderRadius: radius.xs, background: themeColor(TH.accentHSL, 0.2, 8) }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>argument in progress</div>
          </motion.div>
        )}
        {stage === 'ground' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Does this matter in 5 years? Swipe up to find out.
            </div>
            <div style={{ display: 'flex', gap: '30px' }}>
              <div style={{ width: '16px', height: '22px', borderRadius: radius.xs, background: 'hsla(0, 30%, 40%, 0.3)' }} />
              <div style={{ width: '16px', height: '22px', borderRadius: radius.xs, background: themeColor(TH.accentHSL, 0.2, 8) }} />
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={startFlight}
              style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Launch drone</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'flying' && (
          <motion.div key="fly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 10) }}>
              {altitude} ft
            </div>
            {/* Shrinking figures */}
            <div style={{ display: 'flex', gap: `${30 * figureScale}px`, transition: 'gap 0.1s' }}>
              <motion.div animate={{ scale: figureScale }}
                style={{ width: '16px', height: '22px', borderRadius: radius.xs, background: 'hsla(0, 30%, 40%, 0.3)' }} />
              <motion.div animate={{ scale: figureScale }}
                style={{ width: '16px', height: '22px', borderRadius: radius.xs, background: themeColor(TH.accentHSL, 0.2, 8) }} />
            </div>
            <div ref={drag.containerRef} style={{ width: '200px', height: '80px', touchAction: 'none' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'grab', margin: '0 auto',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '12px' }}>{'\u2191'}</div>
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to ascend</div>
          </motion.div>
        )}
        {stage === 'aerial' && (
          <motion.div key="aer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 10) }}>1,000 ft</div>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '2px', height: '3px', borderRadius: '1px', background: 'hsla(0, 30%, 40%, 0.15)' }} />
              <div style={{ width: '2px', height: '3px', borderRadius: '1px', background: themeColor(TH.accentHSL, 0.1, 6) }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              From here, the fight is invisible. A bump in the road, not a hill to die on.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Temporal scale perspective. Solomon{"'"}s Paradox: we give better advice to others because we see their problems from above. The drone is your Solomon view. Altitude creates wisdom.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ascended.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}