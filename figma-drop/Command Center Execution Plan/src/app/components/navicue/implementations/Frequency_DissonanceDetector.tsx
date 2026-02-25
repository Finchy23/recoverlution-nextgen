/**
 * FREQUENCY #2 — The Dissonance Detector
 * "Something is off. Tap when you feel it."
 * ARCHETYPE: Pattern A (Tap) — Tap when something feels "off"
 * ENTRY: Cold Open — a slightly wrong visual appears, user must identify it
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Frequency_DissonanceDetector({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const [taps, setTaps] = useState(0);
  const [glitchPhase, setGlitchPhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    const gl = setInterval(() => setGlitchPhase(p => p + 1), 2000);
    return () => { T.current.forEach(clearTimeout); clearInterval(gl); };
  }, []);

  const handleTap = () => {
    if (stage !== 'active') return;
    const next = taps + 1;
    setTaps(next);
    if (next >= 6) {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    }
  };

  const progress = Math.min(1, taps / 6);
  const dissonance = 1 - progress;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Something is off. You can feel it before you can name it. Tap each time you sense the dissonance.
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {Array.from({ length: 8 }).map((_, i) => {
                const isOff = (i + glitchPhase) % 3 === 0 && dissonance > 0.2;
                return (
                  <motion.div key={i}
                    animate={{
                      height: isOff ? `${20 + Math.random() * 20}px` : '20px',
                      opacity: isOff ? 0.3 : 0.08 + progress * 0.1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: '8px', borderRadius: radius.xs,
                      background: themeColor(TH.accentHSL, isOff ? 0.15 : 0.08, isOff ? 10 : 5),
                    }} />
                );
              })}
            </div>
            <motion.div whileTap={{ scale: 0.94 }} onClick={handleTap}
              style={{
                padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06 + progress * 0.06, 5)}`,
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {progress >= 1 ? 'resolved' : `that \u2014 there`}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Anomaly detection. Your nervous system registers dissonance 200ms before conscious awareness. That {'\u201c'}something{'\u2019'}s off{'\u201d'} feeling is your anterior cingulate cortex firing {'\u2014'} the brain{'\u2019'}s error-detection circuit. Trust the signal. It{'\u2019'}s faster than thought.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Detected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}