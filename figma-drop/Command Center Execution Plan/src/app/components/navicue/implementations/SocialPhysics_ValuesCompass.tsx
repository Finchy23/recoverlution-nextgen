/**
 * SOCIAL PHYSICS #4 — The Values Compass
 * "The argument is the storm. Your values are the North Star. Steer North."
 * ARCHETYPE: Pattern B (Drag) — Drag "Integrity" pin to North on spinning compass
 * ENTRY: Ambient fade — compass needle spinning wildly
 * STEALTH KBE: Choosing Integrity over Winning = Value Commitment (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'active' | 'anchored' | 'resonant' | 'afterglow';

export default function SocialPhysics_ValuesCompass({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [spinDeg, setSpinDeg] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] ValuesCompass integrityChosen=true valueCommitment=confirmed`);
      setStage('anchored');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Spin compass needle when active
  useEffect(() => {
    if (stage !== 'active') return;
    const id = window.setInterval(() => {
      setSpinDeg(d => d + 15 - drag.progress * 14);
    }, 50);
    return () => clearInterval(id);
  }, [stage, drag.progress]);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div animate={{ rotate: [0, 120, 240, 360] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{ width: '3px', height: '40px', background: themeColor(TH.primaryHSL, 0.2, 8),
                borderRadius: '2px', transformOrigin: 'bottom center' }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>lost</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Ignore the storm. Drag "Integrity" to North.
            </div>
            {/* Compass */}
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%',
                border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* N marker */}
                <div style={{ position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10), fontWeight: '600' }}>N</div>
                {/* Needle */}
                <motion.div animate={{ rotate: stage === 'active' ? spinDeg : 0 }}
                  style={{ width: '2px', height: '50px', transformOrigin: 'bottom center',
                    background: `linear-gradient(to top, ${themeColor(TH.primaryHSL, 0.1, 6)}, ${themeColor(TH.accentHSL, 0.3, 10)})`,
                    borderRadius: '1px', position: 'absolute', top: '10px', left: '50%', marginLeft: '-1px' }} />
              </div>
            </div>
            {/* Drag zone for Integrity pin */}
            <div ref={drag.containerRef} style={{ width: '200px', height: '60px', touchAction: 'none' }}>
              <motion.div {...drag.dragProps}
                style={{ padding: '8px 20px', borderRadius: radius.lg, cursor: 'grab', display: 'inline-block',
                  background: themeColor(TH.accentHSL, 0.06 + drag.progress * 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1 + drag.progress * 0.1, 8)}`,
                  margin: '0 auto' }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.3 + drag.progress * 0.2, 12) }}>
                  Integrity {drag.progress > 0.3 ? `${Math.round(drag.progress * 100)}%` : ''}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'anchored' && (
          <motion.div key="anc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%',
              border: `2px solid ${themeColor(TH.accentHSL, 0.2, 12)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 20px ${themeColor(TH.accentHSL, 0.06, 8)}` }}>
              <div style={{ width: '2px', height: '50px', background: themeColor(TH.accentHSL, 0.4, 15),
                borderRadius: '1px', position: 'absolute' }} />
              <div style={{ position: 'absolute', top: '15px', fontSize: '11px', fontWeight: '600',
                color: themeColor(TH.accentHSL, 0.5, 15) }}>N</div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The needle is steady. Your values held through the storm.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Value commitment. When the argument is the storm, your values are the North Star. Choosing integrity over winning is the hallmark of principled conflict engagement.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>True North.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}