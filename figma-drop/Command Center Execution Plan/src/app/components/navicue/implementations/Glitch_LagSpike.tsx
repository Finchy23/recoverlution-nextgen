/**
 * GLITCH #4 — The Lag Spike
 * "Why are you angry at a screen? It is 3 seconds. Breathe in the gap."
 * ARCHETYPE: Pattern E (Hold) — Screen freezes, patience is the interaction
 * ENTRY: Cold Open — interface appears to crash
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'freeze' | 'thaw' | 'active' | 'resonant' | 'afterglow';

export default function Glitch_LagSpike({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('freeze');
  const [dots, setDots] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    // Fake lag: show frozen state for 3 seconds
    const dotInterval = window.setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    t(() => {
      clearInterval(dotInterval);
      setStage('thaw');
      t(() => setStage('active'), 800);
    }, 3500);
    return () => { T.current.forEach(clearTimeout); clearInterval(dotInterval); };
  }, []);

  const breathe = () => {
    if (stage !== 'active') return;
    setStage('resonant');
    t(() => { setStage('afterglow'); onComplete?.(); }, 6000);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'freeze' && (
          <motion.div key="f" initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 10) }}>
              Loading{dots}
            </div>
            <motion.div animate={{ width: ['0%', '60%', '60%'] }}
              transition={{ duration: 3.5, times: [0, 0.5, 1] }}
              style={{ height: '2px', background: themeColor(TH.accentHSL, 0.15, 8), borderRadius: '1px', maxWidth: '200px' }} />
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, marginTop: '8px' }}>
              not responding
            </div>
          </motion.div>
        )}
        {stage === 'thaw' && (
          <motion.div key="th" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ fontFamily: 'monospace', fontSize: '12px', color: themeColor(TH.accentHSL, 0.3, 12) }}>
            ...caught up.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              That was three seconds. How did your body react? Did your jaw clench? Your breath catch? The lag was artificial. The frustration was real. Where is the fire?
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>Patience.</div>
            <motion.div onClick={breathe} whileTap={{ scale: 0.97 }}
              style={{ padding: '14px 24px', borderRadius: radius.xl, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 8)}` }}>
              <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 12) }}>breathe</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Frustration tolerance training. Minor, artificial frustrations in a low-stakes environment build the capacity to handle real frustrations with grace. Three seconds. That's all it takes to reveal your relationship with control.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Three seconds.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}