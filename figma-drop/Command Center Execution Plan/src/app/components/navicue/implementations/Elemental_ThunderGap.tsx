/**
 * ELEMENTAL #7 — The Thunder Gap
 * "The light travels faster than the sound. You have time to prepare."
 * INTERACTION: Flash of lightning → pregnant silence → deep rolling
 * rumble. Three rounds. Each gap gets longer. Train the nervous
 * system to tolerate the space between signal and impact.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Exposure', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ROUNDS = [
  { gap: 1500, miles: '1 mile', label: 'Close.' },
  { gap: 3000, miles: '3 miles', label: 'Further.' },
  { gap: 5000, miles: '5 miles', label: 'Distant. You had time.' },
];

type Phase = 'waiting' | 'flash' | 'gap' | 'thunder' | 'settled';

export default function Elemental_ThunderGap({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [rumble, setRumble] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const triggerLightning = () => {
    if (stage !== 'active' || phase !== 'waiting' || completed.includes(roundIdx)) return;
    const round = ROUNDS[roundIdx];

    // Flash
    setPhase('flash');
    setFlashOpacity(0.8);
    addTimer(() => setFlashOpacity(0), 150);
    addTimer(() => setFlashOpacity(0.4), 200);
    addTimer(() => {
      setFlashOpacity(0);
      setPhase('gap');
    }, 350);

    // Gap → Thunder
    addTimer(() => {
      setPhase('thunder');
      setRumble(1);
      addTimer(() => setRumble(0.6), 300);
      addTimer(() => setRumble(0.3), 600);
      addTimer(() => {
        setRumble(0);
        setPhase('settled');
        const next = [...completed, roundIdx];
        setCompleted(next);
        if (next.length >= ROUNDS.length) {
          addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
        } else {
          addTimer(() => { setRoundIdx(prev => prev + 1); setPhase('waiting'); }, 1500);
        }
      }, 1200);
    }, 350 + round.gap);
  };

  const current = ROUNDS[roundIdx];

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Exposure" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Storm approaching...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The light travels faster than the sound. You have time to prepare for the noise.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to trigger lightning</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={triggerLightning}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: phase === 'waiting' ? 'pointer' : 'default', width: '100%', maxWidth: '280px' }}>
            {/* Storm sky */}
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 20%, 10%, 0.25)' }}>
              {/* Cloud layer */}
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                <ellipse cx="70" cy="30" rx="50" ry="18" fill="hsla(220, 15%, 20%, 0.3)" />
                <ellipse cx="140" cy="25" rx="55" ry="20" fill="hsla(220, 15%, 18%, 0.3)" />
                <ellipse cx="110" cy="35" rx="45" ry="15" fill="hsla(220, 12%, 22%, 0.25)" />
                {/* Lightning bolt */}
                {(phase === 'flash') && (
                  <motion.path d="M 110 35 L 100 65 L 115 65 L 95 100"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
                    fill="none" stroke="hsla(50, 80%, 80%, 0.9)" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
              {/* Flash overlay */}
              <motion.div
                animate={{ opacity: flashOpacity }}
                style={{ position: 'absolute', inset: 0, background: 'hsla(50, 60%, 90%, 0.7)', pointerEvents: 'none' }}
              />
              {/* Rumble indicator — screen shake simulation */}
              <motion.div
                animate={{ x: rumble > 0.5 ? [0, -2, 2, -1, 1, 0] : 0 }}
                transition={{ duration: 0.3, repeat: rumble > 0.3 ? 2 : 0 }}
                style={{ position: 'absolute', bottom: '15px', left: 0, right: 0, height: '4px', display: 'flex', justifyContent: 'center', gap: '2px' }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <motion.div key={i}
                    animate={{ height: `${rumble * (2 + Math.sin(i * 0.8) * 3)}px` }}
                    style={{ width: '2px', background: `hsla(220, 30%, 50%, ${rumble * 0.4})`, borderRadius: '1px' }}
                  />
                ))}
              </motion.div>
              {/* Phase label */}
              <div style={{ position: 'absolute', bottom: '30px', left: 0, right: 0, textAlign: 'center' }}>
                {phase === 'gap' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                    style={{ ...navicueType.texture, color: 'hsla(50, 30%, 70%, 0.5)', fontSize: '11px', fontStyle: 'italic' }}>
                    {current.miles}... brace.
                  </motion.div>
                )}
                {phase === 'thunder' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                    style={{ ...navicueType.texture, color: 'hsla(220, 30%, 60%, 0.6)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em' }}>
                    RUMBLE
                  </motion.div>
                )}
                {phase === 'settled' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                    style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic' }}>
                    {current.label}
                  </motion.div>
                )}
              </div>
            </div>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {ROUNDS.map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: completed.includes(i) ? 'hsla(50, 50%, 60%, 0.5)' : palette.primaryFaint, opacity: completed.includes(i) ? 0.6 : 0.15 }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>
              {phase === 'waiting' ? 'tap for lightning' : phase === 'gap' ? 'wait for it...' : ''}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You had time. You braced. You survived the noise.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Startle reactivity lowered. The gap is where the power lives.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Flash. Gap. Thunder. Ready.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}