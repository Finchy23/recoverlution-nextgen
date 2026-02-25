/**
 * TUNER #1 — The Delta Drop
 * "Do not think. Just sync."
 * ARCHETYPE: Pattern E (Hold) — Hold to drop into delta, screen pulses at 0.5Hz
 * ENTRY: Ambient Fade — screen dims to near-black, a single slow pulse emerges
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Tuner_DeltaDrop({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [pulsePhase, setPulsePhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2800);
    const pulse = setInterval(() => setPulsePhase(p => p + 1), 2000); // 0.5Hz
    return () => { T.current.forEach(clearTimeout); clearInterval(pulse); };
  }, []);

  const tension = hold.tension;
  const pulseOpacity = 0.04 + Math.sin(pulsePhase * Math.PI) * 0.03 + tension * 0.08;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div
              animate={{ opacity: [0.02, 0.06, 0.02] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '160px', height: '160px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.08, 5) }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the basement is quiet</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Do not think. Just sync. Let your heartbeat slow down to match the light. Drop into the basement. The brain follows external rhythm when you stop resisting it.
            </div>
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [pulseOpacity, pulseOpacity + 0.04, pulseOpacity] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: `${140 + tension * 40}px`, height: `${140 + tension * 40}px`, borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.12 + tension * 0.15, 8)}, ${themeColor(TH.voidHSL, 0.02, 0)})`,
                transition: 'width 0.5s, height 0.5s',
              }} />
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              padding: '14px 28px', borderRadius: radius.full,
              background: themeColor(TH.primaryHSL, 0.06 + tension * 0.08, 5),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08 + tension * 0.1, 5)}`,
            }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {hold.completed ? 'descended' : hold.isHolding ? 'sinking\u2026' : 'hold to descend'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Frequency Following Response. Your brain synchronized its dominant wave to the external pulse. Delta waves live at 0.5{'\u2013'}4Hz {':'} the frequency of dreamless, restorative sleep. You just gave your cortex permission to descend to the basement where repair happens.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Deep.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}