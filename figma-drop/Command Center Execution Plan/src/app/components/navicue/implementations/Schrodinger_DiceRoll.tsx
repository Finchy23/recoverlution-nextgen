/**
 * SCHRODINGER #3 — The Dice Roll (Stochasticity)
 * "Stop thinking. Outsource the executive function to the universe. Roll."
 * ARCHETYPE: Pattern A (Tap) — Tap to roll, fate decides
 * ENTRY: Scene-first — dice sit waiting, then the voice explains
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'scene' | 'active' | 'rolling' | 'resonant' | 'afterglow';

export default function Schrodinger_DiceRoll({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [result, setResult] = useState<number>(0);
  const [rolling, setRolling] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setStage('rolling');
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    t(() => {
      setResult(d1 + d2);
      t(() => setStage('resonant'), 3500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 8500);
    }, 1800);
  };

  const isEven = result % 2 === 0;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {[1, 2].map(d => (
              <motion.div key={d} animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: d * 0.3 }}
                style={{ width: '40px', height: '40px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, 0.1, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 8)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', color: themeColor(TH.accentHSL, 0.15, 15) }}>
                {'\u2022'}
              </motion.div>
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Even: you do the hard thing. Odd: you rest. Let fate decide. Stop thinking. Roll.
            </div>
            <motion.div onClick={roll} whileTap={{ scale: 0.95 }}
              style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
              {[1, 2].map(d => (
                <motion.div key={d} animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: '50px', height: '50px', borderRadius: radius.sm,
                    background: themeColor(TH.primaryHSL, 0.04, 2),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '18px' }}>
                    {result}
                  </span>
                </motion.div>
              ))}
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to roll</div>
          </motion.div>
        )}
        {stage === 'rolling' && (
          <motion.div key="roll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {result === 0 ? (
              <motion.div animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                style={{ width: '50px', height: '50px', borderRadius: radius.sm,
                  background: themeColor(TH.accentHSL, 0.15, 8) }} />
            ) : (
              <>
                <motion.div initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ fontSize: '32px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.4, 18) }}>
                  {result}
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.2em',
                    color: themeColor(TH.accentHSL, 0.3, 12) }}>
                  {isEven ? 'EVEN: DO THE HARD THING' : 'ODD: REST'}
                </motion.div>
              </>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Decision fatigue is real. Sometimes the bravest thing is to outsource the trivial choice and save your willpower for the moments that actually matter. The dice didn't decide for you; they freed you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Fate spoke.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}