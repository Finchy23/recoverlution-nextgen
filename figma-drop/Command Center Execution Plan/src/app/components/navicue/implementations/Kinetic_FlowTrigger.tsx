/**
 * KINETIC #3 — The Flow Trigger
 * "Flow is not magic. It is rhythm. Get in the pocket."
 * ARCHETYPE: Pattern A (Tap) — Tap in sync with beats for 10 pulses
 * ENTRY: Scene-first — pulsing circle
 * STEALTH KBE: Tap variance = Cognitive Jitter; high accuracy = Deep Work readiness (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'active' | 'zoned' | 'resonant' | 'afterglow';
const BPM = 72;
const BEAT_MS = 60000 / BPM;
const TOTAL_BEATS = 10;

export default function Kinetic_FlowTrigger({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [beat, setBeat] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const tapTimes = useRef<number[]>([]);
  const beatTimes = useRef<number[]>([]);

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const id = window.setInterval(() => {
      setPulse(true);
      beatTimes.current.push(Date.now());
      setBeat(b => b + 1);
      setTimeout(() => setPulse(false), 150);
    }, BEAT_MS);
    return () => clearInterval(id);
  }, [stage]);

  const tap = () => {
    if (stage !== 'active') return;
    tapTimes.current.push(Date.now());
    const next = taps + 1;
    setTaps(next);
    if (next >= TOTAL_BEATS) {
      // Calculate accuracy
      const diffs: number[] = [];
      for (let i = 0; i < Math.min(tapTimes.current.length, beatTimes.current.length); i++) {
        diffs.push(Math.abs(tapTimes.current[i] - beatTimes.current[i]));
      }
      const avgDiff = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 999;
      console.log(`[KBE:E] FlowTrigger avgJitterMs=${Math.round(avgDiff)} deepWorkReady=${avgDiff < 200}`);
      setStage('zoned');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: BEAT_MS / 1000, repeat: Infinity }}
              style={{ width: '30px', height: '30px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Get in the pocket. Tap on the beat.
            </div>
            <motion.div animate={{ scale: pulse ? 1.2 : 1, opacity: pulse ? 1 : 0.4 }}
              transition={{ duration: 0.1 }}
              style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 6),
                border: `2px solid ${themeColor(TH.accentHSL, 0.18, 10)}` }} />
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: TOTAL_BEATS }).map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: i < taps ? themeColor(TH.accentHSL, 0.3, 10) : themeColor(TH.primaryHSL, 0.06, 4) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={tap}
              style={{ padding: '14px 32px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>TAP</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'zoned' && (
          <motion.div key="z" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              In the zone. The rhythm is yours.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive jitter. Flow is not magic, it{"'"}s rhythm. Your tap accuracy measures how settled your mind is. High jitter means scattered attention. Low jitter means the pocket, the gateway to deep work.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>In pocket.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}