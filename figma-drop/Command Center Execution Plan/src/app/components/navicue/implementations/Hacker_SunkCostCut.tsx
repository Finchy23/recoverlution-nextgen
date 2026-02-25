/**
 * HACKER #5 — The Sunk Cost Cut
 * "Don't cling to a mistake just because you spent a long time making it."
 * INTERACTION: A heavy anchor chain. Tap each link to weaken it.
 * When the chain breaks, the boat floats free.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LINKS = [
  { cost: '3 years invested.' },
  { cost: 'All that money spent.' },
  { cost: 'What everyone expects.' },
  { cost: 'The identity you built around it.' },
  { cost: 'The fear of starting over.' },
];

export default function Hacker_SunkCostCut({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cut, setCut] = useState<number[]>([]);
  const [freed, setFreed] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleCut = (i: number) => {
    if (stage !== 'active' || cut.includes(i) || freed) return;
    const next = [...cut, i];
    setCut(next);
    if (next.length >= LINKS.length) {
      setFreed(true);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something heavy.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Don't cling to a mistake just because you spent a long time making it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each link to cut the chain</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%', maxWidth: '280px' }}>
            {/* Boat */}
            <motion.div animate={{ y: freed ? -20 : 0, opacity: freed ? 0.7 : 0.3 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: '40px', height: '20px', borderRadius: '0 0 50% 50%', background: freed ? palette.accent : palette.primaryFaint, margin: '0 auto 8px', boxShadow: freed ? `0 0 16px ${palette.accentGlow}` : 'none' }} />
            {/* Chain links */}
            {LINKS.map((l, i) => {
              const isCut = cut.includes(i);
              return (
                <motion.button key={i} onClick={() => handleCut(i)}
                  animate={{ opacity: isCut ? 0.1 : 0.5, scale: isCut ? 0.9 : 1, x: isCut ? (i % 2 === 0 ? -8 : 8) : 0 }}
                  whileHover={!isCut ? { opacity: 0.7, scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '14px 14px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isCut ? 'transparent' : palette.primaryFaint}`, borderRadius: radius.sm, cursor: isCut ? 'default' : 'pointer', textAlign: 'center' }}>
                  <span style={{ ...navicueType.texture, color: isCut ? palette.textFaint : palette.text, fontSize: '11px', fontStyle: 'italic', textDecoration: isCut ? 'line-through' : 'none' }}>{l.cost}</span>
                </motion.button>
              );
            })}
            {/* Anchor */}
            <motion.div animate={{ opacity: freed ? 0.05 : 0.3, y: freed ? 20 : 0 }}
              transition={{ duration: 1.5 }}
              style={{ width: '16px', height: '16px', borderRadius: '2px', background: palette.primaryFaint, margin: '8px auto 0', transform: 'rotate(45deg)' }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '8px' }}>
              {freed ? 'free' : `${cut.length} of ${LINKS.length} cut`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The anchor is gone. You float.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>What you spent does not own what you choose next.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Let the anchor go.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}