/**
 * THRESHOLD #1 — The Doorway
 * "You don't have to enter. You don't have to leave."
 * ARCHETYPE: Pattern E (Hold) — Hold to stand in the doorway without crossing
 * ENTRY: Ambient Fade — a vertical line slowly materializes, splitting the dark
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Threshold_Doorway({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 7000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 3000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tension = hold.tension;
  const lineGlow = 0.04 + tension * 0.12;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div
              animate={{ opacity: [0.02, 0.06, 0.02] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '1px', height: '140px', background: themeColor(TH.accentHSL, 0.08, 5) }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.8 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a line appears</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You don't have to enter. You don't have to leave. The doorway itself is the room you've been looking for. Stand here. Let both sides exist.
            </div>
            <div style={{ position: 'relative', width: '80px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                animate={{ opacity: [lineGlow, lineGlow + 0.03, lineGlow] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  width: '1px', height: `${100 + tension * 60}px`,
                  background: `linear-gradient(to bottom, transparent, ${themeColor(TH.accentHSL, lineGlow + 0.06, 8)}, transparent)`,
                  transition: 'height 0.6s',
                }} />
              <motion.div style={{
                position: 'absolute', width: `${30 + tension * 20}px`, height: `${30 + tension * 20}px`,
                borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.04 + tension * 0.06, 5)}, transparent)`,
                transition: 'width 0.5s, height 0.5s',
              }} />
            </div>
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              padding: '14px 28px', borderRadius: radius.full,
              background: themeColor(TH.primaryHSL, 0.05 + tension * 0.06, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06 + tension * 0.08, 5)}`,
            }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {hold.completed ? 'you stayed' : hold.isHolding ? 'standing\u2026' : 'hold to stand in the doorway'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Liminal space. The threshold is not emptiness {':'} it is fullness. It contains both the room you left and the room you haven't entered. The most powerful position is often the one between two certainties.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Between.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}