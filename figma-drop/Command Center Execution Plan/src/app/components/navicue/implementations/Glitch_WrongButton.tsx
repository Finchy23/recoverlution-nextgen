/**
 * GLITCH #2 — The "Wrong" Button
 * "You are a robot right now. Clicking without feeling. I moved the cheese. Wake up."
 * ARCHETYPE: Pattern A (Tap) — Button dodges, then shatters
 * ENTRY: Scene-first — a normal "Continue" button, but it moves
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'scene' | 'dodge1' | 'dodge2' | 'shattered' | 'resonant' | 'afterglow';

export default function Glitch_WrongButton({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('dodge1'), 1500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tapButton = () => {
    const newTaps = taps + 1;
    setTaps(newTaps);
    if (newTaps < 3) {
      // Dodge
      const x = (Math.random() - 0.5) * 120;
      const y = (Math.random() - 0.5) * 60;
      setBtnPos({ x, y });
      if (newTaps === 1) setStage('dodge1');
      if (newTaps === 2) setStage('dodge2');
    } else {
      // Shatter
      setStage('shattered');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {(stage === 'scene' || stage === 'dodge1' || stage === 'dodge2') && (
          <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            {taps > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 12), textAlign: 'center' }}>
                {taps === 1 ? 'It moved.' : 'Stop clicking without feeling. Intend.'}
              </motion.div>
            )}
            <motion.div
              animate={{ x: btnPos.x, y: btnPos.y }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={tapButton}
              style={{ padding: '12px 32px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.12, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
              <div style={{ fontSize: '13px', color: palette.text }}>Continue</div>
            </motion.div>
            {taps === 0 && (
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to continue</div>
            )}
          </motion.div>
        )}
        {stage === 'shattered' && (
          <motion.div key="sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '120px', height: '40px' }}>
              {[...Array(8)].map((_, i) => (
                <motion.div key={i}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 80,
                    opacity: 0, rotate: Math.random() * 180,
                  }}
                  transition={{ duration: 1.5, delay: i * 0.05 }}
                  style={{ position: 'absolute', width: '15px', height: '8px', borderRadius: '2px',
                    left: `${i * 14}px`, top: '16px',
                    background: themeColor(TH.accentHSL, 0.15, 8) }} />
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Do not just click. Intend. Every tap should carry the weight of a decision. You are not a robot. Stop performing the gesture without the meaning.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Prediction error. Your brain predicted the button would work. When it didn't, dopamine spiked {'\u2014'} frustration, surprise {'\u2014'} forcing real attention. The broken expectation was the lesson.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Intend.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}