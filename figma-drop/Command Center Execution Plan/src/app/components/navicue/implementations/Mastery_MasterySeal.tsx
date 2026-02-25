/**
 * MAGNUM OPUS II #10 — The Magnum Opus Seal (The Proof)
 * The Squared Circle — Philosopher's Stone geometry. "The work is done. The worker is changed."
 * Self-Actualization: fulfillment of one's talents and potentialities.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'symbol' | 'resonant' | 'afterglow';

export default function Mastery_MasterySeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('symbol'), 2200);
    t(() => setStage('resonant'), 8000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 15000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'symbol' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Squared Circle — Circle inside Square */}
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2 }}
              style={{ position: 'relative', width: '100px', height: '100px' }}>
              {/* Square */}
              <div style={{ position: 'absolute', inset: 0,
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 6)}` }} />
              {/* Circle */}
              <div style={{ position: 'absolute', inset: '10px',
                borderRadius: '50%', border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}` }} />
              {/* Inner square */}
              <div style={{ position: 'absolute', inset: '22px',
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 4)}`,
                transform: 'rotate(45deg)' }} />
              {/* Center dot */}
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 3 }}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.25, 10) }} />
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              The Squared Circle. The Philosopher{"'"}s Stone. The work is done. The worker is changed.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Self-Actualization (Maslow): the realization or fulfillment of one{"'"}s talents and potentialities, considered as a drive or need present in everyone. The top of the pyramid is not a destination — it is a way of being. The Magnum Opus is complete. You are the Great Work.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Opus.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}