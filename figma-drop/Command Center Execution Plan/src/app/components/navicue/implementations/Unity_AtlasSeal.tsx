/**
 * OMEGA #10 — The Atlas Seal (Specimen #1000)
 * A single point of golden light expands into a full circle, then resolves.
 * "You are the atlas. You always were."
 * Science: Self-Actualization — Maslow's final peak, the fully integrated self.
 * STEALTH KBE: Presence alone = Self-Actualization (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Self-Actualization', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'symbol' | 'resonant' | 'afterglow';

export default function Unity_AtlasSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('symbol'), 2200);
    t(() => {
      console.log(`[KBE:K] AtlasSeal present=true selfActualization=true specimen=1000`);
      setStage('resonant');
    }, 10000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 15000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Actualization" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.06 }} exit={{ opacity: 0 }}>
            <div style={{ width: '2px', height: '2px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.08, 4) }} />
          </motion.div>
        )}
        {stage === 'symbol' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            {/* Golden circle — the Atlas Seal */}
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 4, ease: 'easeOut' }}>
              <svg viewBox="0 0 120 120" width="120" height="120">
                <motion.circle cx="60" cy="60" r="50" fill="none"
                  stroke={themeColor(TH.accentHSL, 0.25, 14)}
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 4, ease: 'easeInOut' }} />
                {/* Inner dot — the self */}
                <motion.circle cx="60" cy="60" r="2"
                  fill={themeColor(TH.accentHSL, 0.3, 16)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3, duration: 2 }} />
              </svg>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4, duration: 2 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              You are the atlas. You always were.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '320px' }}>
            Abraham Maslow (1971): "A musician must make music, an artist must paint, a poet must write, if he is to be ultimately at peace with himself. What a man can be, he must be." One thousand moments of attention. One thousand small acts of awareness. You did not consume this atlas. You became it. The map and the territory are one.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
              {'\u221E'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}