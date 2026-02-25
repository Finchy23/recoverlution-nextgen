/**
 * DIPLOMAT #1 — The Mirror Shield
 * "See their pain before you see their attack."
 * INTERACTION: Aggressive phrases float toward you. Tap each one
 * to flip it — revealing the hurt beneath the anger. The attack
 * dissolves when you see what it's really saying.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Connection', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const ATTACKS = [
  { surface: 'You never listen!', beneath: 'I feel invisible to you.' },
  { surface: 'I don\'t need anyone.', beneath: 'I\'m terrified of being let down again.' },
  { surface: 'You\'re just like them.', beneath: 'I thought you were safe.' },
  { surface: 'Leave me alone.', beneath: 'Please don\'t give up on me.' },
  { surface: 'Whatever. I don\'t care.', beneath: 'It hurts too much to show I care.' },
];

export default function Diplomat_MirrorShield({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [flipped, setFlipped] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleFlip = (i: number) => {
    if (stage !== 'active' || flipped.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length >= ATTACKS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Connection" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Words can be weapons.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>See their pain before you see their attack.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each phrase to see what's beneath</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '300px' }}>
            {ATTACKS.map((a, i) => {
              const isFlipped = flipped.includes(i);
              return (
                <motion.button key={i} onClick={() => handleFlip(i)}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15, duration: 0.6 }}
                  whileHover={!isFlipped ? { scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '14px 16px', background: isFlipped ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isFlipped ? palette.accentGlow : palette.primaryFaint}`, borderRadius: radius.md, cursor: isFlipped ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.8s' }}>
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
                        style={{ ...navicueType.texture, color: palette.text, fontSize: '13px', fontStyle: 'italic' }}>
                        "{a.surface}"
                      </motion.div>
                    ) : (
                      <motion.div key="b" initial={{ opacity: 0, rotateX: 90 }} animate={{ opacity: 0.6, rotateX: 0 }} transition={{ duration: 0.8 }}
                        style={{ ...navicueType.texture, color: palette.accent, fontSize: '12px' }}>
                        {a.beneath}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '8px' }}>
              {flipped.length} of {ATTACKS.length} decoded
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every attack is a wound speaking.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>When you see the pain, the war ends.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Behind every armor, a heart.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}