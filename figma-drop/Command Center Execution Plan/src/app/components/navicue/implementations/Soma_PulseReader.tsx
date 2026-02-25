/**
 * SOMA #4 — The Pulse Reader
 * "Tap in rhythm with your heartbeat."
 * ARCHETYPE: Pattern A (Tap) — Tap in sync with your pulse
 * ENTRY: Scene-first — a pulsing dot appears, user taps to match
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Soma_PulseReader({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [taps, setTaps] = useState(0);
  const [intervals, setIntervals] = useState<number[]>([]);
  const lastTapRef = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const handleTap = () => {
    if (stage !== 'active') return;
    const now = Date.now();
    if (lastTapRef.current > 0) {
      const interval = now - lastTapRef.current;
      setIntervals(prev => [...prev.slice(-7), interval]);
    }
    lastTapRef.current = now;
    const next = taps + 1;
    setTaps(next);
    if (next >= 12) {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    }
  };

  const avgBPM = intervals.length > 2
    ? Math.round(60000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length))
    : null;
  const progress = Math.min(1, taps / 12);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1, 6) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Find your pulse. Wrist, neck, chest. Tap each beat. Let your rhythm become visible.
            </div>
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: avgBPM ? 60 / avgBPM : 1, repeat: Infinity }}
              style={{
                width: `${50 + progress * 20}px`, height: `${50 + progress * 20}px`, borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.1 + progress * 0.08, 6)}, transparent)`,
                transition: 'width 0.3s, height 0.3s',
              }} />
            {avgBPM && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                style={{ ...navicueType.hint, color: palette.textFaint }}>
                ~{avgBPM} bpm
              </motion.div>
            )}
            <motion.div whileTap={{ scale: 0.94 }} onClick={handleTap}
              style={{
                padding: '14px 36px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>beat</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Cardiac interoception. The ability to accurately feel your heartbeat predicts emotional intelligence, intuitive decision-making, and anxiety regulation. You just trained the oldest signal-detection system you have.
              {avgBPM && ` Your rhythm: ~${avgBPM} beats per minute.`}
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Beating.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
