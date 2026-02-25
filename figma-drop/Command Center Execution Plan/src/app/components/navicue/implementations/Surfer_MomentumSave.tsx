/**
 * SURFER #9 — The Momentum Save
 * "Starting is expensive. Keeping going is cheap. Just a light touch."
 * ARCHETYPE: Pattern A (Tap) — Periodic tap to keep flywheel green
 * ENTRY: Scene-first — spinning flywheel
 * STEALTH KBE: Maintaining rhythm = Perseverance / Consistency (B)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'spinning' | 'maintained' | 'resonant' | 'afterglow';

const TAP_INTERVAL = 5000; // tap every 5s
const GRACE = 1500;
const TOTAL_TAPS = 4;

export default function Surfer_MomentumSave({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const [energy, setEnergy] = useState(1);
  const [waiting, setWaiting] = useState(false);
  const lastTap = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('spinning'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  // Energy decay
  useEffect(() => {
    if (stage !== 'spinning') return;
    lastTap.current = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - lastTap.current;
      const e = Math.max(0, 1 - (elapsed - TAP_INTERVAL + GRACE) / 3000);
      setEnergy(e);
      // Need tap window
      if (elapsed > TAP_INTERVAL - GRACE && elapsed < TAP_INTERVAL + GRACE) {
        setWaiting(true);
      } else {
        setWaiting(false);
      }
    }, 100);
    return () => clearInterval(iv);
  }, [stage]);

  const tap = useCallback(() => {
    if (stage !== 'spinning') return;
    const elapsed = Date.now() - lastTap.current;
    if (elapsed > TAP_INTERVAL - GRACE) {
      lastTap.current = Date.now();
      setEnergy(1);
      setWaiting(false);
      const next = taps + 1;
      setTaps(next);
      if (next >= TOTAL_TAPS) {
        console.log(`[KBE:B] MomentumSave taps=${next} perseverance=confirmed consistency=true`);
        setStage('maintained');
        t(() => setStage('resonant'), 4500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
      }
    }
  }, [stage, taps]);

  const rotation = useRef(0);
  useEffect(() => {
    if (stage !== 'spinning') return;
    const iv = setInterval(() => { rotation.current += energy * 6; }, 50);
    return () => clearInterval(iv);
  }, [stage, energy]);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '30px', height: '30px', borderRadius: '50%',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
        )}
        {stage === 'spinning' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Keep the wheel turning. One tap every few seconds.
            </div>
            {/* Flywheel */}
            <motion.div animate={{ rotate: 360 }}
              transition={{ duration: Math.max(0.5, 3 / Math.max(0.1, energy)), repeat: Infinity, ease: 'linear' }}
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                border: `3px solid ${energy > 0.5
                  ? themeColor(TH.accentHSL, 0.15 + energy * 0.1, 6 + energy * 4)
                  : themeColor(TH.primaryHSL, 0.06, 3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.3s' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%',
                background: energy > 0.5
                  ? themeColor(TH.accentHSL, 0.2, 10)
                  : themeColor(TH.primaryHSL, 0.06, 3) }} />
              {/* Spoke */}
              <div style={{ position: 'absolute', width: '2px', height: '20px',
                background: energy > 0.5
                  ? themeColor(TH.accentHSL, 0.1, 8)
                  : themeColor(TH.primaryHSL, 0.04, 2),
                borderRadius: '1px', top: '2px' }} />
            </motion.div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={tap}
              style={{ padding: '12px 28px', borderRadius: '9999px', cursor: 'pointer',
                background: waiting
                  ? themeColor(TH.accentHSL, 0.1, 5)
                  : themeColor(TH.primaryHSL, 0.04, 2),
                border: `2px solid ${waiting
                  ? themeColor(TH.accentHSL, 0.2, 10)
                  : themeColor(TH.primaryHSL, 0.06, 4)}`,
                transition: 'all 0.3s' }}>
              <div style={{ ...navicueType.choice,
                color: waiting ? themeColor(TH.accentHSL, 0.5, 14) : palette.textFaint }}>
                {waiting ? 'Tap now' : 'Wait...'}
              </div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {taps}/{TOTAL_TAPS} saves
            </div>
          </motion.div>
        )}
        {stage === 'maintained' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Maintained. The flywheel is green. Starting is expensive — overcoming inertia costs energy. But keeping it going? Just a light touch. Momentum is the cheapest fuel in physics and in life.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Flywheel Effect (Jim Collins). A heavy wheel takes enormous effort to start — but once spinning, maintaining it requires only a light touch. This is the physics of habit, consistency, and momentum. Don{"'"}t stop. Starting is expensive. Keeping going is cheap. A single tap every five seconds keeps the entire system alive.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Spinning.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}