/**
 * OPTICIAN #4 — The Inversion Goggles (Hypothesis Flip)
 * "Assume the opposite is true. Just for 10 seconds. Look at the world from the ceiling."
 * ARCHETYPE: Pattern A (Tap) — Tap to flip perspective, text inverts
 * ENTRY: Reverse reveal — insight only appears after the flip
 * STEALTH KBE: Engagement duration with inverted view = willingness to entertain (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Probe');
type Stage = 'normal' | 'active' | 'inverted' | 'resonant' | 'afterglow';

export default function Optician_InversionGoggles({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('normal');
  const [flipped, setFlipped] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const kbe = useRef({ flipTime: 0 });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const doFlip = () => {
    setFlipped(true);
    kbe.current.flipTime = Date.now();
    setStage('inverted');
    t(() => {
      const dwellMs = Date.now() - kbe.current.flipTime;
      console.log(`[KBE:K] InversionGoggles invertedDwellMs=${dwellMs}`);
      setStage('resonant');
    }, 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'normal' && (
          <motion.div key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              This is how the world looks.
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              What if the opposite is true?
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              Assume the opposite is true. Just for 10 seconds. Look at the world from the ceiling.
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={doFlip}
              style={{ padding: '12px 30px', borderRadius: radius.full, cursor: 'pointer' }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>flip</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'inverted' && (
          <motion.div key="inv" initial={{ opacity: 0, rotateX: 180 }} animate={{ opacity: 1, rotateX: 180 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px',
              transform: 'rotateX(180deg)' }}>
            <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.5, 15), textAlign: 'center',
              transform: 'rotateX(180deg)' }}>
              The opposite is also true.
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 2 }}
              style={{ ...navicueType.hint, color: palette.textFaint, transform: 'rotateX(180deg)' }}>
              sit with this for a moment
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Hypothesis inversion. Deliberately assuming the opposite activates the anterior cingulate cortex {'\u2014'} the brain{'\u2019'}s conflict detector. Perspective flexibility is the gateway to insight.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Inverted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}