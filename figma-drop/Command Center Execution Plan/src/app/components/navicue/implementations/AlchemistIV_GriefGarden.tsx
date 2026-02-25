/**
 * ALCHEMIST IV #2 - The Grief Garden
 * "Sorrow digs the hole deep so the roots can go down."
 * Pattern C (Hold) - Hold to water the barren soil; flowers grow
 * STEALTH KBE: Hold duration correlates with Affect Tolerance (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Emotional Regulation', 'embodying', 'Ember');
type Stage = 'arriving' | 'barren' | 'blooming' | 'resonant' | 'afterglow';

export default function AlchemistIV_GriefGarden({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 4000,
    onComplete: () => {
      console.log(`[KBE:E] GriefGarden affectTolerance=confirmed somaticProcessing=true holdDuration=4s`);
      setStage('blooming');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('barren'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '8px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'barren' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Barren soil. Plant tears. Hold to water. Watch what grows from the grief.
            </div>
            {/* Soil patch with growth indicator */}
            <div style={{ position: 'relative', width: '100px', height: '50px' }}>
              <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '14px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              {hold.progress > 0.2 && (
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: hold.progress }}
                  style={{ position: 'absolute', bottom: '14px', left: '48px', width: '4px', height: '28px',
                    background: themeColor(TH.accentHSL, 0.06 + hold.progress * 0.04, 3),
                    borderRadius: '2px', transformOrigin: 'bottom' }} />
              )}
              {hold.progress > 0.6 && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.08, scale: 1 }}
                  style={{ position: 'absolute', bottom: '36px', left: '40px',
                    width: '20px', height: '16px', borderRadius: '50%',
                    background: 'hsla(280, 20%, 35%, 0.08)' }} />
              )}
            </div>
            <motion.div {...hold.holdProps}
              style={immersiveHoldPillThemed(TH.accentHSL).container(hold.progress)}>
              <div style={immersiveHoldPillThemed(TH.accentHSL).label(hold.progress)}>
                {hold.isHolding ? `Watering... ${Math.round(hold.progress * 100)}%` : 'Hold to Water'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'blooming' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Dark, beautiful purple flowers. Depth. Sorrow digs the hole deep so the roots can go down. Do not pave over the grief - plant in it. The flowers that grow from tears have the deepest roots and the most striking colors. Grief is not a problem to solve. It is a garden to tend.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Post-traumatic growth. Tedeschi & Calhoun{"'"}s research: people who process grief (not avoid it) report enhanced appreciation for life, improved relationships, increased personal strength, new possibilities, and spiritual development. The key word is "process" - grief must move through the body. Holding space for sorrow is not weakness; it is the prerequisite for depth.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Bloomed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}