/**
 * SCHRODINGER #10 — The Box Seal (The Proof)
 * "You looked. And because you looked, it became real."
 * ARCHETYPE: Pattern A (Tap) — Tap the box, the cat winks
 * ENTRY: Ambient Fade — an open box slowly materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'ambient' | 'active' | 'wink' | 'resonant' | 'afterglow';

export default function Schrodinger_BoxSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const look = () => {
    if (stage !== 'active') return;
    setStage('wink');
    t(() => setStage('resonant'), 4000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 9000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ opacity: [0.03, 0.07, 0.03] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '80px', height: '50px', borderRadius: `${radius.sm} ${radius.sm} 0 0`,
                borderTop: `1px solid ${themeColor(TH.accentHSL, 0.06, 8)}`,
                borderLeft: `1px solid ${themeColor(TH.accentHSL, 0.04, 6)}`,
                borderRight: `1px solid ${themeColor(TH.accentHSL, 0.04, 6)}` }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a box, open</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              An open box. Look inside. What you find depends entirely on whether you look.
            </div>
            <motion.div onClick={look} whileTap={{ scale: 0.97 }}
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '100px', height: '80px', borderRadius: radius.sm, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.1, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 10)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                color: themeColor(TH.accentHSL, 0.12, 10) }}>LOOK</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'wink' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ fontSize: '40px', lineHeight: 1 }}>
              <motion.span animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.5, delay: 1.2 }}>
                {'\ud83d\ude3a'}
              </motion.span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.15em',
                color: themeColor(TH.accentHSL, 0.3, 15) }}>
              I AM ALIVE
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>
              You looked. And because you looked, it became real.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Observer Effect. The act of measurement affects the system being measured. Your attention is not passive: it is a creative act. What you observe, you bring into existence.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Observed. Alive.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}