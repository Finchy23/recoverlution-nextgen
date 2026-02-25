/**
 * SAGE #9 — The Love Broadcast
 * "Send it outward. To someone easy. Then someone hard. Then everyone."
 * INTERACTION: Three concentric broadcast rings. Tap each ring to
 * broadcast loving-kindness outward — easy → difficult → universal.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Self-Compassion', 'knowing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const BROADCAST_RINGS = [
  { label: 'Someone you love', wish: 'May they be safe. May they be well.', size: 35 },
  { label: 'Someone difficult', wish: 'May they find peace. May they heal.', size: 65 },
  { label: 'All beings, everywhere', wish: 'May all beings be free from suffering.', size: 95 },
];

export default function Sage_LoveBroadcast({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [activeRing, setActiveRing] = useState(-1);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleBroadcast = (i: number) => {
    if (stage !== 'active' || i !== activeRing + 1) return;
    setActiveRing(i);
    if (i >= BROADCAST_RINGS.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Begin with one.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Send it outward. Further and further.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each ring to broadcast</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '240px', height: '240px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Broadcast rings */}
              {BROADCAST_RINGS.map((ring, i) => {
                const isActive = i <= activeRing;
                const isNext = i === activeRing + 1;
                return (
                  <motion.button key={i}
                    onClick={() => handleBroadcast(i)}
                    animate={isActive ? { scale: [1, 1.03, 1], opacity: 0.4 } : { opacity: isNext ? 0.2 : 0.08 }}
                    transition={isActive ? { scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' } } : {}}
                    whileHover={isNext ? { opacity: 0.35 } : undefined}
                    style={{ position: 'absolute', width: `${ring.size}%`, height: `${ring.size}%`, borderRadius: '50%', border: `1px solid ${isActive ? palette.accent : palette.primary}`, background: isActive ? palette.accentGlow : 'transparent', cursor: isNext ? 'pointer' : 'default', padding: 0 }}
                  />
                );
              })}
              {/* Center heart */}
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 16px ${palette.accentGlow}`, zIndex: 1 }} />
            </div>
            {/* Current wish */}
            {activeRing >= 0 && (
              <motion.div key={activeRing} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }}
                style={{ textAlign: 'center', maxWidth: '240px' }}>
                <div style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', marginBottom: '4px' }}>{BROADCAST_RINGS[activeRing].label}</div>
                <div style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '12px', fontStyle: 'italic' }}>{BROADCAST_RINGS[activeRing].wish}</div>
              </motion.div>
            )}
            {activeRing < 0 && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>tap the innermost ring</div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The broadcast is live. Everywhere.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Love is the only signal that strengthens with distance.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            May all beings be free from suffering.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
