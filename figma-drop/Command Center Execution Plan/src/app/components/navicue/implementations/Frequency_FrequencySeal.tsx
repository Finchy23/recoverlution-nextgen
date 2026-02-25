/**
 * FREQUENCY #10 — The Frequency Seal (The Proof)
 * "I am the frequency."
 * ARCHETYPE: Pattern A (Tap) — Identity koan, tap to seal
 * ENTRY: Cold Open — the statement arrives immediately
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'IdentityKoan');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Frequency_FrequencySeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const [taps, setTaps] = useState(0);
  const [phase, setPhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    const ph = setInterval(() => setPhase(p => p + 1), 100);
    return () => { T.current.forEach(clearTimeout); clearInterval(ph); };
  }, []);

  const handleTap = () => {
    if (stage !== 'active') return;
    const next = taps + 1;
    setTaps(next);
    if (next >= 3) {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    }
  };

  const progress = Math.min(1, taps / 3);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              I am the frequency.
            </div>
            <svg width="180" height="40" style={{ overflow: 'visible' }}>
              {Array.from({ length: 60 }).map((_, i) => {
                const x = i * 3;
                const amp = 8 + progress * 10;
                const y = 20 + Math.sin((phase + i) * 0.15) * amp;
                return <circle key={i} cx={x} cy={y} r={1 + progress * 0.5}
                  fill={themeColor(TH.accentHSL, 0.06 + progress * 0.08, 6)} />;
              })}
            </svg>
            <motion.div whileTap={{ scale: 0.96 }} onClick={handleTap}
              style={{
                padding: '14px 32px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05 + progress * 0.04, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {taps === 0 ? 'seal' : taps < 3 ? 'again' : 'sealed'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You are not a thing. You are an oscillation. A pattern of energy that persists through time. Every atom in your body vibrates. Every thought is a waveform. You don{'\u2019'}t have a frequency {'\u2014'} you are one.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Vibrating.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}