/**
 * SCHRODINGER #5 — The Quantum Coin (50/50)
 * "While it spins, you secretly know what you hope it lands on. That hope is your truth."
 * ARCHETYPE: Pattern A (Tap) — Tap to stop the spinning coin
 * ENTRY: Reverse Reveal — result shown first, then the real insight
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'arriving' | 'spinning' | 'stopped' | 'resonant' | 'afterglow';

export default function Schrodinger_QuantumCoin({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('spinning'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const stop = () => {
    if (result) return;
    const r = Math.random() > 0.5 ? 'heads' : 'tails';
    setResult(r);
    setStage('stopped');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 9500);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: palette.textFaint }}>heads: forgive. tails: forget.</motion.div>
        )}
        {stage === 'spinning' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Heads: Forgive. Tails: Forget. While it spins, notice what you secretly hope for. That hope is your truth. The coin just reveals it.
            </div>
            <motion.div onClick={stop}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
              style={{ width: '70px', height: '70px', borderRadius: '50%', cursor: 'pointer',
                background: `radial-gradient(circle at 35% 35%, ${themeColor(TH.accentHSL, 0.2, 20)}, ${themeColor(TH.primaryHSL, 0.15, 8)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 15)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to stop</div>
          </motion.div>
        )}
        {stage === 'stopped' && result && (
          <motion.div key="st" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.12, 6),
              border: `1px solid ${themeColor(TH.accentHSL, 0.15, 12)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                color: themeColor(TH.accentHSL, 0.35, 15) }}>
                {result === 'heads' ? 'H' : 'T'}
              </div>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.15em',
              color: themeColor(TH.accentHSL, 0.3, 12) }}>
              {result === 'heads' ? 'FORGIVE' : 'FORGET'}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              But what did you hope for while it was spinning?
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Affective forecasting. The moment of uncertainty forces your subconscious preference to surface as a distinct emotional wish. The coin didn't decide; it revealed what you already knew.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The hope was the answer.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}