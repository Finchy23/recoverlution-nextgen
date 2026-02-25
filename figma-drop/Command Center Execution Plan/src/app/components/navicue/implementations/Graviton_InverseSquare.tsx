/**
 * GRAVITON #6 — The Inverse Square Law
 * "Proximity is power. Get close."
 * ARCHETYPE: Pattern A (Tap ×4) — Each tap halves the distance, quadruples the signal
 * ENTRY: Scene First — light source already dimming, text overlaid
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'scene' | 'resonant' | 'afterglow';

export default function Graviton_InverseSquare({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [taps, setTaps] = useState(0);
  const [textIn, setTextIn] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setTextIn(true), 1200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const step = () => {
    if (stage !== 'scene' || taps >= 4) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 4) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  const d = taps / 4;
  const dist = 160 - taps * 30; // shrinking distance
  const intensity = 0.04 + d * d * 0.5; // inverse square brightening

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={step}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: taps >= 4 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <svg width="200" height="100" viewBox="0 0 200 100">
              {/* Light source */}
              <circle cx="20" cy="50" r="8" fill={themeColor(TH.accentHSL, 0.25, 20)} />
              {/* Distance line */}
              <line x1="30" y1="50" x2={dist} y2="50" stroke={themeColor(TH.primaryHSL, 0.06, 8)} strokeWidth="0.4" strokeDasharray="2 2" />
              {/* Receiver — brightness increases with proximity */}
              <motion.circle cx={dist} cy="50" r="12"
                fill={themeColor(TH.accentHSL, intensity, 15)}
                stroke={themeColor(TH.accentHSL, intensity * 0.5, 20)} strokeWidth="0.5"
                initial={{ cx: dist }}
                animate={{ cx: dist }} transition={{ type: 'spring', stiffness: 50 }} />
              {/* Distance label */}
              <text x={dist / 2 + 10} y="75" textAnchor="middle" fontSize="11" fontFamily="monospace"
                fill={themeColor(TH.accentHSL, 0.1, 10)} letterSpacing="0.08em">
                {taps === 0 ? '4x' : taps === 1 ? '3x' : taps === 2 ? '2x' : taps === 3 ? '1x' : 'CLOSE'}
              </text>
            </svg>
            <motion.div animate={{ opacity: textIn ? 1 : 0 }} transition={{ duration: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You cannot influence from a distance. The signal degrades fast. If you want to change the orbit, close the gap.
            </motion.div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.3, 15) : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            The proximity principle. Influence and trust degrade rapidly with distance — physical or psychological. Four steps closer and the signal quadrupled. Get close.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Close the gap.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}