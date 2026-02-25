/**
 * SOCIAL PHYSICS #1 — The Energy Redirect
 * "If you push back, you create a collision. If you pull, you create a dance."
 * ARCHETYPE: Pattern B (Drag) — Curve a red arrow into a green circle
 * ENTRY: Cold open — red arrow flies at you
 * STEALTH KBE: Gesture smoothness. Smooth curve = Somatic Regulation (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'active' | 'redirected' | 'resonant' | 'afterglow';

export default function SocialPhysics_EnergyRedirect({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const gestureStart = useRef(0);

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onComplete: () => {
      const elapsed = Date.now() - gestureStart.current;
      const smoothness = Math.min(1, elapsed / 1200);
      console.log(`[KBE:E] EnergyRedirect smoothness=${smoothness.toFixed(2)} somaticRegulation=${smoothness > 0.4}`);
      setStage('redirected');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => { setStage('active'); gestureStart.current = Date.now(); }, 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div animate={{ y: ['-30px', '0px'] }} transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ width: '3px', height: '50px', background: 'hsla(0, 50%, 45%, 0.5)', borderRadius: '2px' }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>incoming</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Do not block. Blend. Curve the energy into the circle.
            </div>
            {/* Target circle */}
            <div style={{ position: 'relative', width: '200px', height: '160px' }}>
              <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)',
                width: '60px', height: '60px', borderRadius: '50%',
                border: `2px solid ${themeColor(TH.accentHSL, 0.2, 10)}`,
                background: themeColor(TH.accentHSL, 0.04, 4) }} />
              {/* Drag zone */}
              <div ref={drag.containerRef}
                style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
                  width: '60px', height: '160px', touchAction: 'none' }}>
                <motion.div {...drag.dragProps}
                  animate={{ y: drag.progress * 100, opacity: 1 - drag.progress * 0.3,
                    background: `hsla(${drag.progress * 175}, ${20 + drag.progress * 30}%, ${40 + drag.progress * 10}%, ${0.4 + drag.progress * 0.2})` }}
                  style={{ width: '12px', height: '12px', borderRadius: '50%', cursor: 'grab',
                    margin: '0 auto', background: 'hsla(0, 50%, 45%, 0.5)' }} />
              </div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {drag.isDragging ? `redirecting... ${Math.round(drag.progress * 100)}%` : 'drag downward to blend'}
            </div>
          </motion.div>
        )}
        {stage === 'redirected' && (
          <motion.div key="rd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '60px', height: '60px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 8),
                border: `2px solid ${themeColor(TH.accentHSL, 0.2, 12)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.4, 15) }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The collision became a dance. The anger became a question.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Aikido redirection. Take their anger and turn it into a question. A smooth gesture indicates somatic regulation: the body learned before the mind understood.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Redirected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}