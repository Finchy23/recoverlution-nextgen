/**
 * GLITCH #8 — The Loop Crash
 * "The words are losing meaning. Good. Drop below the words. Feel the meaning."
 * ARCHETYPE: Pattern A (Tap) — Watch the loop accelerate, tap to crash through
 * ENTRY: Scene-first — "You are okay" repeats and accelerates
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'looping' | 'crashed' | 'resonant' | 'afterglow';

const PHRASE = 'You are okay.';

export default function Glitch_LoopCrash({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('looping');
  const [count, setCount] = useState(1);
  const [speed, setSpeed] = useState(1);
  const T = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    let c = 1;
    let spd = 1;
    intervalRef.current = window.setInterval(() => {
      c++;
      spd = Math.min(4, 1 + c * 0.3);
      setCount(c);
      setSpeed(spd);
      if (c >= 8) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Auto-crash
        t(() => {
          setStage('crashed');
          t(() => setStage('resonant'), 5000);
          t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
        }, 600);
      }
    }, 600);
    return () => { T.current.forEach(clearTimeout); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'looping' && (
          <motion.div key="l" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            maxWidth: '280px', overflow: 'hidden' }}>
            {Array.from({ length: Math.min(count, 8) }, (_, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1 - i * 0.08, x: 0 }}
                transition={{ duration: Math.max(0.1, 0.4 / speed) }}
                style={{ fontSize: `${Math.max(10, 14 - i * 0.5)}px`,
                  color: palette.text, textAlign: 'center',
                  letterSpacing: `${Math.max(0, 0.02 - i * 0.003)}em` }}>
                {PHRASE}
              </motion.div>
            ))}
            {count >= 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.3, 10),
                  marginTop: '8px' }}>
                semantic satiation
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'crashed' && (
          <motion.div key="cr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <motion.div initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em',
                color: themeColor(TH.accentHSL, 0.3, 12) }}>
              OVERFLOW
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The words lost meaning. Good. Drop below the language. What does "okay" actually feel like in your body? Not the word {'\u2014'} the sensation.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Semantic satiation. Repeating a word until it loses meaning forces the brain to process the concept emotionally rather than linguistically. The crash was the breakthrough {'\u2014'} meaning lives below words.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Below the words.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}