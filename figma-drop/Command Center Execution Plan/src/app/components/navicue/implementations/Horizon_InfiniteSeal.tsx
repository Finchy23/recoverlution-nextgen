/**
 * INFINITE PLAYER II #10 — The Infinite Seal (The Proof)
 * Ouroboros — the snake eating its tail. "The end is the beginning."
 * Finite and Infinite Games (Carse): the purpose of continuing play.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'symbol' | 'resonant' | 'afterglow';

export default function Horizon_InfiniteSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
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
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
          </motion.div>
        )}
        {stage === 'symbol' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Ouroboros */}
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2 }}
              style={{ position: 'relative', width: '100px', height: '100px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                style={{ position: 'absolute', inset: 0 }}>
                <svg viewBox="0 0 100 100" width="100" height="100">
                  <circle cx="50" cy="50" r="38" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.12, 6)} strokeWidth="3"
                    strokeDasharray="200 40" />
                  {/* Snake head eating tail */}
                  <circle cx="88" cy="50" r="5" fill={themeColor(TH.accentHSL, 0.2, 8)} />
                </svg>
              </motion.div>
              {/* Center infinity symbol */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                fontSize: '20px', color: themeColor(TH.accentHSL, 0.25, 10) }}>
                &#x221E;
              </div>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              The Ouroboros. The snake eating its own tail. The circle that never breaks. The end is the beginning.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Finite and Infinite Games (James Carse): "A finite game is played for the purpose of winning, an infinite game for the purpose of continuing the play." The only true end is the one where you stop choosing to begin again. The Ouroboros is the seal of the Infinite Player: death feeds life feeds death feeds life.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>&#x221E;</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}