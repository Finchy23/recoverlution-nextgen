/**
 * BROADCAST #5 — The Silent Timer
 * "Clocks create anxiety. The horizon creates perspective."
 * ARCHETYPE: Pattern A (Tap) — Tap to start the horizon rising, watch it climb
 * ENTRY: Instruction-as-Poetry — "watch the water rise. you have time."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'poem' | 'active' | 'resonant' | 'afterglow';

export default function Broadcast_SilentTimer({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('poem');
  const [started, setStarted] = useState(false);
  const [horizonPct, setHorizonPct] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Slow horizon rise after started
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setHorizonPct(p => {
        if (p >= 100) {
          clearInterval(interval);
          t(() => { t(() => { setStage('afterglow'); onComplete?.(); }, 5500); setStage('resonant'); }, 500);
          return 100;
        }
        return p + 1.2; // ~8 seconds to fill
      });
    }, 100);
    return () => clearInterval(interval);
  }, [started]);

  const click = () => {
    if (stage !== 'active' || started) return;
    setStarted(true);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'poem' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.3 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              watch the water rise.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              you have time.
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={click}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: started ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Clocks create anxiety. The horizon creates perspective. No numbers. No countdown. Just a line rising, like water filling a vessel. You have exactly as much time as you need.
            </div>
            <div style={{
              width: '220px', height: '120px', borderRadius: radius.sm, position: 'relative', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 5)}`,
            }}>
              {/* Water rising */}
              <motion.div
                style={{
                  position: 'absolute', bottom: 0, left: 0, width: '100%',
                  height: `${horizonPct}%`,
                  background: `linear-gradient(to top, ${themeColor(TH.accentHSL, 0.06, 5)}, ${themeColor(TH.accentHSL, 0.02, 8)})`,
                  transition: 'height 0.2s linear',
                }}>
                {/* Horizon line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '1px',
                  background: themeColor(TH.accentHSL, 0.12, 10),
                }} />
              </motion.div>
            </div>
            {!started && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>tap to begin</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Time Perception. Analog, spatial representations of time are less stressful than digital numerical countdowns, which trigger {'\u201C'}Time Urgency{'\u201D'} behavior. The horizon doesn{'\u2019'}t hurry. It just rises. You were never running out {'\u2014'} you were filling up.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Full.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}