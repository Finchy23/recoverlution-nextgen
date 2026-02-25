/**
 * HACKER #6 — The Script Burn
 * "You are not the actor. You are the writer."
 * INTERACTION: Limiting scripts appear as screenplay lines. Tap each
 * to ignite it — the text chars and burns away, leaving blank space
 * for a new line.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SCRIPTS = [
  '"I am always tired."',
  '"I\'m not the kind of person who..."',
  '"It\'s too late for me."',
  '"I don\'t deserve that."',
  '"This is just who I am."',
];

export default function Hacker_ScriptBurn({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [burned, setBurned] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleBurn = (i: number) => {
    if (stage !== 'active' || burned.includes(i)) return;
    const next = [...burned, i];
    setBurned(next);
    if (next.length >= SCRIPTS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Lines you never wrote.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are not the actor. You are the writer.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each line to burn it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '300px' }}>
            {SCRIPTS.map((s, i) => {
              const isBurned = burned.includes(i);
              return (
                <motion.button key={i} onClick={() => handleBurn(i)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: isBurned ? 0.08 : 0.5, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={!isBurned ? { opacity: 0.7 } : undefined}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isBurned ? 'transparent' : palette.primaryFaint}`, borderRadius: radius.sm, cursor: isBurned ? 'default' : 'pointer', textAlign: 'left', position: 'relative' }}>
                  {!isBurned ? (
                    <span style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '12px', fontFamily: 'monospace' }}>{s}</span>
                  ) : (
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8 }}
                      style={{ height: '1px', background: `linear-gradient(90deg, hsla(20, 80%, 50%, 0.4), hsla(30, 90%, 40%, 0.2), transparent)`, transformOrigin: 'left' }} />
                  )}
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '8px' }}>{burned.length} of {SCRIPTS.length} burned</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The page is blank. The pen is yours.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The line does not need to be spoken.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Write the new script.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}