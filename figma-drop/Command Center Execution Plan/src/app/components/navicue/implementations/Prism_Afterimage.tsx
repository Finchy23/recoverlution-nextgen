/**
 * PRISM #4 — The Afterimage
 * "It is not there. It is just the burn."
 * ARCHETYPE: Pattern A (Tap ×3) — Flash, afterburn, blink to fade
 * ENTRY: Cold Open — blinding flash, then the ghost shape
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'flash' | 'active' | 'resonant' | 'afterglow';

export default function Prism_Afterimage({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('flash');
  const [taps, setTaps] = useState(0);
  const [burnAlpha, setBurnAlpha] = useState(0.25);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const blink = () => {
    if (stage !== 'active' || taps >= 3) return;
    const n = taps + 1;
    setTaps(n);
    setBurnAlpha(prev => prev * 0.4);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'flash' && (
          <motion.div key="f"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.5, 0] }}
            transition={{ duration: 1.5, times: [0, 0.1, 0.3, 1] }}
            style={{ width: '160px', height: '160px', borderRadius: '50%',
              background: 'hsla(0, 0%, 95%, 0.8)' }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={blink}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: taps >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are reacting to a ghost. The event is over. The image is only in your retina. Blink. Let it fade.
            </div>
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* The afterimage — purple ghost of the flash */}
              <motion.circle cx="80" cy="80" r="50"
                fill={`hsla(280, 30%, 35%, ${burnAlpha})`}
                initial={{ r: 50, opacity: burnAlpha }}
                animate={{ r: [50, 52, 50], opacity: [burnAlpha, burnAlpha * 0.8, burnAlpha] }}
                transition={{ duration: 2, repeat: Infinity }} />
              <motion.circle cx="80" cy="80" r="30"
                fill={`hsla(280, 25%, 30%, ${burnAlpha * 0.6})`} />
              {taps >= 3 && (
                <motion.text x="80" y="85" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.12, 15)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  FADED
                </motion.text>
              )}
            </svg>
            {taps < 3 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>blink</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            The burn faded. Sensory adaptation: trauma leaves a neural afterimage. Recognizing that the current anxiety is a memory artifact, not a current threat, helps extinguish the response. It is not there. It is just the burn.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Just the burn.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}