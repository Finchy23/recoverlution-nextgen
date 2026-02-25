/**
 * OUROBOROS #3 — The Seed Return
 * "Every ending is a seed. Every seed is a world."
 * INTERACTION: A tree grows, drops fruit, fruit opens to seed,
 * seed becomes tree. 5 taps advance the cycle. The animation
 * loops — each generation subtly different.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PHASES = ['seed', 'sprout', 'tree', 'fruit', 'return'] as const;

export default function Ouroboros_SeedReturn({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [phase, setPhase] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const advance = () => {
    if (stage !== 'active' || phase >= 5) return;
    const next = phase + 1;
    setPhase(next);
    if (next >= 5) addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  const t = phase / 5;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something stirs in the soil...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every ending contains a seed. Every seed contains a world. The oak dies and becomes the acorn that becomes the oak. Nothing is ever lost, only returned.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to advance each cycle</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={advance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: phase >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(120, ${6 + t * 8}%, ${5 + t * 3}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Seed */}
                {phase >= 1 && <motion.ellipse cx="110" cy="145" rx="4" ry="6" fill={`hsla(30, 22%, 35%, ${0.08})`} initial={{ scale: 0 }} animate={{ scale: phase === 5 ? 1 : phase > 1 ? 0.3 : 1 }} transition={{ duration: 0.6 }} />}
                {/* Sprout */}
                {phase >= 2 && <motion.path d="M 110,145 C 110,130 108,120 110,110" fill="none" stroke={`hsla(120, 18%, 35%, 0.08)`} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />}
                {/* Tree */}
                {phase >= 3 && (
                  <>
                    <motion.path d="M 110,145 L 110,70" fill="none" stroke={`hsla(30, 15%, 28%, 0.06)`} strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
                    <motion.circle cx="110" cy="55" r="30" fill={`hsla(120, 15%, 28%, 0.04)`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} />
                  </>
                )}
                {/* Fruit */}
                {phase >= 4 && (
                  <>
                    {[85, 110, 135].map((fx, i) => (
                      <motion.circle key={`fruit-${i}`} cx={fx} cy={45 + i * 8} r="4" fill={`hsla(25, 25%, 40%, 0.06)`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: i * 0.15 }} />
                    ))}
                  </>
                )}
                {/* Return — fruit falls, becomes seed */}
                {phase >= 5 && (
                  <motion.path d="M 110,60 C 115,90 105,120 110,145" fill="none" stroke={`hsla(38, 18%, 40%, 0.05)`} strokeWidth="0.5" strokeDasharray="3 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
                )}
                <text x="110" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace" fill={`hsla(120, 10%, 40%, ${0.05 + t * 0.04})`}>{phase < 5 ? PHASES[phase]?.toUpperCase() ?? '' : 'ETERNAL'}</text>
              </svg>
            </div>
            <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {phase === 0 ? 'Seed → Sprout → Tree → Fruit → Seed.' : phase === 1 ? 'The seed remembers the tree.' : phase === 2 ? 'The sprout reaches for what it has never seen.' : phase === 3 ? 'The tree forgets it was ever a seed.' : phase === 4 ? 'The fruit falls. Inside: a seed.' : 'The return. Always the return.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < phase ? 'hsla(120, 20%, 45%, 0.5)' : palette.primaryFaint, opacity: i < phase ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Seed, sprout, tree, fruit, seed. The cycle completes and begins again. Every ending you have ever experienced was a seed that you couldn't yet see. Every loss contained its own return.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Ecological truth: a single oak produces 70,000 acorns per year across 200 years. 14 million potential trees from one death. The mathematics of return always exceed the mathematics of loss.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Seed. Tree. Fruit. Seed.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}