/**
 * LOOP BREAKER #1 — The Iteration Counter
 * "Do not judge the argument. Just count it."
 * ARCHETYPE: Pattern A (Tap) — Each tap increments the mechanical counter
 * ENTRY: Cold Open — "43" appears, then the counter materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function LoopBreaker_IterationCounter({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [count, setCount] = useState(43);
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const click = () => {
    if (stage !== 'active' || taps >= 3) return;
    const n = taps + 1;
    setTaps(n);
    setCount(c => c + 1);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ fontSize: '48px', fontFamily: 'monospace', color: palette.text, textAlign: 'center', letterSpacing: '0.05em' }}>
            43
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={click}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: taps >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              You are having the same argument again. Do not judge it. Just count it. Awareness is the first step of breaking the orbit. Click the counter.
            </div>
            <motion.div
              animate={{ scale: taps > 0 ? [1, 1.05, 1] : 1 }}
              style={{
                width: '120px', height: '80px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.08, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <motion.div
                key={count}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ fontSize: '36px', fontFamily: 'monospace', color: palette.text }}>
                {count}
              </motion.div>
            </motion.div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} style={{ width: '24px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.4, 10) : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
            {taps < 3 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>click</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Loop #{count}. Simply tracking it changes it: the Hawthorne Effect turned inward. You didn{'\u2019'}t fix anything. You just started watching. And the watching itself is the intervention. The pattern can{'\u2019'}t hide when it has a number.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Counted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}