/**
 * TUNER #2 — The Gamma Spike
 * "Wake up the cortex. Bind the information."
 * ARCHETYPE: Pattern A (Tap) — Rapid taps trigger golden bursts at 40Hz visual rhythm
 * ENTRY: Cold Open — a rapid gold strobe flashes, then the interaction materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function Tuner_GammaSpike({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [taps, setTaps] = useState(0);
  const [strobeOn, setStrobeOn] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    // Cold open strobe effect
    let count = 0;
    const strobe = setInterval(() => {
      setStrobeOn(v => !v);
      count++;
      if (count > 8) { clearInterval(strobe); setStrobeOn(false); }
    }, 120);
    t(() => setStage('active'), 1800);
    return () => { T.current.forEach(clearTimeout); clearInterval(strobe); };
  }, []);

  const click = () => {
    if (stage !== 'active' || taps >= 5) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 5) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              animate={{ opacity: strobeOn ? 0.35 : 0.02 }}
              transition={{ duration: 0.05 }}
              style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'hsla(45, 40%, 45%, 0.4)' }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={click}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: taps >= 5 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Wake up the cortex. Bind the information. 40 beats per second. The solution is in the speed. Tap rapidly {';'} each tap is a gamma burst. Feel the binding.
            </div>
            <motion.div style={{ position: 'relative', width: '160px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Radiating spike lines */}
              {Array.from({ length: taps }).map((_, i) => (
                <motion.div key={i} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 0.3 }}
                  style={{
                    position: 'absolute', width: '2px', height: `${40 + i * 15}px`,
                    background: `hsla(45, 40%, ${45 + i * 5}%, ${0.15 + i * 0.05})`,
                    transform: `rotate(${i * 36}deg)`, transformOrigin: 'center bottom',
                    borderRadius: '1px',
                  }} />
              ))}
              <motion.div
                key={taps}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  width: `${40 + taps * 12}px`, height: `${40 + taps * 12}px`, borderRadius: '50%',
                  background: `radial-gradient(circle, hsla(45, 40%, ${40 + taps * 5}%, ${0.1 + taps * 0.04}), transparent)`,
                  border: `1px solid hsla(45, 35%, 45%, ${0.08 + taps * 0.03})`,
                }} />
            </motion.div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i} style={{ width: '6px', height: '20px', borderRadius: '3px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < taps ? 'hsla(45, 40%, 45%, 0.4)' : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
            {taps < 5 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>tap rapidly</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Gamma Synchrony. 40Hz oscillation is where binding happens {':'} the cognitive process where disparate sensory inputs integrate into a coherent perception. The {'\u201C'}Aha!{'\u201D'} moment lives at this frequency. Your cortex just woke up.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Bound.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}