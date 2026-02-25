/**
 * TIME CAPSULE #6 — The 10-Year Echo
 * "Preserve the voice. It is the only ghost that is real."
 * ARCHETYPE: Pattern E (Hold) — Hold to record your voice into the future
 * ENTRY: Cold Open — "2035" appears, then the waveform materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function TimeCapsule_TenYearEcho({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tension = hold.tension;
  const bars = 24;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ fontSize: '32px', fontFamily: 'monospace', letterSpacing: '0.15em', color: palette.text, textAlign: 'center' }}>
            2035
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Speak to the you of a decade from now. Tell them who you are today. You will forget who you are right now. Preserve the voice; it is the only ghost that is real.
            </div>
            <svg width="240" height="60" viewBox="0 0 240 60">
              {Array.from({ length: bars }).map((_, i) => {
                const active = i / bars < tension;
                const h = active ? 8 + Math.sin(i * 0.7 + tension * 10) * 18 : 3;
                return (
                  <motion.rect key={i} x={5 + i * 10} y={30 - h / 2} width="6" height={h} rx="1"
                    fill={active ? themeColor(TH.accentHSL, 0.2 + tension * 0.3, 8) : themeColor(TH.primaryHSL, 0.06, 5)}
                    animate={{ height: h, y: 30 - h / 2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
                );
              })}
            </svg>
            <div
              {...hold.holdProps}
              style={{
                ...hold.holdProps.style,
                padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06 + tension * 0.1, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}`,
                userSelect: 'none', touchAction: 'none',
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {hold.completed ? 'recorded' : hold.isHolding ? 'recording\u2026' : 'hold to speak'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Captured. A waveform of exactly this moment, your particular frequency at this particular age. In ten years, you{'\u2019'}ll press play and hear a stranger who was once you, speaking with a certainty you{'\u2019'}d forgotten you ever had.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Echoing forward.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}