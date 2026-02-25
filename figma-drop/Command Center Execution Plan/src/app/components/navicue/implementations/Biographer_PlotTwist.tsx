/**
 * BIOGRAPHER #6 — The Plot Twist (Cognitive Reappraisal)
 * "This isn't the end of the movie. It's the inciting incident for Act 3."
 * ARCHETYPE: Pattern A (Tap) — Failure card spins into Plot Twist card
 * ENTRY: Cold open — "FAILURE" notification appears abruptly
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'active' | 'flipping' | 'resonant' | 'afterglow';

export default function Biographer_PlotTwist({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [flipped, setFlipped] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 1400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const flip = () => {
    if (flipped) return;
    setFlipped(true);
    setStage('flipping');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ padding: '14px 28px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.15, 6),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 4)}` }}>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', letterSpacing: '0.15em',
              color: themeColor(TH.accentHSL, 0.25, 6) }}>FAILURE</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              This isn't the end of the movie. It's the inciting incident for Act 3. This forces the character to move.
            </div>
            <motion.div onClick={flip} whileTap={{ scale: 0.95 }}
              animate={!flipped ? { rotateY: [0, 5, -5, 0] } : {}}
              transition={{ duration: 3, repeat: flipped ? 0 : Infinity }}
              style={{ width: '120px', height: '80px', borderRadius: radius.md, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.15, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                perspective: '400px' }}>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', letterSpacing: '0.15em',
                color: themeColor(TH.accentHSL, 0.25, 6) }}>FAILURE</div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to flip</div>
          </motion.div>
        )}
        {stage === 'flipping' && (
          <motion.div key="fl" initial={{ rotateY: 0 }} animate={{ rotateY: 180 }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
              style={{ width: '140px', height: '90px', borderRadius: radius.md,
                background: themeColor(TH.accentHSL, 0.12, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.15, 12)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 30px ${themeColor(TH.accentHSL, 0.06, 8)}` }}>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', letterSpacing: '0.12em',
                color: themeColor(TH.accentHSL, 0.45, 18) }}>PLOT TWIST</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>action.</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive Reappraisal. Interpreting a stressor as a necessary narrative device for character development recruits the prefrontal cortex to dampen the amygdala response. It was never the ending. It was the twist.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Plot twist.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}