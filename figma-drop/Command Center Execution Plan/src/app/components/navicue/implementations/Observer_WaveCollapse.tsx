/**
 * OBSERVER #2 — The Wave Collapse
 * "Look at it. Make it real."
 * ARCHETYPE: Pattern A (Tap ×3) — Each touch solidifies a region of fog
 * ENTRY: Scene First — fog cloud already active, text overlaid
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'scene' | 'resonant' | 'afterglow';

export default function Observer_WaveCollapse({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [taps, setTaps] = useState(0);
  const [textIn, setTextIn] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setTextIn(true), 1000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const collapse = () => {
    if (stage !== 'scene' || taps >= 3) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  const d = taps / 3;
  const solid = d;
  const blur = 8 * (1 - d);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={collapse}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: taps >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <svg width="160" height="120" viewBox="0 0 160 120">
              {/* Fog → solid transition */}
              <motion.g style={{ filter: `blur(${blur}px)` }}>
                <rect x="45" y="25" width="70" height="70" rx={20 - d * 16}
                  fill={themeColor(TH.accentHSL, 0.08 + solid * 0.2, 10 + solid * 10)} />
              </motion.g>
              {/* Edges sharpen with taps */}
              {taps >= 2 && (
                <motion.rect x="45" y="25" width="70" height="70" rx={4}
                  fill="none" stroke={themeColor(TH.accentHSL, 0.12, 18)} strokeWidth="0.5"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              )}
              {taps >= 3 && (
                <motion.text x="80" y="65" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.2, 20)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  letterSpacing="0.1em">REAL</motion.text>
              )}
            </svg>
            <motion.div animate={{ opacity: textIn ? 1 : 0 }} transition={{ duration: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your attention is the hammer. Where you look, the world hardens. Do not look at the fear, or you will make it solid. Look at the solution.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            The observer effect. Conscious attention literally collapses the wave function into a single reality. You touched the fog three times and it became stone. Choose where you look.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>You made it real.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}