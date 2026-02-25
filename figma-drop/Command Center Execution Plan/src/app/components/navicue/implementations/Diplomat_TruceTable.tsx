/**
 * DIPLOMAT #2 — The Truce Table
 * "Every war ends at a table."
 * INTERACTION: An empty table. Place items of good faith one by one —
 * each a concession, an admission, a willingness. When the table
 * is set, the negotiation can begin.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const OFFERINGS = [
  { label: 'I may have been wrong.', x: 25, y: 30 },
  { label: 'I was afraid too.', x: 75, y: 30 },
  { label: 'I want this to work.', x: 50, y: 50 },
  { label: 'I\'m willing to listen.', x: 25, y: 70 },
  { label: 'I choose repair.', x: 75, y: 70 },
];

export default function Diplomat_TruceTable({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePlace = (i: number) => {
    if (stage !== 'active' || placed.includes(i)) return;
    if (i !== placed.length) return;
    const next = [...placed, i];
    setPlaced(next);
    if (next.length >= OFFERINGS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The table is empty.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every war ends at a table.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>place each offering of good faith</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Table surface */}
            <div style={{ width: '260px', height: '220px', position: 'relative', borderRadius: radius.lg, border: `1px solid ${palette.primaryFaint}`, background: 'rgba(255,255,255,0.01)' }}>
              {/* Table edge glow */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: radius.lg, boxShadow: placed.length >= OFFERINGS.length ? `inset 0 0 30px ${palette.accentGlow}` : 'none', transition: 'box-shadow 1.5s' }} />
              {OFFERINGS.map((o, i) => {
                const isPlaced = placed.includes(i);
                const isNext = i === placed.length;
                return (
                  <motion.button key={i} onClick={() => handlePlace(i)}
                    animate={{ opacity: isPlaced ? 0.8 : isNext ? 0.25 : 0.08 }}
                    whileHover={isNext ? { scale: 1.05, opacity: 0.5 } : undefined}
                    style={{ position: 'absolute', left: `${o.x}%`, top: `${o.y}%`, transform: 'translate(-50%, -50%)', background: 'none', border: 'none', cursor: isNext ? 'pointer' : 'default', padding: '8px' }}>
                    <motion.div
                      animate={{ scale: isPlaced ? 1 : 0.85 }}
                      style={{ width: '8px', height: '8px', borderRadius: '50%', background: isPlaced ? palette.accent : palette.primaryFaint, boxShadow: isPlaced ? `0 0 10px ${palette.accentGlow}` : 'none', transition: 'all 0.6s', marginBottom: '4px', marginLeft: 'auto', marginRight: 'auto' }} />
                    {isPlaced && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.5, y: 0 }} transition={{ duration: 0.8 }}
                        style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {o.label}
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {placed.length} of {OFFERINGS.length} placed
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The table is set. The conversation can begin.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Peace starts with presence, not agreement.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Sit down. Stay.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}