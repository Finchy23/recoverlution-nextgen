/**
 * ZERO POINT #10 — The Zero Seal (The Proof)
 * A perfect circle in white light on a black background. It fades to black.
 * "Zero is not empty. Zero is the origin."
 * Science: Vacuum State — in QFT, the vacuum seethes with potential energy.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Vacuum State', 'knowing', 'Ocean');
type Stage = 'arriving' | 'symbol' | 'resonant' | 'afterglow';

export default function Void_ZeroSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('symbol'), 2200);
    t(() => setStage('resonant'), 9000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 15000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Vacuum State" kbe="knowing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} exit={{ opacity: 0 }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.05, 2) }} />
          </motion.div>
        )}
        {stage === 'symbol' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Perfect circle — drawn in light */}
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 3 }}>
              <svg viewBox="0 0 100 100" width="100" height="100">
                <motion.circle cx="50" cy="50" r="40" fill="none"
                  stroke={themeColor(TH.accentHSL, 0.2, 12)}
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, ease: 'easeInOut' }} />
              </svg>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3, duration: 2 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Zero is not empty. Zero is the origin.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            In quantum field theory, the vacuum state is not empty; it seethes with virtual particles and potential energy (Casimir effect, 1948). The zero-point energy of the universe is infinite. Emptiness is fullness waiting to express. Zero is the seed of all numbers.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>0</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}