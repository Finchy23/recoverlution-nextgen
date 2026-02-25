/**
 * VISIONARY #2 — The Seed Vault
 * "Every future starts as a seed."
 * INTERACTION: Seeds of intention to plant. Tap each to plant it
 * and watch a tiny sprout emerge. Not harvest — just planting.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Behavioral Activation', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SEEDS = [
  { name: 'patience', sprout: '·' },
  { name: 'forgiveness', sprout: '∘' },
  { name: 'courage', sprout: '|' },
  { name: 'presence', sprout: '○' },
  { name: 'trust', sprout: '▵' },
];

export default function Visionary_SeedVault({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [planted, setPlanted] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePlant = (i: number) => {
    if (stage !== 'active' || planted.includes(i)) return;
    const next = [...planted, i];
    setPlanted(next);
    if (next.length >= SEEDS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Behavioral Activation" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Seeds in the dark.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every future starts as a seed.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each to plant it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '280px' }}>
            {SEEDS.map((s, i) => {
              const isPlanted = planted.includes(i);
              return (
                <motion.button key={i} onClick={() => handlePlant(i)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: isPlanted ? 0.8 : 0.3, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={!isPlanted ? { opacity: 0.5, scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isPlanted ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isPlanted ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ ...navicueType.texture, color: palette.text, fontSize: '12px' }}>{s.name}</span>
                  {isPlanted && (
                    <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.6, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      style={{ fontSize: '16px' }}>{s.sprout}</motion.span>
                  )}
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{planted.length} of {SEEDS.length} planted</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You don't need the harvest yet.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Planting is enough for today.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Tend what you planted.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}