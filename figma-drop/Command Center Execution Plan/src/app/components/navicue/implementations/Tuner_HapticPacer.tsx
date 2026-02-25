/**
 * TUNER #3 — The 4-7-8 Haptic Pacer
 * "Close your eyes. Follow the vibration."
 * ARCHETYPE: Pattern C (Draw) — Draw the breathing circle: expand 4s, hold 7s, collapse 8s
 * ENTRY: Instruction-as-Poetry — the rhythm itself appears as verse
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'poem' | 'active' | 'resonant' | 'afterglow';

export default function Tuner_HapticPacer({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('poem');
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [cycles, setCycles] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.35,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Breathing cycle timer
  useEffect(() => {
    if (stage !== 'active') return;
    const runCycle = () => {
      setBreathPhase('in');
      t(() => setBreathPhase('hold'), 4000);
      t(() => setBreathPhase('out'), 11000);
      t(() => {
        setCycles(c => c + 1);
        runCycle();
      }, 19000);
    };
    runCycle();
  }, [stage]);

  const circleSize = breathPhase === 'in' ? 140 : breathPhase === 'hold' ? 140 : 80;
  const circleTransition = breathPhase === 'in' ? 4 : breathPhase === 'hold' ? 0.3 : 8;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'poem' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.3 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic', lineHeight: 1.8 }}>
              four counts in{'\u2026'}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.9 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              seven counts still{'\u2026'}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              eight counts out.
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Close your eyes. Your thumb knows the rhythm. Follow the circle. In{'\u2026'} Hold{'\u2026'} Out{'\u2026'} Draw inside the breath.
            </div>
            <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                animate={{ width: circleSize, height: circleSize }}
                transition={{ duration: circleTransition, ease: 'easeInOut' }}
                style={{
                  borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.06, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.4 }}>
                  {breathPhase === 'in' ? 'in' : breathPhase === 'hold' ? 'hold' : 'out'}
                </div>
              </motion.div>
            </div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '200px', height: '80px', borderRadius: radius.sm, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.03, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.05, 5)}`,
              overflow: 'hidden',
            }}>
              <svg width="200" height="80" viewBox="0 0 200 80" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                {draw.strokes.map((s, si) => (
                  <polyline key={si} fill="none"
                    stroke={themeColor(TH.accentHSL, 0.15, 10)}
                    strokeWidth="2" strokeLinecap="round"
                    points={s.points.map(p => `${p.x * 200},${p.y * 80}`).join(' ')} />
                ))}
                {draw.currentStroke.length > 1 && (
                  <polyline fill="none"
                    stroke={themeColor(TH.accentHSL, 0.2, 12)}
                    strokeWidth="2" strokeLinecap="round"
                    points={draw.currentStroke.map(p => `${p.x * 200},${p.y * 80}`).join(' ')} />
                )}
              </svg>
              <div style={{ position: 'absolute', bottom: '4px', right: '8px', fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.2 }}>
                trace the breath
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Parasympathetic Activation. Extending the exhalation phase relative to inhalation stimulates the vagus nerve, lowering heart rate and blood pressure. This is Respiratory Sinus Arrhythmia {':'} your body{'\u2019'}s built-in brake pedal. You just pressed it.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Paced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}