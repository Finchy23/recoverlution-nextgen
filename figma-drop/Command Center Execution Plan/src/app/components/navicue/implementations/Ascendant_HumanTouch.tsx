/**
 * ASCENDANT #8 -- The Human Touch
 * "One hug is worth a century of silence."
 * Pattern C (Hold) -- Hold to grasp a reaching hand; warmth spreads
 * STEALTH KBE: Performing grasp gesture = Social Connection (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Integrated Living', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'reaching' | 'connected' | 'resonant' | 'afterglow';

export default function Ascendant_HumanTouch({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 4000,
    onComplete: () => {
      console.log(`[KBE:E] HumanTouch socialConnection=confirmed embodiedConnection=true`);
      setStage('connected');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('reaching'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '12px', height: '14px', borderRadius: '3px',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'reaching' && (
          <motion.div key="re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A hand reaching out. Grasp it. Hold on.
            </div>
            {/* Reaching hand */}
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <svg width="40" height="50" viewBox="0 0 40 50">
                <rect x="16" y="20" width="8" height="30" rx="3"
                  fill={themeColor(TH.accentHSL, 0.05 + hold.progress * 0.04, 3)} />
                {[0, 1, 2, 3].map(i => (
                  <rect key={i} x={8 + i * 7} y={8 + Math.abs(i - 1.5) * 3} width="5" height="16" rx="2"
                    fill={themeColor(TH.accentHSL, 0.05 + hold.progress * 0.04, 3)} />
                ))}
              </svg>
            </motion.div>
            {hold.isHolding && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 + hold.progress * 0.5, opacity: hold.progress * 0.06 }}
                style={{ position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.04, 4) }} />
            )}
            <motion.div {...hold.holdProps}
              style={immersiveHoldPillThemed(TH.accentHSL).container(hold.progress)}>
              <div style={immersiveHoldPillThemed(TH.accentHSL).label(hold.progress)}>
                {hold.isHolding ? `Holding... ${Math.round(hold.progress * 100)}%` : 'Hold to Grasp'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'connected' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Connection. Warmth spread from the point of contact. You can meditate for a thousand years, but one hug is worth a century of silence. We are wired for touch. The hand reached out and you reached back -- that{"'"}s the fundamental unit of human connection. All the wisdom in the world means nothing without someone to share it with.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The neuroscience of touch. C-tactile afferents: specialized nerve fibers that respond specifically to gentle, stroking touch and activate the insular cortex (emotion/interoception). Oxytocin release: physical contact triggers oxytocin, reducing cortisol and blood pressure. Harry Harlow{"'"}s primate studies: infant monkeys chose a soft cloth "mother" over a wire one with food, demonstrating that contact comfort is a primary need. Isolation and touch deprivation are as damaging to health as smoking 15 cigarettes a day (Holt-Lunstad, 2010).
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Held.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}