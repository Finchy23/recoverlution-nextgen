/**
 * TUNER #5 — The Isochronic Focus
 * "The distraction is irregular. The beat is regular. Lock onto the grid."
 * ARCHETYPE: Pattern A (Tap) — Tap in sync with the visual pulse to lock on
 * ENTRY: Cold Open — a sharp metronomic tick appears, no context
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function Tuner_IsochronicFocus({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [beats, setBeats] = useState(0);
  const [pulseOn, setPulseOn] = useState(false);
  const [syncTaps, setSyncTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const beatRef = useRef<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseOn(true);
      beatRef.current = Date.now();
      setBeats(b => b + 1);
      setTimeout(() => setPulseOn(false), 80);
    }, 500); // 2Hz beta-range pulses
    t(() => setStage('active'), 1800);
    return () => { T.current.forEach(clearTimeout); clearInterval(interval); };
  }, []);

  const click = () => {
    if (stage !== 'active' || syncTaps >= 6) return;
    const timeSinceBeat = Date.now() - beatRef.current;
    // Widened sync window: accept taps within ±180ms of beat (generous but still rhythmic)
    const tolerance = 180;
    const inSync = timeSinceBeat < tolerance || timeSinceBeat > (500 - tolerance);
    if (!inSync) return;
    const n = syncTaps + 1;
    setSyncTaps(n);
    if (n >= 6) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div
              animate={{ opacity: pulseOn ? 0.4 : 0.04 }}
              transition={{ duration: 0.05 }}
              style={{ width: '12px', height: '12px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.8, 15) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={click}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: syncTaps >= 6 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The distraction is irregular. The beat is regular. Lock onto the grid. Your brain craves the pattern. Tap in rhythm with the pulse.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {/* Metronome grid */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <motion.div key={i}
                    animate={{ opacity: pulseOn && i === (beats % 8) ? 0.5 : 0.06, scale: pulseOn && i === (beats % 8) ? 1.3 : 1 }}
                    transition={{ duration: 0.08 }}
                    style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: themeColor(TH.accentHSL, 0.3, 10),
                    }} />
                ))}
              </div>
              {/* Sync indicator */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <motion.div key={i} style={{ width: '20px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                    animate={{ backgroundColor: i < syncTaps ? themeColor(TH.accentHSL, 0.4, 10) : themeColor(TH.primaryHSL, 0.06, 5) }} />
                ))}
              </div>
            </div>
            {syncTaps < 6 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>tap on the beat</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Isochronic Tones. Regular, evenly spaced pulses of light are highly effective for cortical entrainment to Beta states. Unlike binaural beats, they need no headphones. You just locked your attention onto a grid. The grid is now the anchor. Chaos cannot compete with rhythm.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Locked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}