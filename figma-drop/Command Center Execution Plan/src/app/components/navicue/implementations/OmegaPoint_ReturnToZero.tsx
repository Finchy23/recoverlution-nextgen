/**
 * OMEGA POINT #3 — The Return to Zero
 * "Start again. With nothing. The beginner's mind is the only mind that learns."
 * INTERACTION: A large countdown number drops from 100 toward 0.
 * Each tap accelerates the countdown. At zero — silence, a blinking
 * cursor, and infinite possibility.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const COUNT_STEPS = 5;
const NUMBERS = [100, 75, 50, 25, 10, 0];

export default function OmegaPoint_ReturnToZero({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [step, setStep] = useState(0);
  const [cursorBlink, setCursorBlink] = useState(true);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (step < COUNT_STEPS) return;
    const iv = setInterval(() => setCursorBlink(b => !b), 530);
    return () => clearInterval(iv);
  }, [step]);

  const countdown = () => {
    if (stage !== 'active' || step >= COUNT_STEPS) return;
    const next = step + 1;
    setStep(next);
    if (next >= COUNT_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 4000);
    }
  };

  const t = step / COUNT_STEPS;
  const currentNum = NUMBERS[step];
  const fontSize = 48 + t * 20; // number grows as it approaches 0

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A number descends...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Start again. With nothing. The beginner's mind is the only mind that learns.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to count down</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={countdown}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', cursor: step >= COUNT_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {step < COUNT_STEPS ? (
                <motion.div
                  key={currentNum}
                  initial={{ opacity: 0, scale: 1.3, y: -10 }}
                  animate={{ opacity: 0.4 + t * 0.3, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: `${fontSize}px`,
                    fontWeight: 200,
                    color: `hsla(0, 0%, ${40 + t * 25}%, ${0.3 + t * 0.35})`,
                    letterSpacing: '-2px',
                    lineHeight: 1,
                  }}>
                  {currentNum}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '72px',
                    fontWeight: 100,
                    color: 'hsla(0, 0%, 70%, 0.6)',
                    letterSpacing: '-3px',
                    lineHeight: 1,
                  }}>
                    0
                  </div>
                  {/* Blinking cursor */}
                  <div style={{
                    width: '18px',
                    height: '2px',
                    background: cursorBlink ? 'hsla(0, 0%, 55%, 0.5)' : 'transparent',
                    transition: 'background 0.1s',
                  }} />
                </motion.div>
              )}
            </div>
            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {step === 0 ? 'One hundred. Full of knowing.' : step < COUNT_STEPS ? `${currentNum}. Letting go.` : 'Zero. Empty. Ready.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: COUNT_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < step ? 'hsla(0, 0%, 55%, 0.4)' : palette.primaryFaint, opacity: i < step ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Zero. Nothing left. Everything possible. The cursor blinks. Begin.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Shoshin. Beginner's mind. Expertise dropped. Neuroplasticity requires novelty.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Full. Empty. Free.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}